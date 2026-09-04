import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";

export type UnifiedReactAction = "like" | "unlike";

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

/** POST /unified/comments/react — like/unlike a supported platform comment. */
export async function reactUnifiedComment(
  accessToken: string,
  workspaceId: string,
  payload: {
    action: UnifiedReactAction;
    platform: string;
    commentId: string;
    postId: string;
    pageId?: string;
    commentUrn?: string;
    commentCid?: string;
    reactionId?: string;
    organizationId?: string;
  },
): Promise<{
  success: true;
  liked?: boolean | null;
  reactionId?: string | null;
  message?: string;
}> {
  const base = getApiBaseUrl();
  const params = new URLSearchParams();
  const platform = payload.platform.trim().toLowerCase();
  params.set("platform", platform);
  params.set("action", payload.action);
  params.set("comment_id", payload.commentId.trim());
  params.set("post_id", payload.postId.trim());
  const commentUrn = payload.commentUrn?.trim();
  if (commentUrn) {
    params.set("comment_urn", commentUrn);
  }
  const commentCid = payload.commentCid?.trim();
  if (commentCid) {
    params.set("comment_cid", commentCid);
  }
  const reactionId = payload.reactionId?.trim();
  if (reactionId) {
    params.set("reaction_id", reactionId);
  }
  const pageId = payload.pageId?.trim();
  if (platform === "facebook" && pageId) {
    params.set("facebook_page_id", pageId);
  }
  const organizationId = payload.organizationId?.trim();
  if (platform === "linkedin" && organizationId) {
    params.set("linkedin_organization_id", organizationId);
  }
  const res = await fetchWithAccessTokenRetry(
    `${base}/unified/comments/react?${params.toString()}`,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    { method: "POST", body: JSON.stringify({}) },
  );
  const raw: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    let msg = "Reaction failed.";
    if (raw && typeof raw === "object") {
      const o = raw as { detail?: string; message?: string; error?: string };
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
      liked?: boolean | null;
      reaction_id?: string | null;
      message?: string;
    };
    if (data.success === true) {
      return {
        success: true,
        liked: data.liked ?? null,
        reactionId:
          typeof data.reaction_id === "string" ? data.reaction_id : null,
        message: typeof data.message === "string" ? data.message : undefined,
      };
    }
    throw new Error(
      (typeof data.message === "string" && data.message) || "Reaction failed.",
    );
  }
  throw new Error("Reaction failed.");
}
