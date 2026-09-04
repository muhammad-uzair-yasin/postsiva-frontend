"use client";

import { useMemo, useSyncExternalStore } from "react";

import { useWorkspaceHeaderAccounts } from "@/app/(workspace)/_components/WorkspaceHeaderAccountsProvider";
import { getStoredActiveWorkspaceId } from "@/lib/auth/session";
import {
  getPublishedPostsWorkspaceCache,
  getPublishedPostsWorkspaceCacheVersion,
  isPublishedPostsWorkspaceCacheHydrated,
  subscribePublishedPostsWorkspaceCache,
} from "@/lib/contentManager/publishedPostsWorkspaceCache";
import type { ContentManagerPost } from "@/app/(workspace)/content-manager/_types/contentManagerTypes";

/**
 * Inbox sidebar: reads the same published post list as Content Manager → Published
 * ({@link setPublishedPostsWorkspaceCache}). When the cache is cold,
 * `needsPublishedPostsApiHydration` is true (loading UI) while
 * {@link SelectedAccountPostsHydrator} fills the cache.
 */
export function useInboxPublishedPostsFromCache(): {
  publishedPosts: ContentManagerPost[];
  error: string | null;
  needsPublishedPostsApiHydration: boolean;
} {
  const { selectedAccountId } = useWorkspaceHeaderAccounts();
  const version = useSyncExternalStore(
    subscribePublishedPostsWorkspaceCache,
    getPublishedPostsWorkspaceCacheVersion,
    getPublishedPostsWorkspaceCacheVersion,
  );

  const { publishedPosts, needsPublishedPostsApiHydration } = useMemo((): {
    publishedPosts: ContentManagerPost[];
    needsPublishedPostsApiHydration: boolean;
  } => {
    void version;
    const ws = getStoredActiveWorkspaceId();
    if (!ws?.trim() || !selectedAccountId?.trim()) {
      return { publishedPosts: [], needsPublishedPostsApiHydration: false };
    }
    const hydrated = isPublishedPostsWorkspaceCacheHydrated(
      ws,
      selectedAccountId,
    );
    const posts = getPublishedPostsWorkspaceCache(ws, selectedAccountId) ?? [];
    return {
      publishedPosts: posts,
      needsPublishedPostsApiHydration: !hydrated,
    };
  }, [version, selectedAccountId]);

  return { publishedPosts, error: null, needsPublishedPostsApiHydration };
}
