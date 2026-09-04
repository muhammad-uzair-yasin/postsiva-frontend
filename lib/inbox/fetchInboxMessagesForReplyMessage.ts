import { mapByPostCommentsToInboxMessages } from "@/lib/inbox/mapUnifiedCommentsToInboxMessages";
import type { UnifiedInboxMessage } from "@/lib/inbox/unifiedInboxTypes";
import { fetchUnifiedCommentsByPost } from "@/lib/social/unifiedCommentsApi";

/** Re-fetch thread for one post after a reply (GET /unified/comments/by-post only). */
export async function fetchInboxMessagesForReplyMessage(
  accessToken: string,
  workspaceId: string,
  message: UnifiedInboxMessage,
  forceRefresh: boolean,
): Promise<UnifiedInboxMessage[]> {
  const postId = message.sourcePostId?.trim() ?? "";
  if (!postId) {
    return [];
  }
  const data = await fetchUnifiedCommentsByPost(accessToken, workspaceId, {
    postId,
    platform: message.platform,
    pageId: message.sourcePageId,
    organizationId: message.sourceOrganizationId,
    youtubeChannelId: message.sourceYoutubeChannelId,
    commentsPerPost: 50,
    forceRefresh,
  });
  return mapByPostCommentsToInboxMessages(
    message.platform,
    postId,
    data.comments,
    {
      pageId: data.facebook_page_id ?? message.sourcePageId,
      organizationId: data.linkedin_page_id ?? message.sourceOrganizationId,
      youtubeChannelId: message.sourceYoutubeChannelId,
    },
  );
}
