"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import { fetchUnifiedPosts } from "@/lib/contentManager/unifiedPostsApi";

import { useWorkspaceHeaderAccounts } from "../../_components/WorkspaceHeaderAccountsProvider";

import type { ContentManagerPost } from "../_types/contentManagerTypes";
import { mapUnifiedLinkedinToContentManagerPosts } from "../_utils/mapUnifiedLinkedinPosts";
import { mergePublishedPostsById } from "../_utils/mergePublishedPostsById";
import {
  filterPublishedCachePosts,
  resolvePublishedPostsInitialLoad,
} from "../_utils/publishedPostsInitialLoad";
import { useMergePublishedPosts } from "./useMergePublishedPosts";
import { usePublishedWorkspaceCacheVersion } from "./usePublishedWorkspaceCacheVersion";
import { clearPublishedPostsIfNeeded, setPublishedPostsIfChanged } from "./setPublishedPostsIfChanged";
import {
  PUBLISHED_REFRESH_MERGE_LIMIT,
} from "../_utils/publishedUnifiedRefreshConstants";

type LoadKind = "initial" | "refresh";

export function usePublishedLinkedinUnifiedPosts(
  linkedinHandleLabel: string,
  linkedinOrganizationId: string | null,
  options?: { skip?: boolean; limit?: number },
): {
  posts: ContentManagerPost[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  mergePosts: (incoming: ContentManagerPost[]) => void;
} {
  const skip = options?.skip ?? false;
  /** Initial / normal load: 50 for personal and org; override via `options.limit`. */
  const limit = options?.limit ?? PUBLISHED_REFRESH_MERGE_LIMIT;
  const [posts, setPosts] = useState<ContentManagerPost[]>([]);
  const [isLoading, setIsLoading] = useState(!skip);
  const [error, setError] = useState<string | null>(null);
  const mergePosts = useMergePublishedPosts(setPosts);

  const workspaceId = getStoredActiveWorkspaceId();
  const token = getStoredAccessToken();
  const { selectedAccount, isLoadingProfiles } = useWorkspaceHeaderAccounts();
  const publishedCacheVersion = usePublishedWorkspaceCacheVersion();

  const load = useCallback(
    async (kind: LoadKind): Promise<void> => {
      if (skip) {
        setPosts([]);
        setIsLoading(false);
        setError(null);
        return;
      }
      if (!workspaceId || !token) {
        setPosts([]);
        setIsLoading(false);
        setError(null);
        return;
      }
      const isRefresh = kind === "refresh";
      const isLinkedinPersonal = !linkedinOrganizationId;
      const orgIds = linkedinOrganizationId ? [linkedinOrganizationId] : [];

      const requestLimit =
        isRefresh && linkedinOrganizationId
          ? PUBLISHED_REFRESH_MERGE_LIMIT
          : limit;

      setIsLoading(true);
      setError(null);
      try {
        let data: Awaited<ReturnType<typeof fetchUnifiedPosts>>;

        if (isRefresh && isLinkedinPersonal) {
          try {
            await fetchUnifiedPosts(token, workspaceId, {
              platforms: ["linkedin"],
              limit,
              stats: true,
              forceRefresh: true,
              allowPaidLinkedinRefresh: true,
              linkedinOrganizationIds: [],
            });
          } catch {
            /* Best-effort: still load list without forcing full refresh. */
          }
          data = await fetchUnifiedPosts(token, workspaceId, {
            platforms: ["linkedin"],
            limit: PUBLISHED_REFRESH_MERGE_LIMIT,
            stats: true,
            forceRefresh: false,
            refreshPosts: false,
            refreshStats: false,
            linkedinOrganizationIds: [],
          });
        } else {
          data = await fetchUnifiedPosts(token, workspaceId, {
            platforms: ["linkedin"],
            limit: requestLimit,
            stats: true,
            forceRefresh: isRefresh,
            linkedinOrganizationIds: orgIds,
          });
        }

        if (!data.success) {
          if (!isRefresh) {
            setPosts([]);
          }
          setError(data.message ?? "Could not load LinkedIn posts");
          return;
        }
        const mapped = mapUnifiedLinkedinToContentManagerPosts(
          data.linkedin ?? null,
          linkedinHandleLabel,
        );
        if (isRefresh) {
          setPosts((prev) => mergePublishedPostsById(prev, mapped));
        } else {
          setPosts(mapped);
        }
      } catch (e) {
        if (!isRefresh) {
          setPosts([]);
        }
        setError(e instanceof Error ? e.message : "Could not load LinkedIn posts");
      } finally {
        setIsLoading(false);
      }
    },
    [limit, linkedinHandleLabel, linkedinOrganizationId, skip, token, workspaceId],
  );

  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
    const channelFilter = linkedinOrganizationId
      ? `linkedin:${linkedinOrganizationId}`
      : "linkedin";
    const decision = resolvePublishedPostsInitialLoad({
      skip,
      isLoadingProfiles,
      accountId: selectedAccount?.id,
      workspaceId,
      token,
      limit,
    });
    if (decision === "skip") {
      clearPublishedPostsIfNeeded(setPosts);
      setIsLoading(false);
      setError(null);
      return;
    }
    if (decision === "wait") {
      setPosts((current) => {
        queueMicrotask(() => setIsLoading(current.length === 0));
        return current;
      });
      return;
    }
    if (typeof decision === "object") {
      const fromCache = filterPublishedCachePosts(
        decision.cache,
        "linkedin",
        channelFilter,
      );
      if (fromCache.length > 0 || !linkedinOrganizationId) {
        setPublishedPostsIfChanged(setPosts, fromCache);
        setIsLoading(false);
        setError(null);
        return;
      }
    }
    void loadRef.current("initial");
  }, [isLoadingProfiles, limit, linkedinOrganizationId, publishedCacheVersion, selectedAccount?.id, skip, token, workspaceId]);

  return {
    posts,
    isLoading,
    error,
    refresh: () => load("refresh"),
    mergePosts,
  };
}
