import type { ContentManagerChannel } from "@/app/(workspace)/content-manager/_types/contentManagerTypes";
import { inboxPageOrgFromSelectedAccount } from "@/lib/inbox/inboxCommentsByPost";
import type {
  UnifiedInboxMessage,
  UnifiedInboxPlatform,
  UnifiedInboxReplyApiTarget,
} from "@/lib/inbox/unifiedInboxTypes";

function mergeOptional(primary: string | undefined, fallback: string | undefined): string | undefined {
  const p = primary?.trim();
  if (p) {
    return p;
  }
  const f = fallback?.trim();
  return f || undefined;
}

/** Page / channel / org ids for moderate + reply (message fields + header account). */
export function inboxCommentActionContext(
  message: UnifiedInboxMessage,
  selectedAccountId: string | null | undefined,
): {
  postId: string;
  commentId: string;
  pageId?: string;
  youtubeChannelId?: string;
  organizationId?: string;
} {
  const fromHeader = inboxPageOrgFromSelectedAccount(
    selectedAccountId,
    message.platform as ContentManagerChannel,
  );
  return {
    postId: message.sourcePostId?.trim() ?? "",
    commentId: message.sourceCommentId?.trim() ?? "",
    pageId: mergeOptional(message.sourcePageId, fromHeader.pageId),
    youtubeChannelId: mergeOptional(
      message.sourceYoutubeChannelId,
      fromHeader.youtubeChannelId,
    ),
    organizationId: mergeOptional(
      message.sourceOrganizationId,
      fromHeader.organizationId,
    ),
  };
}

export function enrichReplyApiTarget(
  target: UnifiedInboxReplyApiTarget,
  selectedAccountId: string | null | undefined,
): UnifiedInboxReplyApiTarget {
  const fromHeader = inboxPageOrgFromSelectedAccount(
    selectedAccountId,
    target.platform as ContentManagerChannel,
  );
  return {
    ...target,
    pageId: mergeOptional(target.pageId, fromHeader.pageId),
    youtubeChannelId: mergeOptional(
      target.youtubeChannelId,
      fromHeader.youtubeChannelId,
    ),
    organizationId: mergeOptional(
      target.organizationId,
      fromHeader.organizationId,
    ),
  };
}

/** Expected POST bodies for unified comment action endpoints (for tests/docs). */
export function buildModerateRequestBody(payload: {
  platform: string;
  commentId: string;
  postId: string;
  pageId?: string;
  youtubeChannelId?: string;
  organizationId?: string;
  authorId?: string;
}): Record<string, string> {
  const platform = payload.platform.trim().toLowerCase();
  const body: Record<string, string> = {
    comment_id: payload.commentId.trim(),
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
  const authorId = payload.authorId?.trim();
  if ((platform === "bluesky" || platform === "mastodon") && authorId) {
    body.author_id = authorId;
  }
  return body;
}

export function buildReplyRequestBody(
  platform: UnifiedInboxPlatform,
  target: UnifiedInboxReplyApiTarget,
  text: string,
): Record<string, string> {
  const replyBody: Record<string, string> = {
    text: text.trim(),
    comment_id: target.commentId.trim(),
  };
  const pageId = target.pageId?.trim();
  if (platform === "facebook" && pageId) {
    replyBody.facebook_page_id = pageId;
  }
  const postId = target.postId?.trim();
  if (postId) {
    replyBody.post_id = postId;
  }
  const orgId = target.organizationId?.trim();
  if (platform === "linkedin" && orgId) {
    replyBody.linkedin_organization_id = orgId;
  }
  const youtubeChannelId = target.youtubeChannelId?.trim();
  if (platform === "youtube" && youtubeChannelId) {
    replyBody.youtube_channel_id = youtubeChannelId;
  }
  return replyBody;
}
