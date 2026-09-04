"use client";

import { useCallback, useState } from "react";

import { adminSend } from "@/lib/admin/adminFetch";
import type { AdminEmailTemplate } from "@/lib/admin/emailTemplates";
import type { AdminUserWithActivity } from "@/lib/admin/usersApi";
import type {
  BulkSendFeedbackEmailResponse,
  SendFeedbackEmailResponse,
} from "@/lib/admin/trackingApi";
import { bulkResultSummary } from "@/lib/admin/trackingApi";

export type UserEmailTarget =
  | { kind: "single"; user: AdminUserWithActivity }
  | { kind: "bulk"; userIds: string[] };

export interface UseUserEmailResult {
  target: UserEmailTarget | null;
  sending: boolean;
  error: string | null;
  lastResult: string | null;
  openSingle: (user: AdminUserWithActivity) => void;
  openBulk: (userIds: string[]) => void;
  close: () => void;
  send: (template: AdminEmailTemplate, customNote: string) => Promise<boolean>;
  dismissResult: () => void;
}

/** Send templated follow-up emails from the Users admin page. */
export function useUserEmail(): UseUserEmailResult {
  const [target, setTarget] = useState<UserEmailTarget | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const openSingle = useCallback((user: AdminUserWithActivity) => {
    setError(null);
    setTarget({ kind: "single", user });
  }, []);

  const openBulk = useCallback((userIds: string[]) => {
    if (userIds.length === 0) return;
    setError(null);
    setTarget({ kind: "bulk", userIds });
  }, []);

  const close = useCallback(() => {
    setTarget(null);
    setError(null);
  }, []);

  const send = useCallback(
    async (template: AdminEmailTemplate, customNote: string): Promise<boolean> => {
      if (!target || sending) return false;
      const note = [template.body.trim(), customNote.trim()]
        .filter(Boolean)
        .join("\n\n");
      setSending(true);
      setError(null);
      try {
        if (target.kind === "bulk") {
          const res = await adminSend<BulkSendFeedbackEmailResponse>(
            "POST",
            "/admin/api/tracking/feedback-emails-bulk",
            {
              user_ids: target.userIds,
              subject: template.subject,
              message: note.length ? note : null,
            },
          );
          setLastResult(bulkResultSummary(res));
        } else {
          const res = await adminSend<SendFeedbackEmailResponse>(
            "POST",
            "/admin/api/tracking/feedback-email",
            {
              user_id: target.user.id,
              subject: template.subject,
              message: note.length ? note : null,
            },
          );
          setLastResult(res.detail || "Email sent successfully.");
        }
        setTarget(null);
        return true;
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Network error");
        return false;
      } finally {
        setSending(false);
      }
    },
    [target, sending],
  );

  return {
    target,
    sending,
    error,
    lastResult,
    openSingle,
    openBulk,
    close,
    send,
    dismissResult: useCallback(() => setLastResult(null), []),
  };
}
