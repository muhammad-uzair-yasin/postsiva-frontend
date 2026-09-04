import type { WorkspaceHeaderAccountRow } from "@/lib/workspace/headerAccountsTypes";
import { isWorkspaceHeaderAllPlatformsId } from "@/lib/workspace/workspaceHeaderAllPlatforms";
import { PUBLISHED_REFRESH_MERGE_LIMIT } from "@/app/(workspace)/content-manager/_utils/publishedUnifiedRefreshConstants";

/** Legacy dashboard keys → `headerAccount` id shape for GET /unified/posts/ & analytics. */
function normalizeDashboardAccountIdForUnifiedQuery(rawId: string): string {
  if (rawId === "facebook-profile" || rawId === "facebook-pages") {
    return "facebook";
  }
  return rawId;
}

/**
 * GET /unified/posts/ limit when forcing a full refresh (e.g. live profile refresh).
 * Uses the same default as published posts unless callers pass an explicit limit.
 */
export function unifiedPostsRefreshLimitForHeaderAccountId(_accountId: string): number {
  void _accountId;
  return PUBLISHED_REFRESH_MERGE_LIMIT;
}

/** Builds a minimal row — only `id` is read by {@link headerAccountToUnifiedPostsParams}. */
export function minimalHeaderRowForUnifiedPostsQuery(
  accountId: string,
): WorkspaceHeaderAccountRow {
  const id = normalizeDashboardAccountIdForUnifiedQuery(accountId);
  return {
    id,
    iconId: "instagram",
    label: "",
  };
}

/**
 * API expects numeric org id, e.g. `linkedin_organization_ids=109408332`.
 * Stable ids come from profile `page_id` (URN with `:` → `_`) or numeric `page_id` / `numeric_id`.
 */
function linkedinOrganizationNumericIdForAnalytics(stable: string): string {
  const t = stable.trim();
  if (/^\d+$/.test(t)) {
    return t;
  }
  const urn = t.includes("_") ? t.replace(/_/g, ":") : t;
  const tail = urn.includes(":") ? urn.split(":").pop() : undefined;
  if (tail !== undefined && /^\d+$/.test(tail)) {
    return tail;
  }
  return t;
}

/** Query params for GET /unified/analytics/ (mirrors backend Query()). */
export interface UnifiedAnalyticsQueryParams {
  readonly platforms: readonly string[];
  readonly facebookPageIds?: readonly string[];
  readonly linkedinOrganizationIds?: readonly string[];
  readonly youtubeChannelId?: string;
}

/**
 * Maps a header dropdown row → analytics query. Backend scopes Facebook / LinkedIn
 * with optional page/org ids; other platforms use `platforms` only.
 */
export function headerAccountToAnalyticsParams(
  selected: WorkspaceHeaderAccountRow | null,
): UnifiedAnalyticsQueryParams | null {
  if (!selected) {
    return null;
  }
  if (isWorkspaceHeaderAllPlatformsId(selected.id)) {
    return { platforms: [] };
  }
  if (selected.disabled) {
    return null;
  }

  const id = normalizeDashboardAccountIdForUnifiedQuery(selected.id);

  if (id === "linkedin") {
    return { platforms: ["linkedin"] };
  }
  if (id.startsWith("linkedin:org:")) {
    const stable = id.slice("linkedin:org:".length);
    const orgNumericId = linkedinOrganizationNumericIdForAnalytics(stable);
    return {
      platforms: ["linkedin"],
      linkedinOrganizationIds: [orgNumericId],
    };
  }

  if (id === "facebook") {
    return { platforms: ["facebook"] };
  }
  if (id.startsWith("facebook:page:")) {
    const pageId = id.slice("facebook:page:".length);
    return {
      platforms: ["facebook"],
      facebookPageIds: [pageId],
    };
  }

  if (id === "youtube" || id.startsWith("youtube:")) {
    return {
      platforms: ["youtube"],
      youtubeChannelId: selected.targetResourceId ??
        (id.startsWith("youtube:") ? id.slice("youtube:".length) : undefined),
    };
  }
  if (id === "tiktok") {
    return { platforms: ["tiktok"] };
  }
  if (id === "instagram") {
    return { platforms: ["instagram"] };
  }
  if (id === "threads") {
    return { platforms: ["threads"] };
  }
  if (id === "bluesky") {
    return { platforms: ["bluesky"] };
  }
  if (id === "wordpress" || id.startsWith("wordpress:")) {
    return { platforms: ["wordpress"] };
  }

  if (id === "pinterest" || id.startsWith("pinterest:board:")) {
    return { platforms: ["pinterest"] };
  }

  return null;
}

/** GET /unified/posts/ — same platform filters as analytics, plus optional Pinterest board. */
export interface UnifiedPostsQueryParams extends UnifiedAnalyticsQueryParams {
  readonly pinterestBoardId?: string;
}

export function headerAccountToUnifiedPostsParams(
  selected: WorkspaceHeaderAccountRow | null,
): UnifiedPostsQueryParams | null {
  const base = headerAccountToAnalyticsParams(selected);
  if (!base || selected === null) {
    return null;
  }
  if (selected.id.startsWith("pinterest:board:")) {
    const stable = selected.id.slice("pinterest:board:".length);
    const boardId = stable.includes("_") ? stable.replace(/_/g, ":") : stable;
    return { ...base, pinterestBoardId: boardId };
  }
  return base;
}
