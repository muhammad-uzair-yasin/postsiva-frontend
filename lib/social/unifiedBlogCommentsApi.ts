import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";
import type {
  UnifiedCommentRepliesResponseJson,
  UnifiedCommentsResponseJson,
  UnifiedSinglePostCommentsResponseJson,
} from "@/lib/inbox/unifiedCommentsTypes";
import type { UnifiedModerateAction } from "@/lib/social/unifiedCommentModerationApi";

function workspaceHeaders(
  accessToken: string,
  workspaceId: string,
  withJson = false,
): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
    "X-Workspace-Id": workspaceId,
    Accept: "application/json",
    ...(withJson ? { "Content-Type": "application/json" } : {}),
  };
}

const BLOG_COMMENTS_BASE = () => `${getApiBaseUrl()}/unified/blog/comments`;

export async function fetchUnifiedBlogComments(
  accessToken: string,
  workspaceId: string,
  options: {
    limit?: number;
    commentsPerPost?: number;
    forceRefresh?: boolean;
    connectionId?: string;
  } = {},
): Promise<UnifiedCommentsResponseJson> {
  const params = new URLSearchParams();
  params.set("limit", String(options.limit ?? 10));
  params.set("comments_per_post", String(options.commentsPerPost ?? 50));
  params.set("force_refresh", String(options.forceRefresh ?? false));
  if (options.connectionId?.trim()) {
    params.set("connection_id", options.connectionId.trim());
  }
  const url = `${BLOG_COMMENTS_BASE()}/?${params.toString()}`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    { method: "GET" },
  );
  return (await res.json()) as UnifiedCommentsResponseJson;
}

export async function fetchUnifiedBlogCommentsByPost(
  accessToken: string,
  workspaceId: string,
  options: {
    postId: string;
    commentsPerPost?: number;
    forceRefresh?: boolean;
  },
): Promise<UnifiedSinglePostCommentsResponseJson> {
  const params = new URLSearchParams();
  params.set("post_id", options.postId.trim());
  params.set("comments_per_post", String(options.commentsPerPost ?? 50));
  params.set("force_refresh", String(options.forceRefresh ?? false));
  const url = `${BLOG_COMMENTS_BASE()}/by-post?${params.toString()}`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    { method: "GET" },
  );
  const data = (await res.json()) as UnifiedSinglePostCommentsResponseJson;
  if (!data.success || !Array.isArray(data.comments)) {
    throw new Error(data.error ?? data.message ?? "Could not load comments.");
  }
  return data;
}

export async function fetchUnifiedBlogCommentReplies(
  accessToken: string,
  workspaceId: string,
  options: {
    postId: string;
    commentId: string;
    limit?: number;
    forceRefresh?: boolean;
  },
): Promise<UnifiedCommentRepliesResponseJson> {
  const params = new URLSearchParams();
  params.set("post_id", options.postId.trim());
  params.set("comment_id", options.commentId.trim());
  params.set("limit", String(options.limit ?? 50));
  params.set("force_refresh", String(options.forceRefresh ?? false));
  const url = `${BLOG_COMMENTS_BASE()}/replies?${params.toString()}`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    { method: "GET" },
  );
  const data = (await res.json()) as UnifiedCommentRepliesResponseJson;
  if (!data.success || !Array.isArray(data.replies)) {
    throw new Error(data.message ?? data.error ?? "Could not load replies.");
  }
  return data;
}

export async function createUnifiedBlogComment(
  accessToken: string,
  workspaceId: string,
  payload: { postId: string; text: string },
): Promise<{ success: true; comment_id?: string | null; message?: string }> {
  const params = new URLSearchParams();
  params.set("post_id", payload.postId.trim());
  const url = `${BLOG_COMMENTS_BASE()}/create?${params.toString()}`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId, true),
    { method: "POST", body: JSON.stringify({ text: payload.text.trim() }) },
  );
  const raw: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(parseError(raw, "Comment failed."));
  }
  const data = raw as { success?: boolean; comment_id?: string | null; message?: string };
  if (data.success !== true) {
    throw new Error(data.message ?? "Comment failed.");
  }
  return {
    success: true,
    comment_id: data.comment_id ?? null,
    message: data.message,
  };
}

export async function replyUnifiedBlogComment(
  accessToken: string,
  workspaceId: string,
  payload: { commentId: string; text: string },
): Promise<{ success: true; reply_id?: string | null; message?: string }> {
  const params = new URLSearchParams();
  params.set("comment_id", payload.commentId.trim());
  const url = `${BLOG_COMMENTS_BASE()}/reply?${params.toString()}`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId, true),
    { method: "POST", body: JSON.stringify({ text: payload.text.trim() }) },
  );
  const raw: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(parseError(raw, "Reply failed."));
  }
  const data = raw as { success?: boolean; reply_id?: string | null; message?: string };
  if (data.success !== true) {
    throw new Error(data.message ?? "Reply failed.");
  }
  return {
    success: true,
    reply_id: data.reply_id ?? null,
    message: data.message,
  };
}

export async function moderateUnifiedBlogComment(
  accessToken: string,
  workspaceId: string,
  payload: {
    action: UnifiedModerateAction;
    commentId: string;
    postId: string;
  },
): Promise<{ success: true; is_hidden?: boolean | null; message?: string }> {
  const params = new URLSearchParams();
  params.set("action", payload.action);
  params.set("comment_id", payload.commentId.trim());
  params.set("post_id", payload.postId.trim());
  const url = `${BLOG_COMMENTS_BASE()}/moderate?${params.toString()}`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId, true),
    { method: "POST", body: JSON.stringify({}) },
  );
  const raw: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(parseError(raw, "Moderation failed."));
  }
  const data = raw as { success?: boolean; is_hidden?: boolean | null; message?: string };
  if (data.success !== true) {
    throw new Error(data.message ?? "Moderation failed.");
  }
  return {
    success: true,
    is_hidden: data.is_hidden ?? null,
    message: data.message,
  };
}

function parseError(raw: unknown, fallback: string): string {
  if (raw && typeof raw === "object") {
    const o = raw as { message?: string; error?: string; detail?: string };
    return o.detail ?? o.message ?? o.error ?? fallback;
  }
  return fallback;
}
