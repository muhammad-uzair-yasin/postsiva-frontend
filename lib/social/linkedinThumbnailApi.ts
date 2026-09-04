import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";

export interface GenerateLinkedinThumbnailRequest {
  linkedin_title?: string;
  linkedin_description?: string;
}

export interface GenerateLinkedinThumbnailResponse {
  success: boolean;
  message?: string;
  source?: string;
  image_url?: string;
  media_id?: string;
  prompt?: string;
}

export async function generateLinkedinThumbnailFromText(
  accessToken: string,
  workspaceId: string,
  body: GenerateLinkedinThumbnailRequest,
): Promise<GenerateLinkedinThumbnailResponse> {
  const response = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/linkedin/content-generator/thumbnail/generate`,
    accessToken,
    (token) => ({
      Authorization: `Bearer ${token}`,
      "X-Workspace-Id": workspaceId,
      "Content-Type": "application/json",
      Accept: "application/json",
    }),
    { method: "POST", body: JSON.stringify(body) },
  );
  const payload = (await response.json()) as GenerateLinkedinThumbnailResponse;
  if (!response.ok) {
    return {
      success: false,
      message:
        payload?.message || "Failed to generate LinkedIn thumbnail",
    };
  }
  return payload;
}
