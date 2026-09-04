import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";
import { fetchUnifiedBlogPostById } from "@/lib/social/unifiedBlogPostsApi";

export async function refreshSinglePost(
  accessToken: string,
  workspaceId: string,
  postId: string,
  platform: string,
  organizationId?: string | null,
  pageId?: string | null,
  forceRefresh = false,
) {
  if (platform.trim().toLowerCase() === "wordpress") {
    return fetchUnifiedBlogPostById(accessToken, workspaceId, postId, {
      forceRefresh,
    });
  }

  const base = getApiBaseUrl();
  const params = new URLSearchParams({
    platform,
    ...(organizationId && { organization_id: organizationId }),
    ...(pageId && { page_id: pageId }),
    refresh: String(forceRefresh),
  });

  const url = `${base}/unified/posts/${encodeURIComponent(postId)}?${params}`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => ({ Authorization: `Bearer ${t}`, "X-Workspace-Id": workspaceId }),
    { method: "GET" },
  );

  if (!res.ok) throw new Error(`Failed to refresh post: ${res.status}`);
  return res.json();
}
