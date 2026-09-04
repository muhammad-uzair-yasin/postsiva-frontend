import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";
import { readApiErrorMessage } from "@/lib/auth/authApi";

export type StockMediaType = "image" | "video";
export type StockOrientation = "landscape" | "portrait" | "square";
export type StockSize = "large" | "medium" | "small";
export type StockProvider = "all" | "pexels" | "pixabay" | "unsplash";

export interface StockMediaItem {
  stock_id: string;
  media_type: StockMediaType;
  thumb_url: string;
  preview_url: string;
  full_url: string;
  width: number;
  height: number;
  duration?: number | null;
  credit_name: string;
  credit_url: string;
  alt?: string;
  creator_username?: string;
  source_page_url?: string;
  attribution_required?: boolean;
}

export interface StockSearchResponse {
  success: boolean;
  query: string;
  media_type: StockMediaType;
  page: number;
  per_page: number;
  items: StockMediaItem[];
  has_more: boolean;
  stale: boolean;
}

export interface StockImportResponse {
  success: boolean;
  media_id: string;
  public_url: string;
  media_type: StockMediaType;
  filename: string;
}

export interface StockSearchParams {
  query?: string;
  mediaType: StockMediaType;
  orientation?: StockOrientation | null;
  size?: StockSize | null;
  color?: string | null;
  provider?: StockProvider;
  page?: number;
  perPage?: number;
}

function headers(accessToken: string, workspaceId: string): Record<string, string> {
  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json",
    "X-Workspace-Id": workspaceId,
  };
}

export async function searchStockMedia(
  accessToken: string,
  workspaceId: string,
  params: StockSearchParams,
): Promise<StockSearchResponse> {
  const search = new URLSearchParams({
    media_type: params.mediaType,
    page: String(params.page ?? 1),
    per_page: String(params.perPage ?? 24),
  });
  if (params.query?.trim()) search.set("query", params.query.trim());
  if (params.orientation) search.set("orientation", params.orientation);
  if (params.size) search.set("size", params.size);
  if (params.color) search.set("color", params.color);
  if (params.provider && params.provider !== "all") search.set("provider", params.provider);
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/stock-media/search?${search.toString()}`,
    accessToken,
    (token) => headers(token, workspaceId),
  );
  if (!res.ok) {
    throw new Error(await readApiErrorMessage(res));
  }
  return (await res.json()) as StockSearchResponse;
}

export interface UnsplashSelectResponse {
  success: boolean;
  item: StockMediaItem;
}

/** Trigger the Unsplash download event server-side; must succeed before attaching. */
export async function selectUnsplashPhoto(
  accessToken: string,
  workspaceId: string,
  stockId: string,
): Promise<UnsplashSelectResponse> {
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/stock-media/unsplash/select`,
    accessToken,
    (token) => ({ ...headers(token, workspaceId), "Content-Type": "application/json" }),
    { method: "POST", body: JSON.stringify({ photo_id: stockId }) },
  );
  if (!res.ok) {
    throw new Error(await readApiErrorMessage(res));
  }
  return (await res.json()) as UnsplashSelectResponse;
}

export async function importStockMedia(
  accessToken: string,
  workspaceId: string,
  item: Pick<StockMediaItem, "full_url" | "media_type">,
  filename?: string,
): Promise<StockImportResponse> {
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/stock-media/import`,
    accessToken,
    (token) => ({ ...headers(token, workspaceId), "Content-Type": "application/json" }),
    {
      method: "POST",
      body: JSON.stringify({
        stock_url: item.full_url,
        media_type: item.media_type,
        ...(filename ? { filename } : {}),
      }),
    },
  );
  if (!res.ok) {
    throw new Error(await readApiErrorMessage(res));
  }
  return (await res.json()) as StockImportResponse;
}
