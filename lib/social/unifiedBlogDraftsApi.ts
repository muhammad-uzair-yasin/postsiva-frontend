import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";

import type {
  UnifiedDraftResponseJson,
  UnifiedDraftSingleResponseJson,
  UnifiedDraftsListResponseJson,
} from "./unifiedDraftsApi";

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

const BLOG_DRAFTS_BASE = () => `${getApiBaseUrl()}/unified/blog/drafts`;

export async function fetchUnifiedBlogDrafts(
  accessToken: string,
  workspaceId: string,
  options: {
    connectionId?: string | null;
    limit?: number;
    offset?: number;
    signal?: AbortSignal;
  },
): Promise<UnifiedDraftsListResponseJson> {
  const params = new URLSearchParams();
  params.set("limit", String(options.limit ?? 50));
  params.set("offset", String(options.offset ?? 0));
  if (options.connectionId?.trim()) {
    params.set("connection_id", options.connectionId.trim());
  }
  const url = `${BLOG_DRAFTS_BASE()}?${params.toString()}`;
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

export async function fetchUnifiedBlogDraftById(
  accessToken: string,
  workspaceId: string,
  draftId: string,
  signal?: AbortSignal,
): Promise<UnifiedDraftSingleResponseJson> {
  const url = `${BLOG_DRAFTS_BASE()}/${encodeURIComponent(draftId)}`;
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

export async function patchUnifiedBlogDraftById(
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
    image_urls?: string[];
  },
): Promise<UnifiedDraftSingleResponseJson> {
  const url = `${BLOG_DRAFTS_BASE()}/${encodeURIComponent(draftId)}`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    { method: "PATCH", body: JSON.stringify(body) },
  );
  const data: unknown = await res.json().catch(() => null);
  return data as UnifiedDraftSingleResponseJson;
}

export async function deleteUnifiedBlogDraftById(
  accessToken: string,
  workspaceId: string,
  draftId: string,
): Promise<{ success: boolean; message?: string }> {
  const url = `${BLOG_DRAFTS_BASE()}/${encodeURIComponent(draftId)}`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    { method: "DELETE" },
  );
  const data: unknown = await res.json().catch(() => null);
  return data as { success: boolean; message?: string };
}

export async function publishUnifiedBlogDraftById(
  accessToken: string,
  workspaceId: string,
  draftId: string,
): Promise<{ success: boolean; message?: string }> {
  const url = `${BLOG_DRAFTS_BASE()}/${encodeURIComponent(draftId)}/publish`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    { method: "POST" },
  );
  const data: unknown = await res.json().catch(() => null);
  return data as { success: boolean; message?: string };
}

export async function scheduleUnifiedBlogDraftById(
  accessToken: string,
  workspaceId: string,
  draftId: string,
  scheduledTimeIso: string,
): Promise<{ success: boolean; message?: string }> {
  const url = `${BLOG_DRAFTS_BASE()}/${encodeURIComponent(draftId)}/schedule`;
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

export async function createUnifiedBlogDraft(
  accessToken: string,
  workspaceId: string,
  body: Record<string, unknown>,
): Promise<UnifiedDraftSingleResponseJson> {
  const url = BLOG_DRAFTS_BASE();
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    { method: "POST", body: JSON.stringify(body) },
  );
  const data: unknown = await res.json().catch(() => null);
  return data as UnifiedDraftSingleResponseJson;
}

export type { UnifiedDraftResponseJson };
