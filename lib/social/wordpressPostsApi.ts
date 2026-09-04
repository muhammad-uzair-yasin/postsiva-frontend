import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";

export type WordPressPostStatus = "publish" | "draft" | "future" | "pending" | "private";

export interface WordPressBlogPost {
  id: string;
  connection_id: string;
  wordpress_post_id: string;
  post_type: string;
  status: WordPressPostStatus;
  slug?: string | null;
  link?: string | null;
  title_raw?: string | null;
  title_rendered?: string | null;
  content_raw?: string | null;
  content_rendered?: string | null;
  excerpt_raw?: string | null;
  excerpt_rendered?: string | null;
  format?: string | null;
  comment_status?: "open" | "closed" | string | null;
  ping_status?: "open" | "closed" | string | null;
  featured_media?: number | null;
  featured_media_url?: string | null;
  comment_count?: number | null;
  categories?: number[] | null;
  tags?: number[] | null;
  wordpress_date?: string | null;
  wordpress_modified?: string | null;
  fetched_at: string;
}

export interface WordPressPostsResponse {
  success: boolean;
  source: string;
  posts: WordPressBlogPost[];
}

export interface WordPressPostUpdatePayload {
  title?: string;
  content?: string;
  excerpt?: string;
  slug?: string;
  status?: WordPressPostStatus;
  date?: string;
  format?: string;
  comment_status?: "open" | "closed";
  ping_status?: "open" | "closed";
  categories?: number[];
  tags?: number[];
  featured_media?: number;
}

export type WordPressPostCreatePayload = WordPressPostUpdatePayload & {
  title: string;
};

function authHeaders(accessToken: string, workspaceId: string): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Workspace-Id": workspaceId,
  };
}

function parseError(raw: Record<string, unknown>, fallback: string): Error {
  const detail = raw.detail;
  if (detail && typeof detail === "object") {
    const d = detail as { message?: unknown; code?: unknown };
    return new Error(String(d.message ?? d.code ?? fallback));
  }
  return new Error(String(raw.message ?? raw.detail ?? fallback));
}

export async function fetchWordPressPosts(input: {
  accessToken: string;
  workspaceId: string;
  forceRefresh?: boolean;
  limit?: number;
  statuses?: WordPressPostStatus[];
}): Promise<WordPressPostsResponse> {
  const params = new URLSearchParams();
  params.set("limit", String(input.limit ?? 50));
  if (input.forceRefresh) params.set("force_refresh", "true");
  for (const status of input.statuses ?? []) params.append("status", status);
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/api/integrations/wordpress/posts?${params.toString()}`,
    input.accessToken,
    (token) => authHeaders(token, input.workspaceId),
  );
  const raw = (await res.json()) as Record<string, unknown>;
  if (!res.ok || raw.success === false) {
    throw parseError(raw, "Could not load WordPress posts.");
  }
  return raw as unknown as WordPressPostsResponse;
}

export async function updateWordPressPost(input: {
  accessToken: string;
  workspaceId: string;
  connectionId: string;
  wordpressPostId: string;
  payload: WordPressPostUpdatePayload;
}): Promise<WordPressBlogPost> {
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/api/integrations/wordpress/posts/${encodeURIComponent(
      input.connectionId,
    )}/${encodeURIComponent(input.wordpressPostId)}`,
    input.accessToken,
    (token) => authHeaders(token, input.workspaceId),
    { method: "PATCH", body: JSON.stringify(input.payload) },
  );
  const raw = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    throw parseError(raw, "Could not update WordPress post.");
  }
  return raw as unknown as WordPressBlogPost;
}

export async function createWordPressPost(input: {
  accessToken: string;
  workspaceId: string;
  connectionId: string;
  payload: WordPressPostCreatePayload;
}): Promise<WordPressBlogPost> {
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/api/integrations/wordpress/posts/${encodeURIComponent(
      input.connectionId,
    )}`,
    input.accessToken,
    (token) => authHeaders(token, input.workspaceId),
    { method: "POST", body: JSON.stringify(input.payload) },
  );
  const raw = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    throw parseError(raw, "Could not create WordPress post.");
  }
  return raw as unknown as WordPressBlogPost;
}

export async function deleteWordPressPost(input: {
  accessToken: string;
  workspaceId: string;
  connectionId: string;
  wordpressPostId: string;
  force?: boolean;
}): Promise<void> {
  const force = input.force ? "true" : "false";
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/api/integrations/wordpress/posts/${encodeURIComponent(
      input.connectionId,
    )}/${encodeURIComponent(input.wordpressPostId)}?force=${force}`,
    input.accessToken,
    (token) => authHeaders(token, input.workspaceId),
    { method: "DELETE" },
  );
  const raw = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok || raw.success === false) {
    throw parseError(raw, "Could not delete WordPress post.");
  }
}
