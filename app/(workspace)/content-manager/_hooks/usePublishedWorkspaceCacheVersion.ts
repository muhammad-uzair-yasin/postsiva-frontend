"use client";

import { useSyncExternalStore } from "react";

import {
  getPublishedPostsWorkspaceCacheVersion,
  subscribePublishedPostsWorkspaceCache,
} from "@/lib/contentManager/publishedPostsWorkspaceCache";

/** Re-render when shared published cache updates (e.g. hydrator finished). */
export function usePublishedWorkspaceCacheVersion(): number {
  return useSyncExternalStore(
    subscribePublishedPostsWorkspaceCache,
    getPublishedPostsWorkspaceCacheVersion,
    getPublishedPostsWorkspaceCacheVersion,
  );
}
