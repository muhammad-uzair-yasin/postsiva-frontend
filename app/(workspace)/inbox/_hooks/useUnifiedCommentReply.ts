"use client";

import { useCallback } from "react";

import { useWorkspaceHeaderAccounts } from "@/app/(workspace)/_components/WorkspaceHeaderAccountsProvider";
import {
  getStoredAccessToken,
  getStoredActiveWorkspaceId,
} from "@/lib/auth/session";
import { formatUserFacingApiError } from "@/lib/api/formatUserFacingApiError";
import { enrichReplyApiTarget } from "@/lib/inbox/inboxCommentActionContext";
import type { UnifiedInboxReplyApiTarget } from "@/lib/inbox/unifiedInboxTypes";
import { replyUnifiedComment } from "@/lib/social/unifiedCommentsApi";

export function useUnifiedCommentReply(): {
  sendQuickReply: (payload: {
    target: UnifiedInboxReplyApiTarget;
    text: string;
  }) => Promise<{ success: boolean; message?: string }>;
} {
  const { selectedAccountId } = useWorkspaceHeaderAccounts();
  const sendQuickReply = useCallback(
    async (payload: {
      target: UnifiedInboxReplyApiTarget;
      text: string;
    }): Promise<{ success: boolean; message?: string }> => {
      if (payload.text.trim().length === 0) {
        return { success: false, message: "Reply text is required." };
      }
      try {
        const token = getStoredAccessToken();
        const ws = getStoredActiveWorkspaceId();
        if (!token?.trim() || !ws?.trim()) {
          return {
            success: false,
            message: "Sign in and select a workspace to send replies.",
          };
        }
        await replyUnifiedComment(token, ws, {
          text: payload.text.trim(),
          target: enrichReplyApiTarget(payload.target, selectedAccountId),
        });
        return { success: true };
      } catch (e) {
        return {
          success: false,
          message: formatUserFacingApiError(
            e instanceof Error ? e.message : "Could not send reply.",
          ),
        };
      }
    },
    [selectedAccountId],
  );

  return { sendQuickReply };
}
