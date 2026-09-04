import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";
import { createUnifiedBlogComment } from "@/lib/social/unifiedBlogCommentsApi";
import { isWordPressUnifiedPlatform } from "@/lib/social/unifiedBlogPlatform";

function workspaceHeaders(
  accessToken: string,
  workspaceId: string,
): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
    "X-Workspace-Id": workspaceId,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

/** POST /unified/comments/create — top-level comment on a post/video. */
export async function createUnifiedComment(
  accessToken: string,
  workspaceId: string,
  payload: {
    platform: string;
    postId: string;
    text: string;
    pageId?: string;
    youtubeChannelId?: string;
    organizationId?: string;
  },
): Promise<{ success: true; comment_id?: string | null; message?: string }> {
  const platform = payload.platform.trim().toLowerCase();
  if (isWordPressUnifiedPlatform(platform)) {
    return createUnifiedBlogComment(accessToken, workspaceId, {
      postId: payload.postId,
      text: payload.text,
    });
  }

  const base = getApiBaseUrl();
  const params = new URLSearchParams();
  params.set("platform", platform);

  const body: Record<string, string> = {
    text: payload.text.trim(),
    post_id: payload.postId.trim(),
  };
  const pageId = payload.pageId?.trim();
  if (pageId) {
    body.facebook_page_id = pageId;
  }
  const youtubeChannelId = payload.youtubeChannelId?.trim();
  if (platform === "youtube" && youtubeChannelId) {
    body.youtube_channel_id = youtubeChannelId;
  }
  const organizationId = payload.organizationId?.trim();
  if (platform === "linkedin" && organizationId) {
    body.linkedin_organization_id = organizationId;
  }
  const url = `${base}/unified/comments/create?${params.toString()}`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    { method: "POST", body: JSON.stringify(body) },
  );
  const raw: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    let msg = "Comment failed.";
    if (raw && typeof raw === "object") {
      const o = raw as { message?: string; error?: string; detail?: string };
      msg =
        (typeof o.detail === "string" && o.detail) ||
        (typeof o.message === "string" && o.message) ||
        (typeof o.error === "string" && o.error) ||
        msg;
    }
    throw new Error(msg);
  }
  if (raw && typeof raw === "object") {
    const data = raw as {
      success?: boolean;
      comment_id?: string | null;
      message?: string;
    };
    if (data.success === true) {
      return {
        success: true,
        comment_id: data.comment_id ?? null,
        message: typeof data.message === "string" ? data.message : undefined,
      };
    }
    throw new Error(
      (typeof data.message === "string" && data.message) || "Comment failed.",
    );
  }
  throw new Error("Comment failed.");
}
