import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";

export interface GenerateYoutubeThumbnailRequest {
  youtube_title?: string;
  youtube_description?: string;
}

export interface GenerateYoutubeThumbnailResponse {
  success: boolean;
  message?: string;
  source?: string;
  image_url?: string;
  media_id?: string;
  prompt?: string;
}

export async function generateYoutubeThumbnailFromText(
  accessToken: string,
  workspaceId: string,
  body: GenerateYoutubeThumbnailRequest,
): Promise<GenerateYoutubeThumbnailResponse> {
  const url = `${getApiBaseUrl()}/youtube/content-generation/thumbnail/generate`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => ({
      Authorization: `Bearer ${t}`,
      "X-Workspace-Id": workspaceId,
      "Content-Type": "application/json",
      Accept: "application/json",
    }),
    { method: "POST", body: JSON.stringify(body) },
  );
  const data = (await res.json()) as GenerateYoutubeThumbnailResponse;
  return data;
}
