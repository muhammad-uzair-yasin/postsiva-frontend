import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";

export interface GenerateUnifiedImageRequestJson {
  content: string;
  platforms: string[];
  user_requirements?: string;
  page_id?: string;
  content_by_platform?: Record<string, string>;
}

export interface GenerateUnifiedImagePlatformResultJson {
  image_url?: string;
  media_id?: string;
  image_prompt?: string;
  error?: string;
}

export interface GenerateUnifiedImageResponseJson {
  success: boolean;
  message?: string | null;
  data?: Record<string, GenerateUnifiedImagePlatformResultJson>;
  error?: string | null;
}

function headers(accessToken: string): Record<string, string> {
  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

/** POST /unified/image/generate?workspace_id=… — same as mobile `generateUnifiedImage`. */
export async function generateUnifiedImage(
  accessToken: string,
  workspaceId: string,
  body: GenerateUnifiedImageRequestJson,
): Promise<GenerateUnifiedImageResponseJson> {
  const params = new URLSearchParams();
  params.set("workspace_id", workspaceId);
  const url = `${getApiBaseUrl()}/unified/image/generate?${params.toString()}`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => headers(t),
    { method: "POST", body: JSON.stringify(body) },
  );
  const data: unknown = await res.json().catch(() => null);
  return data as GenerateUnifiedImageResponseJson;
}
