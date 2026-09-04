"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import { fetchUnifiedPosts } from "@/lib/contentManager/unifiedPostsApi";

import { useWorkspaceHeaderAccounts } from "../../_components/WorkspaceHeaderAccountsProvider";

import type { ContentManagerPost } from "../_types/contentManagerTypes";
import { mapUnifiedYoutubeToContentManagerPosts } from "../_utils/mapUnifiedYoutubePosts";
import { mergePublishedPostsById } from "../_utils/mergePublishedPostsById";
import {
  filterPublishedCachePosts,
  resolvePublishedPostsInitialLoad,
} from "../_utils/publishedPostsInitialLoad";
import { useMergePublishedPosts } from "./useMergePublishedPosts";
import { usePublishedWorkspaceCacheVersion } from "./usePublishedWorkspaceCacheVersion";
import { clearPublishedPostsIfNeeded, setPublishedPostsIfChanged } from "./setPublishedPostsIfChanged";
import { PUBLISHED_REFRESH_MERGE_LIMIT } from "../_utils/publishedUnifiedRefreshConstants";

const DEFAULT_PUBLISHED_LIMIT = 50;

type LoadKind = "initial" | "refresh";

export function usePublishedYoutubeUnifiedPosts(
  youtubeHandleLabel: string,
  options?: { skip?: boolean; limit?: number },
): {
  posts: ContentManagerPost[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  mergePosts: (incoming: ContentManagerPost[]) => void;
} {
  const skip = options?.skip ?? false;
  const limit = options?.limit ?? DEFAULT_PUBLISHED_LIMIT;
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
      const requestLimit = isRefresh ? PUBLISHED_REFRESH_MERGE_LIMIT : limit;
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchUnifiedPosts(token, workspaceId, {
          platforms: ["youtube"],
          limit: requestLimit,
          stats: true,
          forceRefresh: isRefresh,
          youtubeChannelId: selectedAccount?.targetResourceId ?? undefined,
        });
        if (!data.success) {
          if (!isRefresh) {
            setPosts([]);
          }
          setError(data.message ?? "Could not load YouTube posts");
          return;
        }
        const mapped = mapUnifiedYoutubeToContentManagerPosts(
          data.youtube ?? null,
          youtubeHandleLabel,
          selectedAccount?.targetResourceId ?? undefined,
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
        setError(e instanceof Error ? e.message : "Could not load YouTube posts");
      } finally {
        setIsLoading(false);
      }
    },
    [limit, selectedAccount?.targetResourceId, skip, token, workspaceId, youtubeHandleLabel],
  );

  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
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
      setPublishedPostsIfChanged(setPosts, filterPublishedCachePosts(decision.cache, "youtube"));
      setIsLoading(false);
      setError(null);
      return;
    }
    void loadRef.current("initial");
  }, [isLoadingProfiles, limit, publishedCacheVersion, selectedAccount?.id, skip, token, workspaceId]);

  return {
    posts,
    isLoading,
    error,
    refresh: () => load("refresh"),
    mergePosts,
  };
}
