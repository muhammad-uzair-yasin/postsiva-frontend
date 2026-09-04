import type {
  UnifiedCommentJson,
  UnifiedCommentsResponseJson,
} from "@/lib/inbox/unifiedCommentsTypes";
import type {
  UnifiedInboxBodySegment,
  UnifiedInboxMessage,
  UnifiedInboxPlatform,
  UnifiedInboxReplyApiTarget,
} from "@/lib/inbox/unifiedInboxTypes";

const PLATFORM_ORDER = [
  "linkedin",
  "facebook",
  "instagram",
  "youtube",
  "threads",
  "tiktok",
  "bluesky",
  "mastodon",
  "wordpress",
] as const;

type PlatformSliceKey = (typeof PLATFORM_ORDER)[number];

function parseCommentTimeMs(iso: string | null | undefined): number {
  if (!iso || typeof iso !== "string") {
    return 0;
  }
  let normalized = iso.trim();
  const hasTimezone = /Z$|[+-]\d{2}:?\d{2}$/.test(normalized);
  if (normalized.includes(" ") && !hasTimezone) {
    normalized = `${normalized.replace(" ", "T")}Z`;
  }
  normalized = normalized
    .replace(/\+0000$/, "Z")
    .replace(/([+-]\d{2})(\d{2})$/, "$1:$2");
  const t = new Date(normalized).getTime();
  return Number.isNaN(t) ? 0 : t;
}

function formatRelativeCommentTime(iso: string | null | undefined): string {
  const d = parseCommentTimeMs(iso);
  if (d === 0) {
    return "";
  }
  const diff = Date.now() - d;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) {
    return "Just now";
  }
  if (mins < 60) {
    return `${mins}m ago`;
  }
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) {
    return `${hrs}h ago`;
  }
  const days = Math.floor(hrs / 24);
  if (days < 14) {
    return `${days}d ago`;
  }
  return new Date(d).toLocaleDateString();
}

function apiPlatformToInbox(platform: string): UnifiedInboxPlatform | null {
  const p = platform.trim().toLowerCase();
  if (p === "linkedin") {
    return "linkedin";
  }
  if (p === "facebook") {
    return "facebook";
  }
  if (p === "instagram") {
    return "instagram";
  }
  if (p === "youtube") {
    return "youtube";
  }
  if (p === "threads") {
    return "threads";
  }
  if (p === "tiktok") {
    return "tiktok";
  }
  if (p === "bluesky") {
    return "bluesky";
  }
  if (p === "mastodon") {
    return "mastodon";
  }
  if (p === "wordpress") {
    return "wordpress";
  }
  return null;
}

function displayNameFromAuthor(
  authorName: string,
  authorId: string | null | undefined,
): string {
  const raw = (authorName || "").trim();
  const idRaw = (authorId ?? "").trim();

  // Prefer enriched display name from API (author_name / commentor_name).
  if (raw.length > 0 && !raw.toLowerCase().startsWith("urn:li:")) {
    return raw;
  }

  if (raw.toLowerCase().startsWith("urn:li:person:")) {
    return "LinkedIn member";
  }
  if (raw.toLowerCase().startsWith("urn:li:organization:")) {
    const id = raw.replace(/^urn:li:organization:/i, "").trim();
    return id.length > 0 ? `Organization ${id}` : "LinkedIn organization";
  }

  if (idRaw.toLowerCase().startsWith("urn:li:person:")) {
    return "LinkedIn member";
  }
  if (idRaw.toLowerCase().startsWith("urn:li:organization:")) {
    const id = idRaw.replace(/^urn:li:organization:/i, "").trim();
    return id.length > 0 ? `Organization ${id}` : "LinkedIn organization";
  }

  if (raw.length > 0) {
    return raw;
  }
  if (idRaw.length > 0) {
    return idRaw.length > 32 ? `…${idRaw.slice(-12)}` : idRaw;
  }
  return "Someone";
}

function contextLabelForComment(
  platform: UnifiedInboxPlatform,
  postId: string,
  isReply: boolean,
): string {
  const tail = postId.length > 8 ? postId.slice(-8) : postId;
  const base = `${platform} · …${tail}`;
  return isReply ? `Reply · ${base}` : `Comment · ${base}`;
}

import { resolveInboxAvatarUri } from "@/lib/inbox/inboxAvatarUri";

function textToBodySegments(raw: string): UnifiedInboxBodySegment[] {
  const text = raw.replace(/\r\n/g, "\n");
  if (!text.trim()) {
    return [{ kind: "text", text: " " }];
  }
  const parts = text.split(/(#\w+)/g);
  return parts
    .filter((p) => p.length > 0)
    .map((p) =>
      p.startsWith("#")
        ? { kind: "hashtag" as const, text: p }
        : { kind: "text" as const, text: p },
    );
}

interface Row {
  message: UnifiedInboxMessage;
  sortMs: number;
}

function commentToRow(
  platformKey: string,
  inboxPlatform: UnifiedInboxPlatform,
  postId: string,
  pageId: string | undefined,
  organizationId: string | undefined,
  youtubeChannelId: string | undefined,
  parentMessageId: string | undefined,
  comment: UnifiedCommentJson,
  isReply: boolean,
): Row {
  const preferredAuthorName =
    comment.author_name && comment.author_name.trim().length > 0
      ? comment.author_name
      : (comment.commentor_name ?? "");
  const userName = displayNameFromAuthor(
    preferredAuthorName,
    comment.author_id ?? undefined,
  );
  const profileImage = (comment.author_profile_image_url ?? "").trim();
  const avatarUri = resolveInboxAvatarUri(profileImage, userName);
  const replies = comment.replies ?? [];
  const isTopLevel = !isReply;
  const replyCountFromBackend =
    typeof comment.reply_count === "number" && comment.reply_count >= 0
      ? comment.reply_count
      : null;
  /** Unreplied / replied tabs rely on backend `reply_count` when present; else nested `replies` length. */
  const threadReplyCount =
    replyCountFromBackend !== null ? replyCountFromBackend : replies.length;
  const unreplied = isTopLevel && threadReplyCount === 0;
  const sortMs = parseCommentTimeMs(comment.created_at ?? undefined) || 0;
  const likeCount =
    typeof comment.like_count === "number" ? comment.like_count : undefined;
  const permalinkUrl =
    (typeof comment.platform_meta?.permalink_url === "string"
      ? comment.platform_meta.permalink_url.trim()
      : "") ||
    (typeof comment.platform_meta?.url === "string"
      ? comment.platform_meta.url.trim()
      : "");
  const commentUrn =
    typeof comment.platform_meta?.comment_urn === "string"
      ? comment.platform_meta.comment_urn.trim()
      : "";
  const commentCid =
    typeof comment.platform_meta?.cid === "string"
      ? comment.platform_meta.cid.trim()
      : "";
  const authorId = (comment.author_id ?? "").trim();
  const canPlatformReply =
    inboxPlatform !== "facebook" || (pageId?.trim().length ?? 0) > 0;
  const replyApiTarget: UnifiedInboxReplyApiTarget | undefined = canPlatformReply
    ? {
        platform: inboxPlatform,
        commentId: comment.id,
        postId,
        pageId,
        organizationId,
        youtubeChannelId,
      }
    : undefined;

  return {
    sortMs,
    message: {
      id: `${platformKey}-${postId}-${comment.id}`,
      platform: inboxPlatform,
      avatarUri,
      userName,
      contextLabel: contextLabelForComment(inboxPlatform, postId, isReply),
      timeLabel: formatRelativeCommentTime(comment.created_at ?? undefined),
      bodySegments: textToBodySegments(comment.text ?? ""),
      showQuickReply: replyApiTarget != null,
      unreplied,
      threadReplyCount,
      likeCount,
      showFavorite: likeCount !== undefined,
      replyApiTarget,
      parentMessageId: isReply ? parentMessageId : undefined,
      sortMs,
      sourcePostId: postId,
      sourceCommentId: comment.id,
      sourceCommentUrn: commentUrn.length > 0 ? commentUrn : undefined,
      sourceCommentCid: commentCid.length > 0 ? commentCid : undefined,
      sourceAuthorId: authorId.length > 0 ? authorId : undefined,
      sourcePermalinkUrl: permalinkUrl.length > 0 ? permalinkUrl : undefined,
      sourcePageId: pageId,
      sourceOrganizationId: organizationId,
      sourceYoutubeChannelId: youtubeChannelId,
      isHidden:
        typeof comment.platform_meta?.is_hidden === "boolean"
          ? comment.platform_meta.is_hidden
          : undefined,
      categoryKey: comment.classification?.category_key,
      categorySource: comment.classification?.source,
      categoryConfidence: comment.classification?.confidence,
    },
  };
}

function walkComments(
  platformKey: string,
  inboxPlatform: UnifiedInboxPlatform,
  postId: string,
  pageId: string | undefined,
  organizationId: string | undefined,
  youtubeChannelId: string | undefined,
  comments: readonly UnifiedCommentJson[],
  isReplyDepth: boolean,
  parentMessageId: string | undefined,
  out: Row[],
): void {
  for (const c of comments) {
    out.push(
      commentToRow(
        platformKey,
        inboxPlatform,
        postId,
        pageId,
        organizationId,
        youtubeChannelId,
        parentMessageId,
        c,
        isReplyDepth,
      ),
    );
    const nested = c.replies ?? [];
    if (nested.length > 0) {
      const currentMessageId = `${platformKey}-${postId}-${c.id}`;
      walkComments(
        platformKey,
        inboxPlatform,
        postId,
        pageId,
        organizationId,
        youtubeChannelId,
        nested,
        true,
        currentMessageId,
        out,
      );
    }
  }
}

export function mapUnifiedCommentsResponseToInboxMessages(
  data: UnifiedCommentsResponseJson,
): UnifiedInboxMessage[] {
  if (!data.success) {
    return [];
  }

  const rows: Row[] = [];

  for (const key of PLATFORM_ORDER) {
    const slice = data[key as PlatformSliceKey];
    const buckets = slice?.posts;
    if (!Array.isArray(buckets)) {
      continue;
    }
    const inboxPl = apiPlatformToInbox(key);
    if (!inboxPl) {
      continue;
    }
    for (const bucket of buckets) {
      const pid = (bucket.post_id ?? "").trim();
      if (!pid) {
        continue;
      }
      const comments = bucket.comments ?? [];
      const pageId =
        inboxPl === "facebook" && typeof bucket.facebook_page_id === "string"
          ? bucket.facebook_page_id
          : undefined;
      const organizationId =
        inboxPl === "linkedin" && typeof bucket.linkedin_page_id === "string"
          ? bucket.linkedin_page_id
          : undefined;
      const youtubeChannelId =
        inboxPl === "youtube" && typeof bucket.youtube_channel_id === "string"
          ? bucket.youtube_channel_id
          : undefined;
      walkComments(
        key,
        inboxPl,
        pid,
        pageId,
        organizationId,
        youtubeChannelId,
        comments,
        false,
        undefined,
        rows,
      );
    }
  }

  rows.sort((a, b) => b.sortMs - a.sortMs);

  const messages = rows.map((r) => r.message);
  if (messages.length > 0) {
    messages[0] = { ...messages[0], highlighted: true };
  }

  return messages;
}

/**
 * Maps GET /unified/comments/replies items under one parent (e.g. LinkedIn lazy thread load).
 */
export function mapUnifiedCommentRepliesToInboxChildren(
  parent: UnifiedInboxMessage,
  replies: readonly UnifiedCommentJson[],
): UnifiedInboxMessage[] {
  const platformKey = parent.platform;
  const postId = parent.sourcePostId?.trim() ?? "";
  if (!postId) {
    return [];
  }
  const rows: Row[] = [];
  for (const c of replies) {
    rows.push(
      commentToRow(
        platformKey,
        parent.platform,
        postId,
        parent.sourcePageId,
        parent.sourceOrganizationId,
        parent.sourceYoutubeChannelId,
        parent.id,
        c,
        true,
      ),
    );
  }
  rows.sort((a, b) => b.sortMs - a.sortMs);
  return rows.map((r) => r.message);
}

/**
 * Maps GET /unified/comments/by-post JSON into the same inbox shape as the bulk list.
 */
export function mapByPostCommentsToInboxMessages(
  platformKey: string,
  postId: string,
  comments: readonly UnifiedCommentJson[],
  options: {
    pageId?: string;
    organizationId?: string;
    youtubeChannelId?: string;
  } = {},
): UnifiedInboxMessage[] {
  const inboxPl = apiPlatformToInbox(platformKey);
  const pid = postId.trim();
  if (!inboxPl || pid.length === 0) {
    return [];
  }
  const rows: Row[] = [];
  walkComments(
    platformKey,
    inboxPl,
    pid,
    options.pageId,
    options.organizationId,
    options.youtubeChannelId,
    comments,
    false,
    undefined,
    rows,
  );
  rows.sort((a, b) => b.sortMs - a.sortMs);
  const messages = rows.map((r) => r.message);
  if (messages.length > 0) {
    messages[0] = { ...messages[0], highlighted: true };
  }
  return messages;
}
