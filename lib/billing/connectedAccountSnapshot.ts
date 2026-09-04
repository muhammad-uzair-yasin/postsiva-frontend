import { peekUnifiedUserProfilesCache } from "@/lib/dashboard/channelProfileApi";
import type { SocialOAuthTokenStatusMap } from "@/lib/social/unifiedOAuthApi";
import {
  peekSocialOAuthTokenStatusCache,
  SOCIAL_OAUTH_TOKEN_STATUS_PLATFORMS,
} from "@/lib/social/unifiedOAuthApi";
import { getAdPlatformOAuthApiKey } from "@/lib/workspaces/workspaceAdPlatformConnection";
import { unifiedProfilesToHeaderAccounts } from "@/lib/workspace/unifiedProfilesToHeaderAccounts";

import type { BillingUsage } from "./billingApi";

export interface ConnectedAccountSnapshot {
  readonly oauthTokenStatus: SocialOAuthTokenStatusMap | null;
  readonly unifiedProfiles: Record<string, unknown> | null;
}

export function buildConnectedAccountSnapshotFromWorkspace(
  workspaceId: string | null | undefined,
): ConnectedAccountSnapshot {
  if (!workspaceId?.trim()) {
    return { oauthTokenStatus: null, unifiedProfiles: null };
  }
  return {
    oauthTokenStatus: peekSocialOAuthTokenStatusCache(workspaceId),
    unifiedProfiles: peekUnifiedUserProfilesCache(workspaceId),
  };
}

export function countConnectedOAuthPlatforms(
  status: SocialOAuthTokenStatusMap | null,
): number {
  if (!status) {
    return 0;
  }
  return SOCIAL_OAUTH_TOKEN_STATUS_PLATFORMS.filter((platform) => status[platform] === true)
    .length;
}

export function countConnectedPublishIdentities(
  unifiedProfiles: Record<string, unknown> | null,
): number {
  return unifiedProfilesToHeaderAccounts(unifiedProfiles).length;
}

function countDistinctPlatformsFromProfiles(
  unifiedProfiles: Record<string, unknown> | null,
): number {
  const rows = unifiedProfilesToHeaderAccounts(unifiedProfiles);
  if (rows.length === 0) {
    return 0;
  }
  return new Set(rows.map((row) => row.iconId)).size;
}

/** Best-effort live count: billing API plus OAuth token flags and unified profile rows. */
export function resolveConnectedAccountUsageCount(
  usage: BillingUsage,
  snapshot: ConnectedAccountSnapshot | null | undefined,
): number {
  const billingCount = usage.usage_counts.connected_accounts;
  if (!snapshot) {
    return billingCount;
  }

  const oauthCount = countConnectedOAuthPlatforms(snapshot.oauthTokenStatus);
  const platformCountFromProfiles = countDistinctPlatformsFromProfiles(
    snapshot.unifiedProfiles,
  );
  const identityCount = countConnectedPublishIdentities(snapshot.unifiedProfiles);
  const mode = usage.limits.connected_account_mode ?? "publish_identity";

  if (mode === "oauth_platform") {
    return Math.max(billingCount, oauthCount, platformCountFromProfiles);
  }

  return Math.max(
    billingCount,
    identityCount,
    oauthCount > 0 ? Math.max(identityCount, 1) : identityCount,
  );
}

export function isPlatformAlreadyConnectedInSnapshot(
  snapshot: ConnectedAccountSnapshot | null | undefined,
  adPlatformId: string | null | undefined,
): boolean {
  if (!adPlatformId?.trim()) {
    return false;
  }
  const oauthKey = getAdPlatformOAuthApiKey(adPlatformId);
  if (
    oauthKey &&
    snapshot?.oauthTokenStatus?.[oauthKey as keyof SocialOAuthTokenStatusMap] === true
  ) {
    return true;
  }
  const rows = unifiedProfilesToHeaderAccounts(snapshot?.unifiedProfiles ?? null);
  return rows.some((row) => row.iconId === adPlatformId);
}
