import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";
import type { NewsMode, NewsNiche, NewsTimeRange } from "@/lib/news/newsApi";

export type TrendingNiche = Exclude<NewsNiche, "mix">;
export type TrendingMode = NewsMode;
export type TrendingTimeRange = NewsTimeRange;
export type TrendingPlatform = "youtube" | "bluesky" | "mastodon";

export const TRENDING_PLATFORMS: { value: TrendingPlatform; label: string }[] = [
  { value: "youtube", label: "YouTube" },
  { value: "bluesky", label: "Bluesky" },
  { value: "mastodon", label: "Mastodon" },
];

export interface TrendingPostItem {
  id: string;
  title: string;
  url: string;
  image: string | null;
  source: string | null;
  published_at: string | null;
  snippet: string | null;
  duration: string | null;
  view_count: number | null;
  like_count: number | null;
  comment_count: number | null;
  share_count?: number | null;
  platform: TrendingPlatform | string;
}

export interface TrendingMeta {
  country: string | null;
  niche: string;
  mode: TrendingMode;
  platform: TrendingPlatform | string;
  total: number;
  page: number;
  per_page: number;
  has_more: boolean;
  cached: boolean;
  cache_age_seconds: number | null;
}

export interface TrendingResponse {
  posts: TrendingPostItem[];
  meta: TrendingMeta;
}

export interface FetchTrendingParams {
  niche: TrendingNiche;
  mode: TrendingMode;
  country?: string;
  time_range: TrendingTimeRange;
  platform?: TrendingPlatform;
  page?: number;
  refresh?: boolean;
}

export async function fetchTrending(
  params: FetchTrendingParams,
  accessToken: string,
): Promise<TrendingResponse> {
  const base = getApiBaseUrl();
  const qs = new URLSearchParams({
    niche: params.niche,
    mode: params.mode,
    time_range: params.time_range,
    platform: params.platform ?? "youtube",
    page: String(params.page ?? 1),
  });
  if (params.country) qs.set("country", params.country);
  if (params.refresh) qs.set("refresh", "true");

  const res = await fetchWithAccessTokenRetry(
    `${base}/trending?${qs.toString()}`,
    accessToken,
    (token) => ({ Authorization: `Bearer ${token}` }),
  );
  return res.json() as Promise<TrendingResponse>;
}

export function formatCount(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

export function platformLabel(platform: string): string {
  const found = TRENDING_PLATFORMS.find((p) => p.value === platform);
  return found?.label ?? platform;
}

export interface CreatePostFromTrendingRequest {
  post_url: string;
  post_title: string;
  post_snippet?: string | null;
  post_image?: string | null;
  source_platform: string;
  author?: string | null;
  view_count?: number | null;
  like_count?: number | null;
  comment_count?: number | null;
  share_count?: number | null;
  platform: string;
  account_name?: string | null;
  account_handle?: string | null;
}

export interface CreatePostFromTrendingResponse {
  content: string;
  title: string | null;
  article_image: string | null;
  platform: string;
}

export async function createPostFromTrending(
  body: CreatePostFromTrendingRequest,
  accessToken: string,
  workspaceId: string,
): Promise<CreatePostFromTrendingResponse> {
  const base = getApiBaseUrl();
  const res = await fetchWithAccessTokenRetry(
    `${base}/trending/create-post`,
    accessToken,
    (token) => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Workspace-Id": workspaceId,
    }),
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    throw new Error((err.detail as string) ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<CreatePostFromTrendingResponse>;
}
