import { headerAccountRowToUnifiedScheduledPostsQuery } from "@/app/(workspace)/content-manager/_utils/headerAccountRowToUnifiedScheduledPostsQuery";
import type { WorkspaceHeaderAccountRow } from "@/lib/workspace/headerAccountsTypes";
import { normalizeLinkedInScheduledPlatformUserId } from "@/lib/workspace/linkedInScheduledPlatformUserId";

export interface PostingDestinationFromHeaderAccount {
  readonly platform: string;
  readonly platformUserId: string;
  readonly postDataPatch: Record<string, unknown>;
}

/** Map header account row → platform + platform_user_id + post_data destination fields. */
export function resolvePostingDestinationFromHeaderAccount(
  row: WorkspaceHeaderAccountRow,
  unifiedProfiles?: Record<string, unknown> | null,
): PostingDestinationFromHeaderAccount {
  const scheduledQuery = headerAccountRowToUnifiedScheduledPostsQuery({
    row,
    unifiedProfiles,
  });
  const platform =
    scheduledQuery.platform?.trim().toLowerCase() || row.iconId.trim().toLowerCase();
  const platformUserId =
    scheduledQuery.platformUserId?.trim() ||
    row.targetResourceId?.trim() ||
    "";

  const postDataPatch: Record<string, unknown> = {};

  if (row.id.startsWith("facebook:page:")) {
    if (platformUserId) {
      postDataPatch.facebook_page_ids = [platformUserId];
    }
  } else if (row.id === "linkedin") {
    postDataPatch.post_to_personal = true;
    postDataPatch.linkedin_page_ids = [];
  } else if (row.id.startsWith("linkedin:org:")) {
    const orgId = normalizeLinkedInScheduledPlatformUserId(
      row.targetResourceId?.trim() || platformUserId,
    );
    postDataPatch.post_to_personal = false;
    postDataPatch.linkedin_page_ids = orgId ? [orgId] : [];
  } else if (row.id.startsWith("pinterest:board:")) {
    if (platformUserId) {
      postDataPatch.pinterest_board_id = platformUserId;
    }
  }

  return { platform, platformUserId, postDataPatch };
}
