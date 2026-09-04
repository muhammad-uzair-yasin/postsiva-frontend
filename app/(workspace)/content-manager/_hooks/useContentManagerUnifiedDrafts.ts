"use client";

import { useEffect, useMemo, useState } from "react";

import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import {
  CONTENT_MANAGER_DRAFT_REFRESH_EVENT,
  type ContentManagerDraftRefreshDetail,
} from "@/lib/contentManager/contentManagerDraftRefresh";

import { useWorkspaceHeaderAccounts } from "../../_components/WorkspaceHeaderAccountsProvider";
import type { ContentManagerPost } from "../_types/contentManagerTypes";
import { fetchContentManagerDraftPostsForAccount } from "../_utils/fetchContentManagerDraftPostsForAccount";

function filterHiddenDrafts(
  posts: ContentManagerPost[],
  hiddenIds: ReadonlySet<string>,
): ContentManagerPost[] {
  if (hiddenIds.size === 0) {
    return posts;
  }
  return posts.filter((post) => {
    const id = post.sourceDraftId?.trim();
    return !id || !hiddenIds.has(id);
  });
}

export function useContentManagerUnifiedDrafts(
  enabled: boolean,
  /** Increment to refetch drafts after a draft is updated elsewhere. */
  refreshKey = 0,
): {
  draftPosts: ContentManagerPost[];
  isLoading: boolean;
  error: string | null;
} {
  const { selectedAccount, isLoadingProfiles } = useWorkspaceHeaderAccounts();
  const [fetchedPosts, setFetchedPosts] = useState<ContentManagerPost[]>([]);
  const [hiddenDraftIds, setHiddenDraftIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onDraftRefresh = (event: Event): void => {
      const draftId = (event as CustomEvent<ContentManagerDraftRefreshDetail>)
        .detail?.draftId;
      if (draftId?.trim()) {
        setHiddenDraftIds((prev) => new Set([...prev, draftId.trim()]));
      }
    };
    window.addEventListener(CONTENT_MANAGER_DRAFT_REFRESH_EVENT, onDraftRefresh);
    return () => {
      window.removeEventListener(
        CONTENT_MANAGER_DRAFT_REFRESH_EVENT,
        onDraftRefresh,
      );
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      setFetchedPosts([]);
      setError(null);
      setIsLoading(false);
      return;
    }
    if (isLoadingProfiles) {
      setError(null);
      setFetchedPosts((current) => {
        queueMicrotask(() => setIsLoading(current.length === 0));
        return current;
      });
      return;
    }
    if (!selectedAccount) {
      setFetchedPosts([]);
      setError(null);
      setIsLoading(false);
      return;
    }
    const token = getStoredAccessToken();
    const workspaceId = getStoredActiveWorkspaceId();
    if (!token?.trim() || !workspaceId?.trim()) {
      setFetchedPosts([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    const ac = new AbortController();
    setIsLoading(true);
    setError(null);

    void fetchContentManagerDraftPostsForAccount(
      token,
      workspaceId,
      selectedAccount,
      ac.signal,
    )
      .then((posts) => {
        if (ac.signal.aborted) {
          return;
        }
        setFetchedPosts(posts);
        setError(null);
        setHiddenDraftIds((prev) => {
          const next = new Set(prev);
          for (const post of posts) {
            const id = post.sourceDraftId?.trim();
            if (id) {
              next.delete(id);
            }
          }
          return next;
        });
      })
      .catch((e: unknown) => {
        if (ac.signal.aborted) {
          return;
        }
        setFetchedPosts([]);
        setError(e instanceof Error ? e.message : "Could not load drafts.");
      })
      .finally(() => {
        if (!ac.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => {
      ac.abort();
    };
  }, [enabled, isLoadingProfiles, selectedAccount, refreshKey]);

  const draftPosts = useMemo(
    () => filterHiddenDrafts(fetchedPosts, hiddenDraftIds),
    [fetchedPosts, hiddenDraftIds],
  );

  return { draftPosts, isLoading, error };
}
