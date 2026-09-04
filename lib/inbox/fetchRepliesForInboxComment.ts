import type { UnifiedInboxMessage } from "@/lib/inbox/unifiedInboxTypes";
import {
  mapByPostCommentsToInboxMessages,
  mapUnifiedCommentRepliesToInboxChildren,
} from "@/lib/inbox/mapUnifiedCommentsToInboxMessages";
import {
  getStoredAccessToken,
  getStoredActiveWorkspaceId,
} from "@/lib/auth/session";
import {
  fetchUnifiedCommentReplies,
  fetchUnifiedCommentsByPost,
} from "@/lib/social/unifiedCommentsApi";

export async function fetchRepliesForInboxComment(
  parent: UnifiedInboxMessage,
): Promise<UnifiedInboxMessage[]> {
  const postId = parent.sourcePostId?.trim() ?? "";
  if (!postId) {
    return [];
  }
  const token = getStoredAccessToken();
  const ws = getStoredActiveWorkspaceId();
  if (!token?.trim() || !ws?.trim()) {
    return [];
  }

  // LinkedIn (personal + org): bulk inbox only returns top-level comments; load thread via replies API.
  if (parent.platform === "linkedin") {
    const commentId = parent.sourceCommentId?.trim() ?? "";
    if (!commentId) {
      return [];
    }
    const data = await fetchUnifiedCommentReplies(token, ws, {
      postId,
      commentId,
      platform: "linkedin",
      limit: 50,
      forceRefresh: true,
      organizationId: parent.sourceOrganizationId,
    });
    return mapUnifiedCommentRepliesToInboxChildren(parent, data.replies);
  }

  const data = await fetchUnifiedCommentsByPost(token, ws, {
    postId,
    platform: parent.platform,
    pageId: parent.sourcePageId,
    organizationId: parent.sourceOrganizationId,
    commentsPerPost: 50,
    forceRefresh: false,
  });
  return mapByPostCommentsToInboxMessages(
    parent.platform,
    postId,
    data.comments,
    {
      pageId: data.facebook_page_id ?? parent.sourcePageId ?? undefined,
      organizationId:
        data.linkedin_page_id ?? parent.sourceOrganizationId ?? undefined,
    },
  );
}
