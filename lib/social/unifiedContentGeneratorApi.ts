import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";
import type { StockMediaItem } from "@/lib/social/stockMediaApi";

export interface GenerateUnifiedContentRequestJson {
  idea: string;
  platforms: string[];
  target_platforms?: string[];
  user_requirements?: string;
  page_id?: string;
  idea_by_platform?: Record<string, string>;
}

export interface GenerateUnifiedContentResponseJson {
  success: boolean;
  message?: string | null;
  data?: Record<
    string,
    {
      content?: string;
      title?: string;
      description?: string;
      youtube_title?: string;
      youtube_description?: string;
      pinterest_title?: string;
      pinterest_description?: string;
      tiktok_title?: string;
      wordpress_title?: string;
      wordpress_slug?: string;
      wordpress_content?: string;
      wordpress_excerpt?: string;
      recommended_images?: StockMediaItem[];
      error?: string;
    }
  >;
  error?: string | null;
}

function headers(accessToken: string): Record<string, string> {
  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

/** POST /unified/content/generate?workspace_id=… — same as mobile `generateUnifiedContent`. */
export async function generateUnifiedContent(
  accessToken: string,
  workspaceId: string,
  body: GenerateUnifiedContentRequestJson,
): Promise<GenerateUnifiedContentResponseJson> {
  const params = new URLSearchParams();
  params.set("workspace_id", workspaceId);
  const url = `${getApiBaseUrl()}/unified/content/generate?${params.toString()}`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => headers(t),
    { method: "POST", body: JSON.stringify(body) },
  );
  const data: unknown = await res.json().catch(() => null);
  return data as GenerateUnifiedContentResponseJson;
}
