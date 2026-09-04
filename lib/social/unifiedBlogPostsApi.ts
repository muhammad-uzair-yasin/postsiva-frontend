import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";

import type { UnifiedPostsApiResponse } from "@/lib/contentManager/unifiedPostsApi";

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

const BLOG_POSTS_BASE = () => `${getApiBaseUrl()}/unified/blog/posts`;

/** GET /unified/blog/posts — WordPress published posts (same response shape as unified posts). */
export async function fetchUnifiedBlogPosts(
  accessToken: string,
  workspaceId: string,
  options: {
    connectionId?: string | null;
    limit?: number;
    stats?: boolean;
    forceRefresh?: boolean;
    refreshPosts?: boolean;
    refreshStats?: boolean;
    signal?: AbortSignal;
  },
): Promise<UnifiedPostsApiResponse> {
  const fr = options.forceRefresh ?? false;
  const refreshPosts = options.refreshPosts ?? fr;
  const refreshStats = options.refreshStats ?? fr;
  const params = new URLSearchParams();
  params.set("limit", String(options.limit ?? 10));
  params.set("stats", String(options.stats ?? true));
  params.set("refresh_posts", String(refreshPosts));
  params.set("refresh_stats", String(refreshStats));
  if (options.connectionId?.trim()) {
    params.set("connection_id", options.connectionId.trim());
  }
  const url = `${BLOG_POSTS_BASE()}/?${params.toString()}`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    { method: "GET", signal: options.signal },
  );
  return (await res.json()) as UnifiedPostsApiResponse;
}

/** GET /unified/blog/posts/{id} — single WordPress post refresh. */
export async function fetchUnifiedBlogPostById(
  accessToken: string,
  workspaceId: string,
  postId: string,
  options: {
    connectionId?: string | null;
    forceRefresh?: boolean;
    signal?: AbortSignal;
  } = {},
): Promise<UnifiedPostsApiResponse> {
  const params = new URLSearchParams();
  params.set("refresh", String(options.forceRefresh ?? false));
  if (options.connectionId?.trim()) {
    params.set("connection_id", options.connectionId.trim());
  }
  const url = `${BLOG_POSTS_BASE()}/${encodeURIComponent(postId)}?${params.toString()}`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    { method: "GET", signal: options.signal },
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch blog post: ${res.status}`);
  }
  return (await res.json()) as UnifiedPostsApiResponse;
}
