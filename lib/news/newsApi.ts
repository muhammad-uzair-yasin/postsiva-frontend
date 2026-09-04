import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";

export type NewsNiche =
  | "mix"
  | "general"
  | "technology"
  | "business"
  | "sports"
  | "health"
  | "science"
  | "entertainment"
  | "marketing"
  | "finance"
  | "politics"
  | "lifestyle"
  | "travel";

export type NewsMode = "global" | "country";
export type NewsTimeRange = "today" | "week" | "month";

export interface ArticleItem {
  title: string;
  url: string;
  image: string | null;
  source: string | null;
  published_at: string | null;
  snippet: string | null;
  source_type: "rss" | "searxng" | "gnews";
}

export interface NewsMeta {
  country: string | null;
  niche: string;
  mode: NewsMode;
  total: number;
  page: number;
  per_page: number;
  has_more: boolean;
  cached: boolean;
  cache_age_seconds: number | null;
}

export interface NewsResponse {
  articles: ArticleItem[];
  meta: NewsMeta;
}

export interface NewsMetaInfo {
  niches: NewsNiche[];
  time_ranges: NewsTimeRange[];
  modes: NewsMode[];
  countries: string[];
  per_page: number;
}

export interface FetchNewsParams {
  niche: NewsNiche;
  mode: NewsMode;
  country?: string;
  time_range: NewsTimeRange;
  page?: number;
  q?: string;
  /** Bypass Redis cache and refetch; server repopulates cache. */
  refresh?: boolean;
}

export async function fetchNews(
  params: FetchNewsParams,
  accessToken: string,
): Promise<NewsResponse> {
  const base = getApiBaseUrl();
  const qs = new URLSearchParams({
    niche: params.niche,
    mode: params.mode,
    time_range: params.time_range,
    page: String(params.page ?? 1),
  });
  if (params.country) qs.set("country", params.country);
  if (params.q) qs.set("q", params.q);
  if (params.refresh) qs.set("refresh", "true");

  const res = await fetchWithAccessTokenRetry(
    `${base}/news?${qs.toString()}`,
    accessToken,
    (token) => ({ Authorization: `Bearer ${token}` }),
  );
  return res.json() as Promise<NewsResponse>;
}

export async function fetchNewsMeta(accessToken: string): Promise<NewsMetaInfo> {
  const base = getApiBaseUrl();
  const res = await fetchWithAccessTokenRetry(
    `${base}/news/meta`,
    accessToken,
    (token) => ({ Authorization: `Bearer ${token}` }),
  );
  return res.json() as Promise<NewsMetaInfo>;
}

export interface CreatePostFromNewsRequest {
  article_url: string;
  article_title: string;
  article_snippet?: string | null;
  article_image?: string | null;
  platform: string;
  account_name?: string | null;
  account_handle?: string | null;
}

export interface CreatePostFromNewsResponse {
  content: string;
  /** Platform-specific title when required (YouTube, Pinterest, TikTok, WordPress). */
  title?: string | null;
  article_image: string | null;
  platform: string;
}

export async function createPostFromNews(
  body: CreatePostFromNewsRequest,
  accessToken: string,
  workspaceId: string,
): Promise<CreatePostFromNewsResponse> {
  const base = getApiBaseUrl();
  const res = await fetchWithAccessTokenRetry(
    `${base}/news/create-post`,
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
    const err = await res.json().catch(() => ({})) as Record<string, unknown>;
    throw new Error((err.detail as string) ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<CreatePostFromNewsResponse>;
}

export const COUNTRY_NAMES: Record<string, string> = {
  AE: "🇦🇪 UAE",
  AR: "🇦🇷 Argentina",
  AU: "🇦🇺 Australia",
  BA: "🇧🇦 Bosnia",
  BD: "🇧🇩 Bangladesh",
  BR: "🇧🇷 Brazil",
  CA: "🇨🇦 Canada",
  CN: "🇨🇳 China",
  DE: "🇩🇪 Germany",
  EG: "🇪🇬 Egypt",
  FR: "🇫🇷 France",
  GB: "🇬🇧 UK",
  GH: "🇬🇭 Ghana",
  GR: "🇬🇷 Greece",
  ID: "🇮🇩 Indonesia",
  IN: "🇮🇳 India",
  JP: "🇯🇵 Japan",
  KE: "🇰🇪 Kenya",
  MX: "🇲🇽 Mexico",
  MY: "🇲🇾 Malaysia",
  NG: "🇳🇬 Nigeria",
  NL: "🇳🇱 Netherlands",
  NZ: "🇳🇿 New Zealand",
  PH: "🇵🇭 Philippines",
  PK: "🇵🇰 Pakistan",
  PL: "🇵🇱 Poland",
  RU: "🇷🇺 Russia",
  SA: "🇸🇦 Saudi Arabia",
  SE: "🇸🇪 Sweden",
  SG: "🇸🇬 Singapore",
  TH: "🇹🇭 Thailand",
  TR: "🇹🇷 Turkey",
  UA: "🇺🇦 Ukraine",
  US: "🇺🇸 United States",
  ZA: "🇿🇦 South Africa",
};

export const NICHE_LABELS: Record<NewsNiche, string> = {
  mix: "Mix",
  general: "General",
  technology: "Technology",
  business: "Business",
  sports: "Sports",
  health: "Health",
  science: "Science",
  entertainment: "Entertainment",
  marketing: "Marketing",
  finance: "Finance",
  politics: "Politics",
  lifestyle: "Lifestyle",
  travel: "Travel",
};

export const NICHE_ICONS: Record<NewsNiche, string> = {
  mix: "apps",
  general: "public",
  technology: "memory",
  business: "business_center",
  sports: "sports_soccer",
  health: "favorite",
  science: "science",
  entertainment: "movie",
  marketing: "campaign",
  finance: "attach_money",
  politics: "account_balance",
  lifestyle: "spa",
  travel: "flight",
};
