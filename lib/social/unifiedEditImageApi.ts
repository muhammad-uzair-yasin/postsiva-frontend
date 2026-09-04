import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";

export interface GenerateUnifiedEditImageRequestJson {
  image_url: string;
  user_requirements: string;
  platform: string;
  page_id?: string;
}

export interface GenerateUnifiedEditImageResponseJson {
  success: boolean;
  message?: string | null;
  data?: { image_url?: string; media_id?: string; error?: string };
  error?: string | null;
}

function headers(accessToken: string): Record<string, string> {
  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

/** POST /unified/edit-image/generate?workspace_id=… — same as mobile. */
export async function generateUnifiedEditImage(
  accessToken: string,
  workspaceId: string,
  body: GenerateUnifiedEditImageRequestJson,
): Promise<GenerateUnifiedEditImageResponseJson> {
  const params = new URLSearchParams();
  params.set("workspace_id", workspaceId);
  const url = `${getApiBaseUrl()}/unified/edit-image/generate?${params.toString()}`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => headers(t),
    { method: "POST", body: JSON.stringify(body) },
  );
  const data: unknown = await res.json().catch(() => null);
  return data as GenerateUnifiedEditImageResponseJson;
}
