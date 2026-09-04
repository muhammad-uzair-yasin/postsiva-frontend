import type {
  ContentManagerChannel,
  ContentManagerPost,
} from "@/app/(workspace)/content-manager/_types/contentManagerTypes";
import { mapByPostCommentsToInboxMessages } from "@/lib/inbox/mapUnifiedCommentsToInboxMessages";
import type { UnifiedInboxMessage } from "@/lib/inbox/unifiedInboxTypes";
import type { UnifiedCommentClassificationStatusJson } from "@/lib/inbox/unifiedCommentsTypes";
import type { CommentsOAuthPlatform } from "@/lib/workspace/accountIdToOAuthPlatform";
import {
  decodeCompositeEntitySegment,
  youtubeChannelIdFromSelectedIds,
} from "@/lib/workspace/decodeCompositeAccountIds";
import { fetchUnifiedCommentsByPost } from "@/lib/social/unifiedCommentsApi";

export function contentManagerChannelToCommentsApiPlatform(
  channel: ContentManagerChannel,
): CommentsOAuthPlatform | null {
  if (channel === "x") {
    return "threads";
  }
  if (channel === "pinterest") {
    return null;
  }
  const allowed = new Set<string>([
    "linkedin",
    "facebook",
    "instagram",
    "youtube",
    "threads",
    "tiktok",
    "bluesky",
    "mastodon",
    "wordpress",
  ]);
  return allowed.has(channel) ? (channel as CommentsOAuthPlatform) : null;
}

export function inboxPageOrgFromSelectedAccount(
  selectedAccountId: string | null | undefined,
  postChannel: ContentManagerChannel,
): { pageId?: string; organizationId?: string; youtubeChannelId?: string } {
  const id = selectedAccountId?.trim();
  if (!id) {
    return {};
  }
  if (postChannel === "facebook" && id.startsWith("facebook:page:")) {
    return {
      pageId: decodeCompositeEntitySegment(
        id.slice("facebook:page:".length),
      ),
    };
  }
  if (postChannel === "linkedin" && id.startsWith("linkedin:org:")) {
    return {
      organizationId: decodeCompositeEntitySegment(
        id.slice("linkedin:org:".length),
      ),
    };
  }
  if (postChannel === "youtube") {
    return { youtubeChannelId: youtubeChannelIdFromSelectedIds([id]) };
  }
  return {};
}

export async function fetchInboxMessagesForContentManagerPost(
  accessToken: string,
  workspaceId: string,
  post: ContentManagerPost,
  selectedAccountId: string | null | undefined,
  forceRefresh: boolean,
): Promise<{
  messages: UnifiedInboxMessage[];
  classificationStatus: UnifiedCommentClassificationStatusJson | null;
  commentsDisabled: boolean;
  commentStatusMessage: string | null;
}> {
  const platform = contentManagerChannelToCommentsApiPlatform(post.channel);
  if (!platform) {
    return {
      messages: [],
      classificationStatus: null,
      commentsDisabled: false,
      commentStatusMessage: null,
    };
  }
  const { pageId, organizationId, youtubeChannelId } =
    inboxPageOrgFromSelectedAccount(selectedAccountId, post.channel);
  const data = await fetchUnifiedCommentsByPost(accessToken, workspaceId, {
    postId: post.id,
    platform,
    pageId,
    organizationId,
    youtubeChannelId: youtubeChannelId ?? post.youtubeChannelId,
    commentsPerPost: 50,
    forceRefresh,
  });
  return {
    messages: mapByPostCommentsToInboxMessages(platform, post.id, data.comments, {
      pageId: data.facebook_page_id ?? pageId,
      organizationId: data.linkedin_page_id ?? organizationId,
      youtubeChannelId:
        data.youtube_channel_id ?? youtubeChannelId ?? post.youtubeChannelId,
    }),
    classificationStatus: data.classification_status ?? null,
    commentsDisabled: Boolean(data.comments_disabled),
    commentStatusMessage:
      typeof data.comment_status_message === "string" &&
      data.comment_status_message.trim().length > 0
        ? data.comment_status_message
        : null,
  };
}
