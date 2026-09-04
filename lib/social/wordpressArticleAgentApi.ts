import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";
import { readApiErrorMessage } from "@/lib/auth/authApi";
import type { StockMediaItem, StockImportResponse } from "@/lib/social/stockMediaApi";

export interface WordPressArticleAgentRequest {
  prompt: string;
  source_url?: string;
  source_type?: "text" | "image" | "video" | "mixed";
  user_requirements?: string;
  target_length?: "standard" | "long" | "pillar";
  tone?: string;
  audience?: string;
  language?: string;
  seo_keywords?: string[];
  thread_id?: string;
}

export interface WordPressArticleAgentOutput {
  content: string;
  wordpress_title: string;
  wordpress_slug: string;
  wordpress_content: string;
  wordpress_excerpt: string;
  meta_description: string;
  seo_keywords: string[];
  suggested_categories: string[];
  suggested_tags: string[];
  featured_image_search_keywords: string[];
  recommended_images: StockMediaItem[];
  word_count: number;
  reading_time_minutes: number;
}

function headers(accessToken: string, workspaceId: string): Record<string, string> {
  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Workspace-Id": workspaceId,
  };
}

export async function generateWordPressArticleAgent(
  accessToken: string,
  workspaceId: string,
  body: WordPressArticleAgentRequest,
): Promise<WordPressArticleAgentOutput> {
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/wordpress/deep-agent/article`,
    accessToken,
    (token) => headers(token, workspaceId),
    { method: "POST", body: JSON.stringify(body) },
  );
  if (!res.ok) {
    throw new Error(await readApiErrorMessage(res));
  }
  return (await res.json()) as WordPressArticleAgentOutput;
}

export async function importWordPressRecommendedImage(
  accessToken: string,
  workspaceId: string,
  item: Pick<StockMediaItem, "full_url" | "media_type">,
  filename?: string,
): Promise<StockImportResponse> {
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/wordpress/deep-agent/recommended-image/import`,
    accessToken,
    (token) => headers(token, workspaceId),
    {
      method: "POST",
      body: JSON.stringify({
        stock_url: item.full_url,
        media_type: "image",
        ...(filename ? { filename } : {}),
      }),
    },
  );
  if (!res.ok) {
    throw new Error(await readApiErrorMessage(res));
  }
  return (await res.json()) as StockImportResponse;
}
