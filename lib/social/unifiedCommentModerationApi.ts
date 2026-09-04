import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";
import { buildModerateRequestBody } from "@/lib/inbox/inboxCommentActionContext";
import { parseApiErrorBody } from "@/lib/api/parseApiError";
import { moderateUnifiedBlogComment } from "@/lib/social/unifiedBlogCommentsApi";
import { isWordPressUnifiedPlatform } from "@/lib/social/unifiedBlogPlatform";

// `spam`/`unspam` are WordPress-only; the backend default-denies them elsewhere.
export type UnifiedModerateAction =
  | "hide"
  | "unhide"
  | "delete"
  | "block"
  | "spam"
  | "unspam";

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

/** POST /unified/comments/moderate — hide/unhide/delete/block/spam/unspam a comment or author. */
export async function moderateUnifiedComment(
  accessToken: string,
  workspaceId: string,
  payload: {
    action: UnifiedModerateAction;
    platform: string;
    commentId: string;
    postId: string;
    pageId?: string;
    youtubeChannelId?: string;
    organizationId?: string;
    authorId?: string;
  },
): Promise<{ success: true; is_hidden?: boolean | null; message?: string }> {
  const platform = payload.platform.trim().toLowerCase();
  if (isWordPressUnifiedPlatform(platform)) {
    return moderateUnifiedBlogComment(accessToken, workspaceId, {
      action: payload.action,
      commentId: payload.commentId,
      postId: payload.postId,
    });
  }

  const base = getApiBaseUrl();
  const params = new URLSearchParams();
  params.set("platform", platform);
  params.set("action", payload.action);

  const body = buildModerateRequestBody({
    platform,
    commentId: payload.commentId,
    postId: payload.postId,
    pageId: payload.pageId,
    youtubeChannelId: payload.youtubeChannelId,
    organizationId: payload.organizationId,
    authorId: payload.authorId,
  });

  const url = `${base}/unified/comments/moderate?${params.toString()}`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    { method: "POST", body: JSON.stringify(body) },
  );
  const raw: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(parseApiErrorBody(raw));
  }
  if (raw && typeof raw === "object") {
    const data = raw as {
      success?: boolean;
      is_hidden?: boolean | null;
      message?: string;
    };
    if (data.success === true) {
      return {
        success: true,
        is_hidden: data.is_hidden ?? null,
        message: typeof data.message === "string" ? data.message : undefined,
      };
    }
    throw new Error(
      (typeof data.message === "string" && data.message) || "Moderation failed.",
    );
  }
  throw new Error("Moderation failed.");
}
