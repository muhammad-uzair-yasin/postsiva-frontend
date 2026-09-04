import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";

import type {
  UnifiedScheduledPostsResponseJson,
  UpdateUnifiedScheduledPostRequestJson,
} from "./unifiedScheduledPostsApi";

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

const BLOG_SCHEDULED_BASE = () => `${getApiBaseUrl()}/unified/blog/scheduled-posts`;

export async function fetchUnifiedBlogScheduledPosts(
  accessToken: string,
  workspaceId: string,
  options?: {
    connectionId?: string | null;
    status?: string | null;
    limit?: number;
    offset?: number;
    signal?: AbortSignal;
  },
): Promise<UnifiedScheduledPostsResponseJson> {
  const params = new URLSearchParams();
  if (options?.connectionId?.trim()) {
    params.set("connection_id", options.connectionId.trim());
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

  const url = `${BLOG_SCHEDULED_BASE()}${params.toString() ? `?${params.toString()}` : ""}`;
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

export async function postUnifiedBlogScheduled(
  accessToken: string,
  workspaceId: string,
  body: Record<string, unknown>,
  scheduledTimeIso: string,
): Promise<unknown> {
  const url = BLOG_SCHEDULED_BASE();
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    {
      method: "POST",
      body: JSON.stringify({ ...body, scheduled_time: scheduledTimeIso }),
    },
  );
  return (await res.json()) as unknown;
}

export async function patchUnifiedBlogScheduledPostById(
  accessToken: string,
  workspaceId: string,
  scheduledPostId: string,
  body: UpdateUnifiedScheduledPostRequestJson,
): Promise<UnifiedScheduledPostsResponseJson> {
  const url = `${BLOG_SCHEDULED_BASE()}/${encodeURIComponent(scheduledPostId)}`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    { method: "PATCH", body: JSON.stringify(body) },
  );
  const data: unknown = await res.json().catch(() => null);
  return data as UnifiedScheduledPostsResponseJson;
}

export async function deleteUnifiedBlogScheduledPostById(
  accessToken: string,
  workspaceId: string,
  scheduledPostId: string,
): Promise<UnifiedScheduledPostsResponseJson> {
  const url = `${BLOG_SCHEDULED_BASE()}/${encodeURIComponent(scheduledPostId)}`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    { method: "DELETE" },
  );
  const data: unknown = await res.json().catch(() => null);
  return data as UnifiedScheduledPostsResponseJson;
}

export async function publishUnifiedBlogScheduledPostById(
  accessToken: string,
  workspaceId: string,
  scheduledPostId: string,
): Promise<UnifiedScheduledPostsResponseJson> {
  const url = `${BLOG_SCHEDULED_BASE()}/${encodeURIComponent(scheduledPostId)}/publish-now`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    { method: "POST" },
  );
  const data: unknown = await res.json().catch(() => null);
  return data as UnifiedScheduledPostsResponseJson;
}

export async function moveUnifiedBlogScheduledPostToDraftById(
  accessToken: string,
  workspaceId: string,
  scheduledPostId: string,
): Promise<UnifiedScheduledPostsResponseJson> {
  const url = `${BLOG_SCHEDULED_BASE()}/${encodeURIComponent(scheduledPostId)}/move-to-draft`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    { method: "POST" },
  );
  const data: unknown = await res.json().catch(() => null);
  return data as UnifiedScheduledPostsResponseJson;
}

export async function rescheduleUnifiedBlogScheduledPostById(
  accessToken: string,
  workspaceId: string,
  scheduledPostId: string,
  scheduledTimeIso: string,
): Promise<UnifiedScheduledPostsResponseJson> {
  return patchUnifiedBlogScheduledPostById(accessToken, workspaceId, scheduledPostId, {
    scheduled_time: scheduledTimeIso,
  });
}
