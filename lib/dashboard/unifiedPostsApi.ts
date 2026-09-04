import { mapFullUnifiedPostsResponseToPublishedPosts } from "@/app/(workspace)/content-manager/_utils/mapFullUnifiedPostsResponseToPublishedPosts";
import { contentManagerChannelFromHeaderAccount } from "@/app/(workspace)/content-manager/_utils/contentManagerChannelFromHeaderAccount";
import { unifiedPostsResponseToPublishedPostsForChannel } from "@/app/(workspace)/content-manager/_utils/unifiedPostsResponseToPublishedPostsForChannel";
import { PUBLISHED_REFRESH_MERGE_LIMIT } from "@/app/(workspace)/content-manager/_utils/publishedUnifiedRefreshConstants";
import type { ContentManagerChannelFilter } from "@/app/(workspace)/content-manager/_types/contentManagerTypes";
import { fetchUnifiedPosts as fetchUnifiedPostsContentManager } from "@/lib/contentManager/unifiedPostsApi";
import { setPublishedPostsWorkspaceCache } from "@/lib/contentManager/publishedPostsWorkspaceCache";
import type { WorkspaceHeaderAccountRow } from "@/lib/workspace/headerAccountsTypes";
import { isWorkspaceHeaderAllPlatformsId } from "@/lib/workspace/workspaceHeaderAllPlatforms";

import type { DashboardRecentPostView } from "./dashboardRecentPostTypes";
import { headerAccountToUnifiedPostsParams } from "./headerAccountToAnalyticsParams";
import {
  mapUnifiedPostsBodyToRecentCards,
  mapUnifiedPostsBodyToRecentCardsAllPlatforms,
} from "./mapRawPostToRecentCard";

const DASHBOARD_CARD_LIMIT = 4;

type LabelsByFilter = Partial<Record<ContentManagerChannelFilter, string>>;

/**
 * Same GET /unified/posts/ as Content Manager published tab (default limit 50), seeds
 * {@link setPublishedPostsWorkspaceCache}, and returns up to four dashboard preview cards.
 */
export async function fetchDashboardRecentPostCards(
  accessToken: string,
  workspaceId: string,
  selected: WorkspaceHeaderAccountRow,
  labelsByFilter: LabelsByFilter,
  signal?: AbortSignal,
): Promise<readonly DashboardRecentPostView[]> {
  const params = headerAccountToUnifiedPostsParams(selected);
  if (!params) {
    return [];
  }

  const data = await fetchUnifiedPostsContentManager(accessToken, workspaceId, {
    platforms: [...params.platforms],
    limit: PUBLISHED_REFRESH_MERGE_LIMIT,
    stats: true,
    forceRefresh: false,
    linkedinOrganizationIds: params.linkedinOrganizationIds
      ? [...params.linkedinOrganizationIds]
      : undefined,
    facebookPageIds: params.facebookPageIds
      ? [...params.facebookPageIds]
      : undefined,
    pinterestBoardId: params.pinterestBoardId,
    youtubeChannelId: params.youtubeChannelId,
    signal,
  });

  if (!data.success) {
    throw new Error(data.message ?? "Could not load posts.");
  }

  const channel = contentManagerChannelFromHeaderAccount(selected);
  const published = isWorkspaceHeaderAllPlatformsId(selected.id)
    ? mapFullUnifiedPostsResponseToPublishedPosts(data, labelsByFilter)
    : unifiedPostsResponseToPublishedPostsForChannel(
        channel,
        labelsByFilter,
        data,
      );
  setPublishedPostsWorkspaceCache(
    workspaceId,
    selected.id,
    published,
    PUBLISHED_REFRESH_MERGE_LIMIT,
    { allowEmpty: true },
  );

  const body = data as unknown as Record<string, unknown>;
  if (isWorkspaceHeaderAllPlatformsId(selected.id)) {
    return mapUnifiedPostsBodyToRecentCardsAllPlatforms(body, DASHBOARD_CARD_LIMIT);
  }
  const platformKey = params.platforms[0];
  if (!platformKey) {
    return [];
  }
  return mapUnifiedPostsBodyToRecentCards(
    body,
    platformKey,
    DASHBOARD_CARD_LIMIT,
  );
}
