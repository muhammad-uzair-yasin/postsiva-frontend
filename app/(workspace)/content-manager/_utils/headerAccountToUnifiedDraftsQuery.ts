import type { WorkspaceHeaderAccountRow } from "@/lib/workspace/headerAccountsTypes";
import { isWorkspaceHeaderAllPlatformsId } from "@/lib/workspace/workspaceHeaderAllPlatforms";

/** Reverse stable id encoding (see linkedinFacebookHeaderAccountRows). */
function decodeStableSegment(segment: string): string {
  const trimmed = segment.trim();
  if (/^\d+$/.test(trimmed)) {
    return trimmed;
  }
  return trimmed.replace(/_/g, ":");
}

export interface UnifiedDraftsQueryOptions {
  platform: string | null;
  linkedinPageIds?: string[];
  facebookPageIds?: string[];
  platformUserId?: string;
}

/**
 * Maps workspace header account row → GET /unified/drafts query (same rules as mobile
 * `useFeedUnifiedDrafts` per-platform fetch).
 */
export function headerAccountRowToUnifiedDraftsQuery(
  row: WorkspaceHeaderAccountRow,
): UnifiedDraftsQueryOptions {
  const { id } = row;

  if (isWorkspaceHeaderAllPlatformsId(id)) {
    return { platform: null };
  }

  if (id.startsWith("linkedin:org:")) {
    const rest = id.slice("linkedin:org:".length);
    const orgId = decodeStableSegment(rest);
    return {
      platform: "linkedin",
      linkedinPageIds: orgId ? [orgId] : undefined,
    };
  }

  if (id === "linkedin") {
    return { platform: "linkedin" };
  }

  if (id.startsWith("facebook:page:")) {
    const rest = id.slice("facebook:page:".length);
    const pageId = decodeStableSegment(rest);
    return {
      platform: "facebook",
      facebookPageIds: pageId ? [pageId] : undefined,
    };
  }

  if (id === "facebook") {
    return { platform: "facebook" };
  }

  if (id.startsWith("pinterest:board:")) {
    return { platform: "pinterest" };
  }

  if (id.startsWith("youtube:")) {
    return {
      platform: "youtube",
      platformUserId: row.targetResourceId ?? id.slice("youtube:".length),
    };
  }

  if (id.startsWith("wordpress:")) {
    const connectionId = id.slice("wordpress:".length).trim();
    const platformUserId = connectionId || row.targetResourceId?.trim();
    return {
      platform: "wordpress",
      ...(platformUserId ? { platformUserId } : {}),
    };
  }

  if (id === "wordpress") {
    return { platform: "wordpress" };
  }

  const simple = new Set([
    "instagram",
    "youtube",
    "tiktok",
    "threads",
    "bluesky",
    "pinterest",
  ]);
  if (simple.has(id)) {
    return { platform: id };
  }

  return { platform: row.iconId };
}
