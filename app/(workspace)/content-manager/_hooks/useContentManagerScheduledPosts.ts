"use client";

import { useMemo, useSyncExternalStore } from "react";

import { getStoredActiveWorkspaceId } from "@/lib/auth/session";
import {
  getScheduledPostsWorkspaceCache,
  getScheduledPostsWorkspaceCacheVersion,
  isScheduledPostsWorkspaceCacheHydrated,
  subscribeScheduledPostsWorkspaceCache,
} from "@/lib/contentManager/scheduledPostsWorkspaceCache";
import { getStoredHeaderAccountId } from "@/lib/workspace/headerAccountSelection";

import { useWorkspaceHeaderAccounts } from "../../_components/WorkspaceHeaderAccountsProvider";
import type { ContentManagerPost } from "../_types/contentManagerTypes";
import { contentManagerScheduledPostMatchesChannelFilter } from "../_utils/contentManagerScheduledPostMatchesChannelFilter";
import { mapUnifiedScheduledPostToContentManagerPost } from "../_utils/mapUnifiedScheduledPostToContentManagerPost";
import { contentManagerChannelFromHeaderAccount } from "../_utils/contentManagerChannelFromHeaderAccount";

/**
 * Reads scheduled posts from the Calendar-filled workspace cache only.
 * Does not call GET /unified/scheduled-posts — that fetch is Calendar-only.
 */
export function useContentManagerScheduledPosts(
  enabled: boolean,
  _refreshKey = 0,
): {
  scheduledPosts: ContentManagerPost[];
  isLoading: boolean;
  error: string | null;
} {
  const { selectedAccount, isLoadingProfiles } = useWorkspaceHeaderAccounts();
  const cacheVersion = useSyncExternalStore(
    subscribeScheduledPostsWorkspaceCache,
    getScheduledPostsWorkspaceCacheVersion,
    getScheduledPostsWorkspaceCacheVersion,
  );

  return useMemo((): {
    scheduledPosts: ContentManagerPost[];
    isLoading: boolean;
    error: string | null;
  } => {
    void cacheVersion;
    void _refreshKey;

    if (!enabled) {
      return { scheduledPosts: [], isLoading: false, error: null };
    }

    const workspaceId = getStoredActiveWorkspaceId();
    const accountId =
      selectedAccount?.id?.trim() ||
      (workspaceId ? getStoredHeaderAccountId(workspaceId) : null) ||
      "";

    if (!workspaceId?.trim() || !accountId) {
      return {
        scheduledPosts: [],
        isLoading: isLoadingProfiles,
        error: null,
      };
    }

    if (!isScheduledPostsWorkspaceCacheHydrated(workspaceId, accountId)) {
      // Calendar has not loaded scheduled for this account yet.
      return {
        scheduledPosts: [],
        isLoading: Boolean(isLoadingProfiles && !selectedAccount),
        error: null,
      };
    }

    const rows = getScheduledPostsWorkspaceCache(workspaceId, accountId) ?? [];
    const scheduledOnly = rows.filter((p) => p.status === "scheduled");
    const mapped = scheduledOnly.map(mapUnifiedScheduledPostToContentManagerPost);
    const channelFilter = selectedAccount
      ? contentManagerChannelFromHeaderAccount(selectedAccount)
      : null;
    return {
      scheduledPosts: channelFilter
        ? mapped.filter((post) =>
            contentManagerScheduledPostMatchesChannelFilter(post, channelFilter),
          )
        : mapped,
      isLoading: false,
      error: null,
    };
  }, [
    _refreshKey,
    cacheVersion,
    enabled,
    isLoadingProfiles,
    selectedAccount,
  ]);
}
