"use client";

import { useCallback, useState } from "react";

import { adminSend } from "@/lib/admin/adminFetch";
import type { AdminEmailTemplate } from "@/lib/admin/emailTemplates";
import type { PaidUserRow } from "@/lib/admin/paidUsersApi";
import type {
  BulkSendFeedbackEmailResponse,
  SendFeedbackEmailResponse,
} from "@/lib/admin/trackingApi";
import { bulkResultSummary } from "@/lib/admin/trackingApi";

export type PaidUserEmailTarget =
  | { kind: "single"; user: PaidUserRow }
  | { kind: "bulk"; userIds: string[] };

export interface UsePaidUserEmailResult {
  target: PaidUserEmailTarget | null;
  sending: boolean;
  error: string | null;
  lastResult: string | null;
  openSingle: (user: PaidUserRow) => void;
  openBulk: (userIds: string[]) => void;
  close: () => void;
  send: (template: AdminEmailTemplate, customNote: string) => Promise<boolean>;
  dismissResult: () => void;
}

/** Send billing / follow-up emails from the paid-users admin page. */
export function usePaidUserEmail(): UsePaidUserEmailResult {
  const [target, setTarget] = useState<PaidUserEmailTarget | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const openSingle = useCallback((user: PaidUserRow) => {
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
      const note = [template.body.trim(), customNote.trim()].filter(Boolean).join("\n\n");
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
              user_id: target.user.user_id,
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
