import {
  fetchUnifiedUserProfiles,
  peekUnifiedUserProfilesCache,
} from "@/lib/dashboard/channelProfileApi";
import {
  fetchSocialOAuthTokenStatus,
  oauthTokenStatusHasAnyConnection,
  peekSocialOAuthTokenStatusCache,
} from "@/lib/social/unifiedOAuthApi";
import { unifiedProfilesToHeaderAccounts } from "@/lib/workspace/unifiedProfilesToHeaderAccounts";

function workspaceHasConnectionFromCache(workspaceId: string): boolean {
  const oauth = peekSocialOAuthTokenStatusCache(workspaceId);
  if (oauthTokenStatusHasAnyConnection(oauth)) {
    return true;
  }
  const profiles = peekUnifiedUserProfilesCache(workspaceId);
  return unifiedProfilesToHeaderAccounts(profiles).length > 0;
}

async function workspaceHasSocialConnection(
  token: string,
  workspaceId: string,
): Promise<boolean> {
  const [oauth, profiles] = await Promise.all([
    fetchSocialOAuthTokenStatus(token, workspaceId, { preferCache: true }),
    fetchUnifiedUserProfiles(token, workspaceId, {
      platforms: [],
      forceRefresh: false,
    }),
  ]);
  return (
    oauthTokenStatusHasAnyConnection(oauth) ||
    unifiedProfilesToHeaderAccounts(profiles).length > 0
  );
}

/** True if any workspace has OAuth or unified profile connections. */
export async function anyWorkspaceHasSocialConnection(
  token: string,
  workspaceIds: readonly string[],
): Promise<boolean> {
  if (workspaceIds.length === 0) {
    return false;
  }

  for (const workspaceId of workspaceIds) {
    if (workspaceHasConnectionFromCache(workspaceId)) {
      return true;
    }
  }

  const results = await Promise.all(
    workspaceIds.map((workspaceId) =>
      workspaceHasSocialConnection(token, workspaceId).catch(() => false),
    ),
  );
  return results.some(Boolean);
}
