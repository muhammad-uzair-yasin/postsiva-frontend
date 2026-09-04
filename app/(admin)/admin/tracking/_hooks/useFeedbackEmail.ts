"use client";

import { useCallback, useState } from "react";

import { adminSend } from "@/lib/admin/adminFetch";
import type {
  BulkSendFeedbackEmailResponse,
  PerUserTrackingRow,
  SendFeedbackEmailResponse,
} from "@/lib/admin/trackingApi";
import { bulkResultSummary } from "@/lib/admin/trackingApi";

export type FeedbackTarget =
  | { kind: "single"; row: PerUserTrackingRow }
  | { kind: "bulk"; userIds: string[] };

export interface FeedbackEmailState {
  target: FeedbackTarget | null;
  sending: boolean;
  error: string | null;
  /** Success summary from the last completed send (shown as a banner). */
  lastResult: string | null;
  openSingle: (row: PerUserTrackingRow) => void;
  openBulk: (userIds: string[]) => void;
  close: () => void;
  /** Sends to the current target; resolves true on success (modal should close + selection clear). */
  send: (message: string) => Promise<boolean>;
  dismissResult: () => void;
}

/** Modal + send state for single and bulk feedback emails. */
export function useFeedbackEmail(): FeedbackEmailState {
  const [target, setTarget] = useState<FeedbackTarget | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const openSingle = useCallback((row: PerUserTrackingRow) => {
    setError(null);
    setTarget({ kind: "single", row });
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
    async (message: string): Promise<boolean> => {
      if (!target || sending) return false;
      const note = message.trim();
      setSending(true);
      setError(null);
      try {
        if (target.kind === "bulk") {
          const res = await adminSend<BulkSendFeedbackEmailResponse>(
            "POST",
            "/admin/api/tracking/feedback-emails-bulk",
            { user_ids: target.userIds, message: note.length ? note : null },
          );
          setLastResult(bulkResultSummary(res));
        } else {
          const res = await adminSend<SendFeedbackEmailResponse>(
            "POST",
            "/admin/api/tracking/feedback-email",
            { user_id: target.row.user_id, message: note.length ? note : null },
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
