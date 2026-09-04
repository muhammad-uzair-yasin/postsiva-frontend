import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";

function workspaceHeaders(
  accessToken: string,
  workspaceId: string,
): Record<string, string> {
  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Workspace-Id": workspaceId,
  };
}

export interface UnifiedDraftResponseJson {
  id: string;
  platform: string;
  platform_user_id: string;
  post_type: string;
  status: string;
  default_text?: string | null;
  default_image_id?: string | null;
  default_image_url?: string | null;
  image_ids?: string[] | null;
  video_id?: string | null;
  video_url?: string | null;
  image_urls?: string[] | null;
  facebook_page_ids?: string[] | null;
  linkedin_page_ids?: string[] | null;
  pinterest_board_id?: string | null;
  linkedin?: Record<string, unknown> | null;
  facebook?: Record<string, unknown> | null;
  threads?: Record<string, unknown> | null;
  instagram?: Record<string, unknown> | null;
  tiktok?: Record<string, unknown> | null;
  youtube?: Record<string, unknown> | null;
  pinterest?: Record<string, unknown> | null;
  post_data?: Record<string, unknown> | null;
  wordpress?: {
    wordpress_title?: string | null;
    wordpress_content?: string | null;
    wordpress_excerpt?: string | null;
    wordpress_slug?: string | null;
    categories?: number[] | null;
    tags?: number[] | null;
    suggested_category_names?: string[] | null;
    suggested_tag_names?: string[] | null;
    featured_media_id?: string | null;
    featured_image_url?: string | null;
    connection_id?: string | null;
    media_placement?: string | null;
  } | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface UnifiedDraftsListResponseJson {
  success: boolean;
  data: UnifiedDraftResponseJson[];
  total: number | null;
}

export interface UnifiedDraftSingleResponseJson {
  success: boolean;
  message?: string | null;
  data: UnifiedDraftResponseJson;
}

/**
 * GET /unified/drafts — same contract as mobileApp/lib/social/unifiedDraftsApi.ts
 */
export async function fetchUnifiedDrafts(
  accessToken: string,
  workspaceId: string,
  options: {
    platform?: string | null;
    limit?: number;
    offset?: number;
    linkedinPageIds?: string[];
    facebookPageIds?: string[];
    platformUserId?: string;
    signal?: AbortSignal;
  },
): Promise<UnifiedDraftsListResponseJson> {
  const params = new URLSearchParams();
  params.set("limit", String(options.limit ?? 50));
  params.set("offset", String(options.offset ?? 0));
  if (options.platform?.trim()) {
    params.set("platform", options.platform.trim());
  }
  for (const id of options.linkedinPageIds ?? []) {
    if (id.trim()) {
      params.append("linkedin_page_ids", id.trim());
    }
  }
  for (const id of options.facebookPageIds ?? []) {
    if (id.trim()) {
      params.append("facebook_page_ids", id.trim());
    }
  }
  if (options.platformUserId?.trim()) {
    params.set("platform_user_id", options.platformUserId.trim());
  }

  const url = `${getApiBaseUrl()}/unified/drafts?${params.toString()}`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => ({
      ...workspaceHeaders(t, workspaceId),
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    }),
    { method: "GET", signal: options.signal },
  );

  const data: unknown = await res.json().catch(() => null);
  return data as UnifiedDraftsListResponseJson;
}

/**
 * GET /unified/drafts/{draft_id} — same as mobile `fetchUnifiedDraftById`.
 */
export async function fetchUnifiedDraftById(
  accessToken: string,
  workspaceId: string,
  draftId: string,
  signal?: AbortSignal,
): Promise<UnifiedDraftSingleResponseJson> {
  const url = `${getApiBaseUrl()}/unified/drafts/${encodeURIComponent(draftId)}`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => ({
      ...workspaceHeaders(t, workspaceId),
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    }),
    { method: "GET", signal },
  );
  const data: unknown = await res.json().catch(() => null);
  return data as UnifiedDraftSingleResponseJson;
}

/**
 * PATCH /unified/drafts/{draft_id} — same as mobile `patchUnifiedDraftById`.
 */
export async function patchUnifiedDraftById(
  accessToken: string,
  workspaceId: string,
  draftId: string,
  body: {
    default_text?: string;
    default_image_id?: string | null;
    default_image_url?: string | null;
    image_ids?: string[];
    video_id?: string | null;
    video_url?: string | null;
    wordpress?: Record<string, unknown> | null;
    linkedin?: Record<string, unknown> | null;
    facebook?: Record<string, unknown> | null;
    threads?: Record<string, unknown> | null;
    instagram?: Record<string, unknown> | null;
    tiktok?: Record<string, unknown> | null;
    youtube?: Record<string, unknown> | null;
    pinterest?: Record<string, unknown> | null;
    image_urls?: string[];
    post_type?: string;
    platform?: string;
    platform_user_id?: string;
  },
): Promise<UnifiedDraftSingleResponseJson> {
  const url = `${getApiBaseUrl()}/unified/drafts/${encodeURIComponent(draftId)}`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    { method: "PATCH", body: JSON.stringify(body) },
  );
  const data: unknown = await res.json().catch(() => null);
  return data as UnifiedDraftSingleResponseJson;
}

export async function deleteUnifiedDraftById(
  accessToken: string,
  workspaceId: string,
  draftId: string,
): Promise<{ success: boolean; message?: string }> {
  const url = `${getApiBaseUrl()}/unified/drafts/${encodeURIComponent(draftId)}`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    { method: "DELETE" },
  );
  const data: unknown = await res.json().catch(() => null);
  return data as { success: boolean; message?: string };
}

export async function publishUnifiedDraftById(
  accessToken: string,
  workspaceId: string,
  draftId: string,
): Promise<{ success: boolean; message?: string }> {
  const url = `${getApiBaseUrl()}/unified/drafts/${encodeURIComponent(draftId)}/publish`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    { method: "POST" },
  );
  const data: unknown = await res.json().catch(() => null);
  return data as { success: boolean; message?: string };
}

/**
 * POST /unified/drafts/{draft_id}/schedule — same as mobile `scheduleUnifiedDraftById`.
 */
export async function scheduleUnifiedDraftById(
  accessToken: string,
  workspaceId: string,
  draftId: string,
  scheduledTimeIso: string,
): Promise<{ success: boolean; message?: string }> {
  const url = `${getApiBaseUrl()}/unified/drafts/${encodeURIComponent(draftId)}/schedule`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    {
      method: "POST",
      body: JSON.stringify({ scheduled_time: scheduledTimeIso }),
    },
  );
  const data: unknown = await res.json().catch(() => null);
  const parsed = data as { success?: boolean; message?: string };
  if (!parsed?.success) {
    throw new Error(parsed?.message?.trim() || "Failed to schedule draft.");
  }
  return parsed as { success: boolean; message?: string };
}
