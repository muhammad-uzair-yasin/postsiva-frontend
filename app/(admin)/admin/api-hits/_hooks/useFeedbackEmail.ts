"use client";

import { useCallback, useState } from "react";

import { adminSend } from "@/lib/admin/adminFetch";
import {
  feedbackEmailBody,
  type FeedbackEmailResponse,
} from "@/lib/admin/apiHitsApi";

export interface FeedbackEmailTarget {
  userId: string;
  email: string;
  name: string;
}

/** Modal state + submit for the branded feedback email (legacy feedbackEmailModal). */
export function useFeedbackEmail() {
  const [target, setTarget] = useState<FeedbackEmailTarget | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentDetail, setSentDetail] = useState<string | null>(null);

  const open = useCallback((next: FeedbackEmailTarget) => {
    setTarget(next);
    setMessage("");
    setError(null);
  }, []);

  const close = useCallback(() => {
    setTarget(null);
    setError(null);
  }, []);

  const send = useCallback(async () => {
    if (!target || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await adminSend<FeedbackEmailResponse>(
        "POST",
        "/admin/api/tracking/feedback-email",
        feedbackEmailBody(target.userId, message),
      );
      setTarget(null);
      setSentDetail(res.detail || "Email sent successfully.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setSending(false);
    }
  }, [target, message, sending]);

  const dismissSentDetail = useCallback(() => setSentDetail(null), []);

  return {
    target,
    message,
    setMessage,
    sending,
    error,
    sentDetail,
    dismissSentDetail,
    open,
    close,
    send,
  };
}
