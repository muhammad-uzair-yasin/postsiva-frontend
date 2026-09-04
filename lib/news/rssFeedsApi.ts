import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";

export interface RssFeedDto {
  id: string;
  workspace_id: string;
  name: string;
  url: string;
  include_keywords: string[];
  exclude_keywords: string[];
  is_active: boolean;
  last_fetched_at: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface RssFeedListResponse {
  items: RssFeedDto[];
  total: number;
  max_feeds: number;
}

export interface RssArticleDto {
  title: string;
  url: string;
  image: string | null;
  source: string | null;
  published_at: string | null;
  snippet: string | null;
  feed_id: string;
  feed_name: string;
}

export interface RssArticlesResponse {
  articles: RssArticleDto[];
  meta: {
    total: number;
    page: number;
    per_page: number;
    has_more: boolean;
    cached: boolean;
    cache_age_seconds: number | null;
  };
}

export interface CreateRssFeedBody {
  name: string;
  url: string;
  include_keywords?: string[];
  exclude_keywords?: string[];
}

function authHeaders(workspaceId: string) {
  return (token: string): HeadersInit => ({
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Workspace-Id": workspaceId,
  });
}

async function readError(res: Response, fallback: string): Promise<Error> {
  try {
    const raw = (await res.json()) as { detail?: unknown; message?: unknown };
    const detail = raw.detail;
    if (typeof detail === "string") return new Error(detail);
    if (detail && typeof detail === "object" && "message" in detail) {
      return new Error(String((detail as { message: unknown }).message));
    }
    if (Array.isArray(detail) && detail[0] && typeof detail[0] === "object") {
      const first = detail[0] as { msg?: unknown };
      if (first.msg) return new Error(String(first.msg));
    }
    return new Error(String(raw.message ?? fallback));
  } catch {
    return new Error(fallback);
  }
}

export async function listRssFeeds(
  accessToken: string,
  workspaceId: string,
): Promise<RssFeedListResponse> {
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/rss-feeds`,
    accessToken,
    authHeaders(workspaceId),
    { method: "GET" },
  );
  if (!res.ok) throw await readError(res, "Failed to load RSS feeds");
  return res.json() as Promise<RssFeedListResponse>;
}

export async function createRssFeed(
  accessToken: string,
  workspaceId: string,
  body: CreateRssFeedBody,
): Promise<RssFeedDto> {
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/rss-feeds`,
    accessToken,
    authHeaders(workspaceId),
    { method: "POST", body: JSON.stringify(body) },
  );
  if (!res.ok) throw await readError(res, "Failed to add RSS feed");
  return res.json() as Promise<RssFeedDto>;
}

export async function deleteRssFeed(
  accessToken: string,
  workspaceId: string,
  feedId: string,
): Promise<void> {
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/rss-feeds/${encodeURIComponent(feedId)}`,
    accessToken,
    authHeaders(workspaceId),
    { method: "DELETE" },
  );
  if (!res.ok && res.status !== 204) {
    throw await readError(res, "Failed to remove RSS feed");
  }
}

export async function fetchRssArticles(
  accessToken: string,
  workspaceId: string,
  params: { feedId?: string; q?: string; page?: number; refresh?: boolean } = {},
): Promise<RssArticlesResponse> {
  const qs = new URLSearchParams({ page: String(params.page ?? 1) });
  if (params.feedId) qs.set("feed_id", params.feedId);
  if (params.q) qs.set("q", params.q);
  if (params.refresh) qs.set("refresh", "true");

  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/rss-feeds/articles?${qs.toString()}`,
    accessToken,
    authHeaders(workspaceId),
    { method: "GET" },
  );
  if (!res.ok) throw await readError(res, "Failed to load RSS articles");
  return res.json() as Promise<RssArticlesResponse>;
}
