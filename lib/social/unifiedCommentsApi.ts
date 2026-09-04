import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";
import {
  createUnifiedBlogComment,
  fetchUnifiedBlogCommentReplies,
  fetchUnifiedBlogComments,
  fetchUnifiedBlogCommentsByPost,
  replyUnifiedBlogComment,
} from "@/lib/social/unifiedBlogCommentsApi";
import { isWordPressUnifiedPlatform } from "@/lib/social/unifiedBlogPlatform";
import {
  normalizeLinkedInOrganizationIdForCommentsApi,
  normalizeLinkedInPostIdForCommentsApi,
} from "@/lib/social/unifiedCommentsQueryNormalize";
import type {
  UnifiedCommentClassificationProgressEvent,
  UnifiedCommentRepliesResponseJson,
  UnifiedCommentsResponseJson,
  UnifiedSinglePostCommentsResponseJson,
} from "@/lib/inbox/unifiedCommentsTypes";
import { buildReplyRequestBody } from "@/lib/inbox/inboxCommentActionContext";
import type { UnifiedInboxReplyApiTarget } from "@/lib/inbox/unifiedInboxTypes";
import type { UnifiedCommentClassificationJson } from "@/lib/inbox/unifiedCommentsTypes";
import { parseApiErrorBody } from "@/lib/api/parseApiError";

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

export interface FetchUnifiedCommentsOptions {
  limit?: number;
  commentsPerPost?: number;
  forceRefresh?: boolean;
  platforms?: readonly string[];
  facebookPageIds?: readonly string[];
  linkedinOrganizationIds?: readonly string[];
  youtubeChannelId?: string;
}

function parseSseDataBlocks(buffer: string): {
  events: string[];
  remainder: string;
} {
  const normalized = buffer.replace(/\r\n/g, "\n");
  const parts = normalized.split("\n\n");
  const remainder = parts.pop() ?? "";
  const events = parts
    .map((part) =>
      part
        .split("\n")
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice("data:".length).trimStart())
        .join("\n"),
    )
    .filter((data) => data.trim().length > 0);
  return { events, remainder };
}

export async function streamUnifiedCommentClassificationProgress(
  accessToken: string,
  workspaceId: string,
  options: {
    signal: AbortSignal;
    onProgress: (event: UnifiedCommentClassificationProgressEvent) => void;
  },
): Promise<void> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/unified/comments/classification-stream`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-Workspace-Id": workspaceId,
      Accept: "text/event-stream",
    },
    signal: options.signal,
  });
  if (!res.ok || !res.body) {
    throw new Error("Could not open comment classification stream.");
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }
    buffer += decoder.decode(value, { stream: true });
    const parsed = parseSseDataBlocks(buffer);
    buffer = parsed.remainder;
    for (const raw of parsed.events) {
      const event = JSON.parse(raw) as UnifiedCommentClassificationProgressEvent;
      options.onProgress(event);
      if (event.state === "complete" || event.state === "failed") {
        await reader.cancel();
        return;
      }
    }
  }
}

/**
 * GET /unified/comments/ — trailing slash matches backend router.
 */
export async function fetchUnifiedComments(
  accessToken: string,
  workspaceId: string,
  options: FetchUnifiedCommentsOptions = {},
): Promise<UnifiedCommentsResponseJson> {
  const requested = options.platforms ?? [];
  const hasWordpress = requested.some((p) => isWordPressUnifiedPlatform(p));
  const socialPlatforms = requested.filter((p) => !isWordPressUnifiedPlatform(p));

  if (hasWordpress && socialPlatforms.length === 0) {
    return fetchUnifiedBlogComments(accessToken, workspaceId, {
      limit: options.limit,
      commentsPerPost: options.commentsPerPost,
      forceRefresh: options.forceRefresh,
    });
  }

  const base = getApiBaseUrl();
  const params = new URLSearchParams();
  params.set("limit", String(options.limit ?? 10));
  params.set("comments_per_post", String(options.commentsPerPost ?? 50));
  params.set("force_refresh", String(options.forceRefresh ?? false));
  for (const p of socialPlatforms.length > 0 ? socialPlatforms : requested) {
    const t = p.trim();
    if (t.length > 0) {
      params.append("platforms", t);
    }
  }
  for (const id of options.facebookPageIds ?? []) {
    const t = id.trim();
    if (t.length > 0) {
      params.append("facebook_page_ids", t);
    }
  }
  for (const id of options.linkedinOrganizationIds ?? []) {
    const t = id.trim();
    if (t.length > 0) {
      params.append(
        "linkedin_organization_ids",
        normalizeLinkedInOrganizationIdForCommentsApi(t),
      );
    }
  }
  if (options.youtubeChannelId?.trim()) {
    params.set("youtube_channel_id", options.youtubeChannelId.trim());
  }
  const url = `${base}/unified/comments/?${params.toString()}`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    { method: "GET" },
  );
  const merged = (await res.json()) as UnifiedCommentsResponseJson;

  if (hasWordpress && socialPlatforms.length > 0) {
    const wpSlice = await fetchUnifiedBlogComments(accessToken, workspaceId, {
      limit: options.limit,
      commentsPerPost: options.commentsPerPost,
      forceRefresh: options.forceRefresh,
    });
    return { ...merged, wordpress: wpSlice.wordpress ?? null };
  }

  return merged;
}

/**
 * GET /unified/comments/by-post — comments for a single post.
 */
export async function fetchUnifiedCommentsByPost(
  accessToken: string,
  workspaceId: string,
  options: {
    postId: string;
    platform: string;
    commentsPerPost?: number;
    forceRefresh?: boolean;
    pageId?: string;
    organizationId?: string;
    youtubeChannelId?: string;
  },
): Promise<UnifiedSinglePostCommentsResponseJson> {
  const platformNorm = options.platform.trim().toLowerCase();
  if (isWordPressUnifiedPlatform(platformNorm)) {
    return fetchUnifiedBlogCommentsByPost(accessToken, workspaceId, {
      postId: options.postId,
      commentsPerPost: options.commentsPerPost,
      forceRefresh: options.forceRefresh,
    });
  }

  const base = getApiBaseUrl();
  const params = new URLSearchParams();
  let postIdForQuery = options.postId.trim();
  if (platformNorm === "linkedin") {
    postIdForQuery = normalizeLinkedInPostIdForCommentsApi(postIdForQuery);
  }
  params.set("post_id", postIdForQuery);
  params.set("platform", options.platform.trim());
  params.set(
    "comments_per_post",
    String(options.commentsPerPost ?? 50),
  );
  params.set("force_refresh", String(options.forceRefresh ?? false));
  if (options.pageId?.trim()) {
    params.append("facebook_page_ids", options.pageId.trim());
  }
  if (options.organizationId?.trim()) {
    params.append(
      "linkedin_organization_ids",
      normalizeLinkedInOrganizationIdForCommentsApi(options.organizationId),
    );
  }
  if (options.youtubeChannelId?.trim()) {
    params.set("youtube_channel_id", options.youtubeChannelId.trim());
  }
  const url = `${base}/unified/comments/by-post?${params.toString()}`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    { method: "GET" },
  );
  const json: unknown = await res.json();
  const data = json as UnifiedSinglePostCommentsResponseJson;
  if (!data.success || !Array.isArray(data.comments)) {
    throw new Error(data.error ?? data.message ?? "Could not load replies.");
  }
  return data;
}

/**
 * GET /unified/comments/replies — direct replies for one parent comment (LinkedIn personal/org, etc.).
 */
export async function fetchUnifiedCommentReplies(
  accessToken: string,
  workspaceId: string,
  options: {
    postId: string;
    commentId: string;
    platform: string;
    limit?: number;
    forceRefresh?: boolean;
    pageId?: string;
    /** LinkedIn company post: organization id (query name matches bulk comments API). */
    organizationId?: string;
    youtubeChannelId?: string;
  },
): Promise<UnifiedCommentRepliesResponseJson> {
  const platformNorm = options.platform.trim().toLowerCase();
  if (isWordPressUnifiedPlatform(platformNorm)) {
    return fetchUnifiedBlogCommentReplies(accessToken, workspaceId, {
      postId: options.postId,
      commentId: options.commentId,
      limit: options.limit,
      forceRefresh: options.forceRefresh,
    });
  }

  const base = getApiBaseUrl();
  const params = new URLSearchParams();
  let postIdForQuery = options.postId.trim();
  if (platformNorm === "linkedin") {
    postIdForQuery = normalizeLinkedInPostIdForCommentsApi(postIdForQuery);
  }
  params.set("post_id", postIdForQuery);
  params.set("comment_id", options.commentId.trim());
  params.set("platform", options.platform.trim());
  params.set("limit", String(options.limit ?? 50));
  params.set("force_refresh", String(options.forceRefresh ?? false));
  if (options.pageId?.trim()) {
    params.append("facebook_page_ids", options.pageId.trim());
  }
  if (options.organizationId?.trim()) {
    params.append(
      "linkedin_organization_ids",
      normalizeLinkedInOrganizationIdForCommentsApi(options.organizationId),
    );
  }
  if (options.youtubeChannelId?.trim()) {
    params.set("youtube_channel_id", options.youtubeChannelId.trim());
  }
  const url = `${base}/unified/comments/replies?${params.toString()}`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    { method: "GET" },
  );
  const json: unknown = await res.json();
  const data = json as UnifiedCommentRepliesResponseJson;
  if (!data.success || !Array.isArray(data.replies)) {
    throw new Error(data.message ?? data.error ?? "Could not load replies.");
  }
  return data;
}

export async function patchUnifiedCommentClassification(
  accessToken: string,
  workspaceId: string,
  body: {
    platform: string;
    postId: string;
    commentId: string;
    categoryKey: string;
  },
): Promise<UnifiedCommentClassificationJson> {
  const base = getApiBaseUrl();
  const res = await fetchWithAccessTokenRetry(
    `${base}/unified/comments/classification`,
    accessToken,
    (t) => ({
      ...workspaceHeaders(t, workspaceId),
      "Content-Type": "application/json",
    }),
    {
      method: "PATCH",
      body: JSON.stringify({
        platform: body.platform,
        post_id: body.postId,
        comment_id: body.commentId,
        category_key: body.categoryKey,
      }),
    },
  );
  const json = (await res.json()) as {
    success?: boolean;
    classification?: UnifiedCommentClassificationJson;
    message?: string;
    error?: string;
  };
  if (!json.success || !json.classification) {
    throw new Error(json.message ?? json.error ?? "Could not update category.");
  }
  return json.classification;
}

export async function reclassifyUnifiedComments(
  accessToken: string,
  workspaceId: string,
  options: {
    targets?: readonly {
      platform: string;
      postId: string;
      commentId: string;
    }[];
    includeManual?: boolean;
  },
): Promise<{ success: boolean; stale_count: number; message?: string }> {
  const base = getApiBaseUrl();
  const res = await fetchWithAccessTokenRetry(
    `${base}/unified/comments/categories/reclassify`,
    accessToken,
    (t) => ({
      ...workspaceHeaders(t, workspaceId),
      "Content-Type": "application/json",
    }),
    {
      method: "POST",
      body: JSON.stringify({
        confirm_credit_cost: true,
        include_manual: options.includeManual ?? false,
        targets: (options.targets ?? []).map((target) => ({
          platform: target.platform,
          post_id: target.postId,
          comment_id: target.commentId,
        })),
      }),
    },
  );
  return (await res.json()) as {
    success: boolean;
    stale_count: number;
    message?: string;
  };
}

export interface PostUnifiedCommentGenerateBody {
  post_id: string;
  comment_text: string;
  platform: string;
  page_id?: string;
  comment_id?: string;
}

export interface UnifiedCommentGenerateReplyItem {
  reply_text: string;
  confidence: number;
}

/**
 * POST /unified/comment/generate?workspace_id=… — AI suggested replies (same as mobile app).
 */
export async function postUnifiedCommentGenerate(
  accessToken: string,
  workspaceId: string,
  body: PostUnifiedCommentGenerateBody,
): Promise<{ success: true; replies: UnifiedCommentGenerateReplyItem[] }> {
  const base = getApiBaseUrl();
  const params = new URLSearchParams();
  params.set("workspace_id", workspaceId.trim());
  const url = `${base}/unified/comment/generate?${params.toString()}`;

  const platformLower = body.platform.trim().toLowerCase();
  let postIdBody = body.post_id.trim();
  if (platformLower === "linkedin") {
    postIdBody = normalizeLinkedInPostIdForCommentsApi(postIdBody);
  }
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => ({
      ...workspaceHeaders(t, workspaceId),
      "Content-Type": "application/json",
    }),
    {
      method: "POST",
      body: JSON.stringify({
        post_id: postIdBody,
        comment_text: body.comment_text.trim(),
        platform: platformLower,
        page_id: body.page_id?.trim() ? body.page_id.trim() : undefined,
        comment_id: body.comment_id?.trim() ? body.comment_id.trim() : undefined,
      }),
    },
  );

  const raw: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    const msg =
      raw && typeof raw === "object"
        ? String(
            (raw as { message?: string; error?: string; detail?: string })
              .message ??
              (raw as { error?: string }).error ??
              (raw as { detail?: string }).detail ??
              "Request failed",
          )
        : "Request failed";
    throw new Error(msg || "Could not generate replies.");
  }

  if (raw && typeof raw === "object") {
    const o = raw as {
      success?: boolean;
      data?: { replies?: unknown };
      message?: string;
      error?: string;
    };
    if (o.success === true) {
      const list = o.data?.replies;
      const replies: UnifiedCommentGenerateReplyItem[] = Array.isArray(list)
        ? list
            .map((item) => {
              if (!item || typeof item !== "object") {
                return null;
              }
              const r = item as { reply_text?: string; confidence?: number };
              const replyText =
                typeof r.reply_text === "string" ? r.reply_text : "";
              const conf =
                typeof r.confidence === "number" ? r.confidence : 0;
              return replyText.trim().length > 0
                ? { reply_text: replyText, confidence: conf }
                : null;
            })
            .filter(
              (x): x is UnifiedCommentGenerateReplyItem => x != null,
            )
        : [];
      return { success: true, replies };
    }
    const errMsg =
      (typeof o.message === "string" && o.message) ||
      (typeof o.error === "string" && o.error) ||
      "Could not generate replies.";
    throw new Error(errMsg);
  }

  throw new Error("Could not generate replies.");
}

/** POST /unified/comments/reply — platform in query; ids + text in JSON body. */
export async function replyUnifiedComment(
  accessToken: string,
  workspaceId: string,
  payload: {
    text: string;
    target: UnifiedInboxReplyApiTarget;
  },
): Promise<{
  success: true;
  reply_id?: string | null;
  message?: string;
}> {
  if (isWordPressUnifiedPlatform(payload.target.platform)) {
    return replyUnifiedBlogComment(accessToken, workspaceId, {
      commentId: payload.target.commentId,
      text: payload.text,
    });
  }

  const base = getApiBaseUrl();
  const params = new URLSearchParams();
  params.set("platform", payload.target.platform.trim().toLowerCase());

  const replyBody = buildReplyRequestBody(
    payload.target.platform,
    payload.target,
    payload.text,
  );
  if (
    payload.target.platform === "linkedin" &&
    replyBody.linkedin_organization_id
  ) {
    replyBody.linkedin_organization_id =
      normalizeLinkedInOrganizationIdForCommentsApi(
        replyBody.linkedin_organization_id,
      );
  }
  const path = `${base}/unified/comments/reply?${params.toString()}`;
  const res = await fetchWithAccessTokenRetry(
    path,
    accessToken,
    (t) => ({
      ...workspaceHeaders(t, workspaceId),
      "Content-Type": "application/json",
    }),
    {
      method: "POST",
      body: JSON.stringify(replyBody),
    },
  );

  const raw: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(parseApiErrorBody(raw));
  }

  if (raw && typeof raw === "object") {
    const data = raw as {
      success?: boolean;
      reply_id?: string | null;
      message?: string;
    };
    if (data.success === true) {
      return {
        success: true,
        reply_id: data.reply_id ?? null,
        message:
          typeof data.message === "string" ? data.message : undefined,
      };
    }
    const errMsg =
      (typeof data.message === "string" && data.message) || "Reply failed.";
    throw new Error(errMsg);
  }

  throw new Error("Reply failed.");
}

export interface RefreshLinkedInAuthorProfileJson {
  success: boolean;
  author_urn?: string;
  author_name?: string;
  author_profile_image_url?: string | null;
  message?: string;
  error?: string | null;
}

/** POST /unified/comments/linkedin/refresh-author-profile — one LinkedIn actor avatar refresh + DB upsert. */
export async function refreshLinkedInCommentAuthorProfile(
  accessToken: string,
  workspaceId: string,
  authorUrn: string,
): Promise<RefreshLinkedInAuthorProfileJson | null> {
  const urn = authorUrn.trim();
  if (!urn.startsWith("urn:li:")) {
    return null;
  }
  const base = getApiBaseUrl();
  const params = new URLSearchParams({ author_urn: urn });
  const url = `${base}/unified/comments/linkedin/refresh-author-profile?${params.toString()}`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (token) => workspaceHeaders(token, workspaceId),
    { method: "POST" },
  );
  const raw: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      parseApiErrorBody(raw) || "Could not refresh profile.";
    throw new Error(message);
  }
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const data = raw as RefreshLinkedInAuthorProfileJson;
  if (data.success !== true) {
    const message =
      (typeof data.message === "string" && data.message) ||
      "Could not refresh profile.";
    throw new Error(message);
  }
  return data;
}
