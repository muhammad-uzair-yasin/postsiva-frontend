import { getStoredAccessToken } from "@/lib/auth/session";
import { fetchUnifiedUserProfiles } from "@/lib/dashboard/channelProfileApi";
import {
  headerAccountToUnifiedPostsParams,
  minimalHeaderRowForUnifiedPostsQuery,
  unifiedPostsRefreshLimitForHeaderAccountId,
} from "@/lib/dashboard/headerAccountToAnalyticsParams";
import { fetchUnifiedPosts } from "@/lib/contentManager/unifiedPostsApi";
import { profileRefreshTargetForChannelKey } from "@/lib/dashboard/workspaceChannelSnapshot";
import { refreshStoredWorkspacesFromApi } from "@/lib/social/unifiedOAuthApi";

export type ChannelProfileRefreshResult = {
  kind: "unified";
  platform: string;
  partial: Record<string, unknown>;
};

/**
 * Refreshes one channel from its platform API. Returns a partial JSON (only
 * that platform populated); merge with mergePartialUnifiedProfilesCache before
 * replacing client cache.
 */
export async function refreshChannelProfileLivePayload(
  workspaceId: string,
  channelKey: string,
): Promise<ChannelProfileRefreshResult> {
  const token = getStoredAccessToken();
  if (!token) {
    throw new Error("Not signed in");
  }
  const target = profileRefreshTargetForChannelKey(channelKey);
  if (!target) {
    throw new Error("Refresh is not available for this channel.");
  }
  const partial = await fetchUnifiedUserProfiles(token, workspaceId, {
    platforms: [target.platform],
    forceRefresh: true,
    facebookPageId: target.facebookPageId,
  });
  await refreshStoredWorkspacesFromApi(token);

  const postsParams = headerAccountToUnifiedPostsParams(
    minimalHeaderRowForUnifiedPostsQuery(channelKey),
  );
  if (postsParams) {
    const refreshLimit =
      unifiedPostsRefreshLimitForHeaderAccountId(channelKey);
    try {
      await fetchUnifiedPosts(token, workspaceId, {
        platforms: [...postsParams.platforms],
        limit: refreshLimit,
        stats: true,
        forceRefresh: true,
        allowPaidLinkedinRefresh: postsParams.platforms.includes("linkedin"),
        linkedinOrganizationIds: postsParams.linkedinOrganizationIds
          ? [...postsParams.linkedinOrganizationIds]
          : undefined,
        facebookPageIds: postsParams.facebookPageIds
          ? [...postsParams.facebookPageIds]
          : undefined,
        pinterestBoardId: postsParams.pinterestBoardId,
      });
    } catch {
      /* best-effort: profile refresh already succeeded */
    }
  }

  return { kind: "unified", platform: target.platform, partial };
}
