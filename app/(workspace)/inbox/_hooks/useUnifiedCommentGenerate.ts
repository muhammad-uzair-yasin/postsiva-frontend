"use client";

import { useCallback } from "react";

import { useWorkspaceHeaderAccounts } from "@/app/(workspace)/_components/WorkspaceHeaderAccountsProvider";
import {
  inboxMessageSupportsAiGenerate,
  pageIdForUnifiedCommentGenerate,
} from "@/lib/inbox/inboxAiGenerateEligibility";
import { inboxBodySegmentsToPlainText } from "@/lib/inbox/inboxMessagePlainText";
import type { UnifiedInboxMessage } from "@/lib/inbox/unifiedInboxTypes";
import {
  postUnifiedCommentGenerate,
  type UnifiedCommentGenerateReplyItem,
} from "@/lib/social/unifiedCommentsApi";
import {
  getStoredAccessToken,
  getStoredActiveWorkspaceId,
} from "@/lib/auth/session";

export function useUnifiedCommentGenerate(): {
  generateForMessage: (
    message: UnifiedInboxMessage,
    moderatorNote: string,
  ) => Promise<
    | { success: true; replies: UnifiedCommentGenerateReplyItem[] }
    | { success: false; message: string }
  >;
} {
  const { unifiedProfiles } = useWorkspaceHeaderAccounts();

  const generateForMessage = useCallback(
    async (
      message: UnifiedInboxMessage,
      moderatorNote: string,
    ): Promise<
      | { success: true; replies: UnifiedCommentGenerateReplyItem[] }
      | { success: false; message: string }
    > => {
      if (!inboxMessageSupportsAiGenerate(message, { unifiedProfiles })) {
        return {
          success: false,
          message:
            "AI replies are not available for this comment or platform.",
        };
      }

      const baseComment = inboxBodySegmentsToPlainText(
        message.bodySegments,
      ).trim();
      if (!baseComment) {
        return { success: false, message: "Comment text is empty." };
      }

      const note = moderatorNote.trim();
      const commentText =
        note.length > 0
          ? `${baseComment}\n\n(Moderator instructions: ${note})`
          : baseComment;

      const postId = message.sourcePostId?.trim();
      if (!postId) {
        return { success: false, message: "Missing post id for this comment." };
      }

      try {
        const token = getStoredAccessToken();
        const ws = getStoredActiveWorkspaceId();
        if (!token?.trim() || !ws?.trim()) {
          return {
            success: false,
            message: "Sign in and select a workspace to generate replies.",
          };
        }

        const result = await postUnifiedCommentGenerate(token, ws, {
          post_id: postId,
          comment_text: commentText,
          platform: message.platform,
          page_id: pageIdForUnifiedCommentGenerate(message),
          comment_id: message.sourceCommentId?.trim(),
        });

        return { success: true, replies: result.replies };
      } catch (e) {
        return {
          success: false,
          message:
            e instanceof Error ? e.message : "Could not generate replies.",
        };
      }
    },
    [unifiedProfiles],
  );

  return { generateForMessage };
}
