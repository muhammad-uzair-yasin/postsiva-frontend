"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import {
  fetchUnifiedPostsAllPlatforms,
  type UnifiedPostsApiResponse,
} from "@/lib/contentManager/unifiedPostsApi";

import { useWorkspaceHeaderAccounts } from "../../_components/WorkspaceHeaderAccountsProvider";

import type { ContentManagerPost } from "../_types/contentManagerTypes";
import { useMergePublishedPosts } from "./useMergePublishedPosts";
import { usePublishedWorkspaceCacheVersion } from "./usePublishedWorkspaceCacheVersion";
import { clearPublishedPostsIfNeeded, setPublishedPostsIfChanged } from "./setPublishedPostsIfChanged";
import {
  mapFullUnifiedPostsResponseToPublishedPosts,
  type UnifiedPublishedLabels,
} from "../_utils/mapFullUnifiedPostsResponseToPublishedPosts";
import { resolvePublishedPostsInitialLoad } from "../_utils/publishedPostsInitialLoad";
import { PUBLISHED_REFRESH_MERGE_LIMIT } from "../_utils/publishedUnifiedRefreshConstants";

const ALL_PLATFORMS_PUBLISHED_LIMIT = 50;

export function usePublishedAllPlatformsUnifiedPosts(
  enabled: boolean,
  labels: UnifiedPublishedLabels,
  options?: { limit?: number },
): {
  posts: ContentManagerPost[];
  isLoading: boolean;
  error: string | null;
  refresh: (forceRefresh?: boolean) => Promise<void>;
  mergePosts: (incoming: ContentManagerPost[]) => void;
} {
  const limit = options?.limit ?? ALL_PLATFORMS_PUBLISHED_LIMIT;
  const [posts, setPosts] = useState<ContentManagerPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mergePosts = useMergePublishedPosts(setPosts);

  const workspaceId = getStoredActiveWorkspaceId();
  const token = getStoredAccessToken();
  const { selectedAccount, isLoadingProfiles } = useWorkspaceHeaderAccounts();
  const publishedCacheVersion = usePublishedWorkspaceCacheVersion();

  const applyResponse = useCallback(
    (data: UnifiedPostsApiResponse): void => {
      if (!data.success) {
        setPosts([]);
        setError(data.message ?? "Could not load posts");
        return;
      }
      setPosts(mapFullUnifiedPostsResponseToPublishedPosts(data, labels));
      setError(null);
    },
    [labels],
  );

  const load = useCallback(async (forceRefresh?: boolean): Promise<void> => {
    if (!enabled || !workspaceId || !token) {
      setPosts([]);
      setIsLoading(false);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const isRefresh = forceRefresh ?? false;
      const data = await fetchUnifiedPostsAllPlatforms(token, workspaceId, {
        limit: isRefresh ? PUBLISHED_REFRESH_MERGE_LIMIT : limit,
        forceRefresh: isRefresh,
      });
      applyResponse(data);
    } catch (e) {
      setPosts([]);
      setError(e instanceof Error ? e.message : "Could not load posts");
    } finally {
      setIsLoading(false);
    }
  }, [applyResponse, enabled, limit, token, workspaceId]);

  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
    const decision = resolvePublishedPostsInitialLoad({
      skip: !enabled,
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
      setPublishedPostsIfChanged(setPosts, decision.cache);
      setIsLoading(false);
      setError(null);
      return;
    }
    void loadRef.current(false);
  }, [enabled, isLoadingProfiles, limit, publishedCacheVersion, selectedAccount?.id, token, workspaceId]);

  return {
    posts,
    isLoading,
    error,
    refresh: (forceRefresh?: boolean) => load(forceRefresh ?? false),
    mergePosts,
  };
}
