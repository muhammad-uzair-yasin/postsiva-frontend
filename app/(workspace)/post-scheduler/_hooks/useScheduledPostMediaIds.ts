"use client";

import { useMemo, useSyncExternalStore } from "react";

import { getStoredActiveWorkspaceId } from "@/lib/auth/session";
import { collectMediaIdsFromScheduledPostData } from "@/lib/post-composer/collectScheduledPostMediaIds";
import {
  getAllScheduledPostsWorkspaceCacheForWorkspace,
  getScheduledPostsWorkspaceCacheVersion,
  subscribeScheduledPostsWorkspaceCache,
} from "@/lib/contentManager/scheduledPostsWorkspaceCache";

const ACTIVE_SCHEDULED_STATUSES = new Set(["scheduled", "publishing", "failed"]);

/**
 * Media IDs from Calendar-cached scheduled posts only.
 * Does not call GET /unified/scheduled-posts.
 */
export function useScheduledPostMediaIds(shouldLoad: boolean): ReadonlySet<string> {
  const cacheVersion = useSyncExternalStore(
    subscribeScheduledPostsWorkspaceCache,
    getScheduledPostsWorkspaceCacheVersion,
    getScheduledPostsWorkspaceCacheVersion,
  );

  return useMemo((): ReadonlySet<string> => {
    void cacheVersion;
    if (!shouldLoad) {
      return new Set();
    }
    const workspaceId = getStoredActiveWorkspaceId();
    if (!workspaceId?.trim()) {
      return new Set();
    }
    const next = new Set<string>();
    const posts = getAllScheduledPostsWorkspaceCacheForWorkspace(workspaceId);
    for (const post of posts) {
      if (!ACTIVE_SCHEDULED_STATUSES.has(post.status)) {
        continue;
      }
      for (const id of collectMediaIdsFromScheduledPostData(post.post_data)) {
        next.add(id);
      }
    }
    return next;
  }, [cacheVersion, shouldLoad]);
}
