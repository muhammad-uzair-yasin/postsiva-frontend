import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";

export type DemandMode = "global" | "country";
export type DemandSection = "rising" | "topic" | "culture";

export interface RisingItem {
  title: string;
  traffic: string | null;
  image: string | null;
  image_source: string | null;
  published_at: string | null;
  url: string | null;
  country: string | null;
}

export interface RisingResponse {
  items: RisingItem[];
  country: string | null;
  mode: DemandMode;
  total: number;
  cached: boolean;
  cache_age_seconds: number | null;
}

export interface TopicSuggestion {
  text: string;
  prefix: string | null;
}

export interface TopicGroup {
  prefix: string;
  suggestions: TopicSuggestion[];
}

export interface TopicResponse {
  q: string;
  country: string | null;
  mode: DemandMode;
  groups: TopicGroup[];
  total: number;
  cached: boolean;
  cache_age_seconds: number | null;
}

export interface CultureItem {
  title: string;
  article: string;
  views: number;
  rank: number;
  url: string;
}

export interface CultureResponse {
  items: CultureItem[];
  date: string;
  total: number;
  cached: boolean;
  cache_age_seconds: number | null;
}

export async function fetchDemandRising(
  params: { mode: DemandMode; country?: string; refresh?: boolean },
  accessToken: string,
): Promise<RisingResponse> {
  const base = getApiBaseUrl();
  const qs = new URLSearchParams({ mode: params.mode });
  if (params.country) qs.set("country", params.country);
  if (params.refresh) qs.set("refresh", "true");
  const res = await fetchWithAccessTokenRetry(
    `${base}/demand/rising?${qs}`,
    accessToken,
    (token) => ({ Authorization: `Bearer ${token}` }),
  );
  return res.json() as Promise<RisingResponse>;
}

export async function fetchDemandTopic(
  params: { q: string; mode: DemandMode; country?: string; refresh?: boolean },
  accessToken: string,
): Promise<TopicResponse> {
  const base = getApiBaseUrl();
  const qs = new URLSearchParams({ q: params.q, mode: params.mode });
  if (params.country) qs.set("country", params.country);
  if (params.refresh) qs.set("refresh", "true");
  const res = await fetchWithAccessTokenRetry(
    `${base}/demand/topic?${qs}`,
    accessToken,
    (token) => ({ Authorization: `Bearer ${token}` }),
  );
  return res.json() as Promise<TopicResponse>;
}

export async function fetchDemandCulture(
  accessToken: string,
  params: { refresh?: boolean } = {},
): Promise<CultureResponse> {
  const base = getApiBaseUrl();
  const qs = new URLSearchParams();
  if (params.refresh) qs.set("refresh", "true");
  const suffix = qs.toString() ? `?${qs}` : "";
  const res = await fetchWithAccessTokenRetry(
    `${base}/demand/culture${suffix}`,
    accessToken,
    (token) => ({ Authorization: `Bearer ${token}` }),
  );
  return res.json() as Promise<CultureResponse>;
}

export function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

export type DemandCreateSourceType = "rising" | "topic" | "culture";

export interface CreatePostFromDemandRequest {
  source_type: DemandCreateSourceType;
  topic: string;
  source_url?: string | null;
  image_url?: string | null;
  traffic?: string | null;
  image_source?: string | null;
  country?: string | null;
  seed_q?: string | null;
  prefix?: string | null;
  article?: string | null;
  views?: number | null;
  rank?: number | null;
  platform: string;
  account_name?: string | null;
  account_handle?: string | null;
}

export interface CreatePostFromDemandResponse {
  content: string;
  title: string | null;
  article_image: string | null;
  platform: string;
}

export async function createPostFromDemand(
  body: CreatePostFromDemandRequest,
  accessToken: string,
  workspaceId: string,
): Promise<CreatePostFromDemandResponse> {
  const base = getApiBaseUrl();
  const res = await fetchWithAccessTokenRetry(
    `${base}/demand/create-post`,
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
  return res.json() as Promise<CreatePostFromDemandResponse>;
}
