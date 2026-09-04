import { headerAccountRowToUnifiedScheduledPostsQuery } from "@/app/(workspace)/content-manager/_utils/headerAccountRowToUnifiedScheduledPostsQuery";
import { refreshPublishedPostsForInbox } from "@/lib/inbox/refreshPublishedPostsForInbox";
import {
  isPublishedPostsWorkspaceCacheHydrated,
  notifyPublishedPostsWorkspaceCacheListeners,
} from "@/lib/contentManager/publishedPostsWorkspaceCache";
import {
  isScheduledPostsWorkspaceCacheHydrated,
  setScheduledPostsWorkspaceCache,
} from "@/lib/contentManager/scheduledPostsWorkspaceCache";
import { isWordPressUnifiedPlatform } from "@/lib/social/unifiedBlogPlatform";
import { fetchAllActiveWorkspaceScheduledPosts } from "@/lib/social/fetchWorkspaceScheduledPosts";
import { isWorkspaceHeaderAllPlatformsId } from "@/lib/workspace/workspaceHeaderAllPlatforms";
import type { WorkspaceHeaderAccountRow } from "@/lib/workspace/headerAccountsTypes";
import type { UnifiedPublishedLabels } from "@/app/(workspace)/content-manager/_utils/mapFullUnifiedPostsResponseToPublishedPosts";

const publishedInflight = new Map<string, Promise<void>>();
const scheduledInflight = new Map<string, Promise<void>>();

function accountKey(workspaceId: string, accountId: string): string {
  return `${workspaceId.trim()}\u0000${accountId.trim()}`;
}

/** True while ensurePublishedPostsForSelectedAccount is in flight for this account. */
export function isPublishedPostsEnsureInFlight(
  workspaceId: string,
  accountId: string,
): boolean {
  return publishedInflight.has(accountKey(workspaceId, accountId));
}

export interface EnsureSelectedAccountPostsInput {
  readonly accessToken: string;
  readonly workspaceId: string;
  readonly selectedAccount: WorkspaceHeaderAccountRow;
  readonly labels: UnifiedPublishedLabels;
  readonly unifiedProfiles?: Record<string, unknown> | null;
}

/**
 * Cold-cache only: GET /unified/posts/ for the selected account with forceRefresh=false.
 * No-ops when the published workspace cache already has an entry. Singleflight per account.
 */
export async function ensurePublishedPostsForSelectedAccount(
  input: EnsureSelectedAccountPostsInput,
): Promise<void> {
  const { accessToken, workspaceId, selectedAccount, labels } = input;
  const accountId = selectedAccount.id?.trim();
  if (!accountId || selectedAccount.disabled) {
    return;
  }
  if (isPublishedPostsWorkspaceCacheHydrated(workspaceId, accountId)) {
    return;
  }

  const key = accountKey(workspaceId, accountId);
  const existing = publishedInflight.get(key);
  if (existing) {
    await existing;
    return;
  }

  const run = refreshPublishedPostsForInbox({
    accessToken,
    workspaceId,
    accountId,
    selectedAccount,
    labels,
    forceRefresh: false,
  }).then(() => undefined);

  publishedInflight.set(key, run);
  try {
    await run;
  } finally {
    publishedInflight.delete(key);
    // Wake CM hooks that returned "wait" for this inflight (success or failure).
    notifyPublishedPostsWorkspaceCacheListeners();
  }
}

/**
 * Cold-cache only: GET /unified/scheduled-posts for the selected account (no WordPress blog).
 * Singleflight per account.
 */
export async function ensureScheduledPostsForSelectedAccount(
  input: Omit<EnsureSelectedAccountPostsInput, "labels">,
): Promise<void> {
  const { accessToken, workspaceId, selectedAccount, unifiedProfiles } = input;
  const accountId = selectedAccount.id?.trim();
  if (!accountId || selectedAccount.disabled) {
    return;
  }
  if (isScheduledPostsWorkspaceCacheHydrated(workspaceId, accountId)) {
    return;
  }

  const key = accountKey(workspaceId, accountId);
  const existing = scheduledInflight.get(key);
  if (existing) {
    await existing;
    return;
  }

  const run = (async (): Promise<void> => {
    const allPlatforms = isWorkspaceHeaderAllPlatformsId(selectedAccount.id);
    const scheduledQuery = headerAccountRowToUnifiedScheduledPostsQuery({
      row: selectedAccount,
      unifiedProfiles,
    });
    const platform = allPlatforms ? null : scheduledQuery.platform;

    if (isWordPressUnifiedPlatform(platform)) {
      setScheduledPostsWorkspaceCache(workspaceId, accountId, []);
      return;
    }

    const rows = await fetchAllActiveWorkspaceScheduledPosts(accessToken, workspaceId, {
      platform,
      platformUserId: allPlatforms ? null : scheduledQuery.platformUserId,
      includeBlog: false,
    });
    setScheduledPostsWorkspaceCache(workspaceId, accountId, rows);
  })();

  scheduledInflight.set(key, run);
  try {
    await run;
  } finally {
    scheduledInflight.delete(key);
  }
}

/** Published + scheduled cold hydrate. Prefer Calendar hooks for scheduled; Inbox/CM use published-only hydrator. */
export async function ensureSelectedAccountPostsHydrated(
  input: EnsureSelectedAccountPostsInput,
): Promise<void> {
  await Promise.all([
    ensurePublishedPostsForSelectedAccount(input),
    ensureScheduledPostsForSelectedAccount(input),
  ]);
}
