import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";

export interface LinkOpenGraphPreview {
  url: string;
  title: string | null;
  description: string | null;
  image_url: string | null;
  site_name: string | null;
  engagement_summary: string | null;
  /** From link-preview API; omitted when building preview from composer state only. */
  facebook_link_post_allowed?: boolean;
  facebook_link_post_block_reason?: string | null;
}

function parsePreview(raw: unknown): LinkOpenGraphPreview {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid link preview response.");
  }
  const v = raw as Record<string, unknown>;
  if (typeof v.url !== "string") {
    throw new Error("Invalid link preview response.");
  }
  return {
    url: v.url,
    title: typeof v.title === "string" ? v.title : null,
    description: typeof v.description === "string" ? v.description : null,
    image_url: typeof v.image_url === "string" ? v.image_url : null,
    site_name: typeof v.site_name === "string" ? v.site_name : null,
    engagement_summary:
      typeof v.engagement_summary === "string" ? v.engagement_summary : null,
    facebook_link_post_allowed:
      v.facebook_link_post_allowed !== false,
    facebook_link_post_block_reason:
      typeof v.facebook_link_post_block_reason === "string"
        ? v.facebook_link_post_block_reason
        : null,
  };
}

export async function fetchLinkOpenGraphPreview(
  token: string,
  workspaceId: string,
  url: string,
): Promise<LinkOpenGraphPreview> {
  const q = new URLSearchParams({ url: url.trim() });
  const endpoint = `${getApiBaseUrl()}/workspaces/${encodeURIComponent(workspaceId)}/link-preview?${q.toString()}`;
  const response = await fetchWithAccessTokenRetry(
    endpoint,
    token,
    (accessToken) => ({
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    }),
    { method: "GET" },
  );
  return parsePreview(await response.json());
}
