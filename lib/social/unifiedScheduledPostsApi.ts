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

/** Same shape as `mobileApp/lib/social/unifiedScheduledPostsApi.ts`. */
export interface UnifiedScheduledPostItemJson {
  scheduled_post_id: string;
  platform: string;
  platform_user_id: string;
  post_type: string;
  post_data: Record<string, unknown>;
  scheduled_time?: string | null;
  scheduled_time_local?: string | null;
  scheduled_time_formatted?: string | null;
  status: string;
  time_until_scheduled?: string | null;
  published_post_id?: string | null;
  published_post_url?: string | null;
  error_message?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  published_at?: string | null;
}

export interface UnifiedScheduledPostsListDataJson {
  scheduled_posts: UnifiedScheduledPostItemJson[];
  total: number;
  platform?: string | null;
  platform_user_id?: string | null;
  status?: string | null;
}

export interface UnifiedScheduledPostsResponseJson {
  success: boolean;
  message: string;
  data?: UnifiedScheduledPostsListDataJson | null;
  error?: string | null;
}

export interface UpdateUnifiedScheduledPostRequestJson {
  scheduled_time?: string;
  post_data?: Record<string, unknown>;
  /** Flip when replacing image ↔ video so the worker publishes the right type. */
  post_type?: string;
  status?: string;
  platform?: string;
  platform_user_id?: string;
}

/**
 * GET /unified/scheduled-posts — same as mobile `fetchUnifiedScheduledPosts`.
 */
export async function fetchUnifiedScheduledPosts(
  accessToken: string,
  workspaceId: string,
  options?: {
    platform?: string | null;
    platformUserId?: string | null;
    status?: string | null;
    limit?: number;
    offset?: number;
    signal?: AbortSignal;
  },
): Promise<UnifiedScheduledPostsResponseJson> {
  const params = new URLSearchParams();
  if (options?.platform?.trim()) {
    params.set("platform", options.platform.trim());
  }
  if (options?.platformUserId?.trim()) {
    params.set("platform_user_id", options.platformUserId.trim());
  }
  if (options?.status?.trim()) {
    params.set("status", options.status.trim());
  }
  if (typeof options?.limit === "number") {
    params.set("limit", String(options.limit));
  }
  if (typeof options?.offset === "number") {
    params.set("offset", String(options.offset));
  }

  const url = `${getApiBaseUrl()}/unified/scheduled-posts${params.toString() ? `?${params.toString()}` : ""}`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => ({
      ...workspaceHeaders(t, workspaceId),
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    }),
    { method: "GET", signal: options?.signal },
  );

  const data: unknown = await res.json().catch(() => null);
  return data as UnifiedScheduledPostsResponseJson;
}

export async function patchUnifiedScheduledPostById(
  accessToken: string,
  workspaceId: string,
  scheduledPostId: string,
  body: UpdateUnifiedScheduledPostRequestJson,
): Promise<UnifiedScheduledPostsResponseJson> {
  const url = `${getApiBaseUrl()}/unified/scheduled-posts/${encodeURIComponent(scheduledPostId)}`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    { method: "PATCH", body: JSON.stringify(body) },
  );
  const data: unknown = await res.json().catch(() => null);
  return data as UnifiedScheduledPostsResponseJson;
}

/**
 * Reschedule — PATCH /unified/scheduled-posts/{id} with `scheduled_time` only.
 */
export async function rescheduleUnifiedScheduledPostById(
  accessToken: string,
  workspaceId: string,
  scheduledPostId: string,
  scheduledTimeIso: string,
): Promise<UnifiedScheduledPostsResponseJson> {
  return patchUnifiedScheduledPostById(accessToken, workspaceId, scheduledPostId, {
    scheduled_time: scheduledTimeIso,
  });
}

export async function deleteUnifiedScheduledPostById(
  accessToken: string,
  workspaceId: string,
  scheduledPostId: string,
): Promise<UnifiedScheduledPostsResponseJson> {
  const url = `${getApiBaseUrl()}/unified/scheduled-posts/${encodeURIComponent(scheduledPostId)}`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    { method: "DELETE" },
  );
  const data: unknown = await res.json().catch(() => null);
  return data as UnifiedScheduledPostsResponseJson;
}

export async function publishUnifiedScheduledPostById(
  accessToken: string,
  workspaceId: string,
  scheduledPostId: string,
): Promise<UnifiedScheduledPostsResponseJson> {
  const url = `${getApiBaseUrl()}/unified/scheduled-posts/${encodeURIComponent(scheduledPostId)}/publish-now`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    { method: "POST" },
  );
  const data: unknown = await res.json().catch(() => null);
  return data as UnifiedScheduledPostsResponseJson;
}

export async function moveUnifiedScheduledPostToDraftById(
  accessToken: string,
  workspaceId: string,
  scheduledPostId: string,
): Promise<UnifiedScheduledPostsResponseJson> {
  const url = `${getApiBaseUrl()}/unified/scheduled-posts/${encodeURIComponent(scheduledPostId)}/move-to-draft`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    { method: "POST" },
  );
  const data: unknown = await res.json().catch(() => null);
  return data as UnifiedScheduledPostsResponseJson;
}
