import type { WorkspaceHeaderAccountRow } from "@/lib/workspace/headerAccountsTypes";
import {
  linkedInMemberPlatformUserId,
  normalizeLinkedInScheduledPlatformUserId,
} from "@/lib/workspace/linkedInScheduledPlatformUserId";

import { headerAccountRowToUnifiedDraftsQuery } from "./headerAccountToUnifiedDraftsQuery";

export interface UnifiedScheduledPostsQueryOptions {
  platform?: string | null;
  platformUserId?: string | null;
}

export interface HeaderAccountScheduledPostsQueryInput {
  readonly row: WorkspaceHeaderAccountRow;
  readonly unifiedProfiles?: Record<string, unknown> | null;
}

/** Maps workspace header account → GET /unified/scheduled-posts query filters. */
export function headerAccountRowToUnifiedScheduledPostsQuery(
  input: WorkspaceHeaderAccountRow | HeaderAccountScheduledPostsQueryInput,
): UnifiedScheduledPostsQueryOptions {
  const row = "row" in input ? input.row : input;
  const unifiedProfiles = "row" in input ? input.unifiedProfiles : undefined;
  const query = headerAccountRowToUnifiedDraftsQuery(row);

  if (query.facebookPageIds?.[0]?.trim()) {
    return {
      platform: "facebook",
      platformUserId: query.facebookPageIds[0].trim(),
    };
  }

  if (query.linkedinPageIds?.[0]?.trim()) {
    const orgRaw =
      row.targetResourceId?.trim() || query.linkedinPageIds[0].trim();
    return {
      platform: "linkedin",
      platformUserId: normalizeLinkedInScheduledPlatformUserId(orgRaw),
    };
  }

  if (row.id.trim() === "linkedin") {
    const memberId = linkedInMemberPlatformUserId(unifiedProfiles);
    if (memberId) {
      return {
        platform: "linkedin",
        platformUserId: memberId,
      };
    }
    return { platform: "linkedin", platformUserId: null };
  }

  if (query.platformUserId?.trim()) {
    return {
      platform: query.platform,
      platformUserId: query.platformUserId.trim(),
    };
  }

  return {
    platform: query.platform,
    platformUserId: null,
  };
}
