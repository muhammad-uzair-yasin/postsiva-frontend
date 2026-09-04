import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";
import type { StockMediaItem } from "@/lib/social/stockMediaApi";

export interface GenerateUnifiedImageToContentRequestJson {
  image_url: string;
  platform: string;
  target_platforms?: string[];
  user_requirements?: string;
  page_id?: string;
}

export interface GenerateUnifiedImageToContentResponseJson {
  success: boolean;
  message?: string | null;
  data?: {
    content?: string;
    title?: string;
    description?: string;
    youtube_title?: string | null;
    pinterest_title?: string | null;
    tiktok_title?: string | null;
    wordpress_title?: string;
    wordpress_slug?: string;
    wordpress_content?: string;
    wordpress_excerpt?: string;
    recommended_images?: StockMediaItem[];
    error?: string;
  };
  error?: string | null;
}

function headers(accessToken: string): Record<string, string> {
  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

/** POST /unified/image-to-content/generate?workspace_id=… — same as mobile. */
export async function generateUnifiedImageToContent(
  accessToken: string,
  workspaceId: string,
  body: GenerateUnifiedImageToContentRequestJson,
): Promise<GenerateUnifiedImageToContentResponseJson> {
  const params = new URLSearchParams();
  params.set("workspace_id", workspaceId);
  const url = `${getApiBaseUrl()}/unified/image-to-content/generate?${params.toString()}`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => headers(t),
    { method: "POST", body: JSON.stringify(body) },
  );
  const data: unknown = await res.json().catch(() => null);
  return data as GenerateUnifiedImageToContentResponseJson;
}
