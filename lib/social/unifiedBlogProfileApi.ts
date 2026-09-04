import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";

function workspaceHeaders(
  accessToken: string,
  workspaceId: string,
): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
    "X-Workspace-Id": workspaceId,
    Accept: "application/json",
  };
}

/** GET /unified/blog/profile — WordPress site profile slice. */
export async function fetchUnifiedBlogProfile(
  accessToken: string,
  workspaceId: string,
  options: { forceRefresh?: boolean } = {},
): Promise<Record<string, unknown>> {
  const params = new URLSearchParams();
  if (options.forceRefresh) {
    params.set("force_refresh", "true");
  }
  const q = params.toString();
  const url = q
    ? `${getApiBaseUrl()}/unified/blog/profile/?${q}`
    : `${getApiBaseUrl()}/unified/blog/profile/`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    { method: "GET" },
  );
  return (await res.json()) as Record<string, unknown>;
}
