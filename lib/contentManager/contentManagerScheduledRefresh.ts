import { invalidateScheduledPostsWorkspaceCache } from "@/lib/contentManager/scheduledPostsWorkspaceCache";
import { linkedInScheduledHeaderAccountIds } from "@/lib/workspace/linkedInScheduledPlatformUserId";

export const CONTENT_MANAGER_SCHEDULED_REFRESH_EVENT =
  "postsiva:content-manager-scheduled-refresh";

export interface ContentManagerScheduledRefreshDetail {
  readonly workspaceId?: string;
  /** When set, drop cached scheduled rows for these header account ids before listeners refetch. */
  readonly invalidateAccountIds?: readonly string[];
}

export function invalidateLinkedInScheduledPostsWorkspaceCaches(
  workspaceId: string,
  headerAccountIds: readonly string[],
): void {
  for (const accountId of linkedInScheduledHeaderAccountIds(headerAccountIds)) {
    invalidateScheduledPostsWorkspaceCache(workspaceId, accountId);
  }
}

export function dispatchContentManagerScheduledRefresh(
  detail?: ContentManagerScheduledRefreshDetail,
): void {
  if (typeof window === "undefined") {
    return;
  }
  const workspaceId = detail?.workspaceId?.trim();
  if (workspaceId && detail?.invalidateAccountIds?.length) {
    for (const accountId of detail.invalidateAccountIds) {
      const trimmed = accountId.trim();
      if (trimmed) {
        invalidateScheduledPostsWorkspaceCache(workspaceId, trimmed);
      }
    }
  }
  window.dispatchEvent(
    new CustomEvent(CONTENT_MANAGER_SCHEDULED_REFRESH_EVENT, { detail }),
  );
}
