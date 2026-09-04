import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";

import type { WorkspaceHeaderAccountRow } from "@/lib/workspace/headerAccountsTypes";
import { isWorkspaceHeaderAllPlatformsId } from "@/lib/workspace/workspaceHeaderAllPlatforms";

import {
  headerAccountToAnalyticsParams,
  type UnifiedAnalyticsQueryParams,
} from "./headerAccountToAnalyticsParams";
import type {
  UnifiedAnalyticsPlatformSlice,
  UnifiedAnalyticsResponseBody,
} from "./unifiedAnalyticsTypes";

function workspaceHeaders(
  accessToken: string,
  workspaceId: string,
): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
    "X-Workspace-Id": workspaceId,
    Accept: "application/json",
  };
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object";
}

function parsePlatformSlice(v: unknown): UnifiedAnalyticsPlatformSlice | null {
  if (!isRecord(v)) {
    return null;
  }
  const post_count = v.post_count;
  const total_likes = v.total_likes;
  const total_comments = v.total_comments;
  const total_reach = v.total_reach;
  const average_engagement_rate = v.average_engagement_rate;
  if (
    typeof post_count !== "number" ||
    typeof total_likes !== "number" ||
    typeof total_comments !== "number" ||
    typeof total_reach !== "number" ||
    typeof average_engagement_rate !== "number"
  ) {
    return null;
  }
  return {
    post_count,
    total_likes,
    total_comments,
    total_reach,
    average_engagement_rate,
    message: typeof v.message === "string" ? v.message : null,
    error: typeof v.error === "string" ? v.error : null,
  };
}

/**
 * GET /unified/analytics/?platforms=… — aggregate metrics for the workspace (DB only).
 */
export async function fetchUnifiedAnalytics(
  accessToken: string,
  workspaceId: string,
  params: UnifiedAnalyticsQueryParams,
  signal?: AbortSignal,
): Promise<UnifiedAnalyticsResponseBody> {
  const base = getApiBaseUrl();
  const sp = new URLSearchParams();
  for (const p of params.platforms) {
    sp.append("platforms", p);
  }
  if (params.facebookPageIds) {
    for (const id of params.facebookPageIds) {
      sp.append("facebook_page_ids", id);
    }
  }
  if (params.linkedinOrganizationIds) {
    for (const id of params.linkedinOrganizationIds) {
      sp.append("linkedin_organization_ids", id);
    }
  }
  if (params.youtubeChannelId?.trim()) {
    sp.set("youtube_channel_id", params.youtubeChannelId.trim());
  }
  const q = sp.toString();
  const url = q
    ? `${base}/unified/analytics/?${q}`
    : `${base}/unified/analytics/`;

  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    { method: "GET", signal },
  );
  const body = (await res.json()) as unknown;
  if (
    !isRecord(body) ||
    body.success !== true ||
    !isRecord(body.platforms) ||
    !isRecord(body.totals)
  ) {
    throw new Error("Invalid unified analytics response.");
  }
  return body as unknown as UnifiedAnalyticsResponseBody;
}

/** Picks the slice for the first requested platform key. */
export function pickPlatformAnalyticsSlice(
  body: UnifiedAnalyticsResponseBody,
  platformKey: string,
): UnifiedAnalyticsPlatformSlice | null {
  const raw = body.platforms?.[platformKey];
  return parsePlatformSlice(raw);
}

function totalsRecordToPlatformSlice(
  totals: Record<string, unknown>,
): UnifiedAnalyticsPlatformSlice {
  return {
    post_count: Number(totals.post_count ?? 0),
    total_likes: Number(totals.total_likes ?? 0),
    total_comments: Number(totals.total_comments ?? 0),
    total_reach: Number(totals.total_reach ?? 0),
    average_engagement_rate: Number(totals.average_engagement_rate ?? 0),
    message: null,
    error: null,
  };
}

/** Fetches analytics for the current header row (one platform + optional FB / LI filters). */
export async function fetchAnalyticsSliceForHeaderAccount(
  accessToken: string,
  workspaceId: string,
  selected: WorkspaceHeaderAccountRow,
  signal?: AbortSignal,
): Promise<UnifiedAnalyticsPlatformSlice | null> {
  if (isWorkspaceHeaderAllPlatformsId(selected.id)) {
    const body = await fetchUnifiedAnalytics(
      accessToken,
      workspaceId,
      { platforms: [] },
      signal,
    );
    return totalsRecordToPlatformSlice(
      body.totals as Record<string, unknown>,
    );
  }
  const params = headerAccountToAnalyticsParams(selected);
  if (!params) {
    return null;
  }
  const platformKey = params.platforms[0];
  if (!platformKey) {
    return null;
  }
  const body = await fetchUnifiedAnalytics(accessToken, workspaceId, params, signal);
  return pickPlatformAnalyticsSlice(body, platformKey);
}
