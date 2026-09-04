"use client";

import { useCallback, useEffect, useState } from "react";

import { adminGet } from "@/lib/admin/adminFetch";
import {
  EMAILS_DEFAULT_DAYS,
  EMAILS_DEFAULT_RECENT_LIMIT,
  buildEmailAnalyticsPath,
  clampEmailDays,
  clampRecentLimit,
  type EmailAnalyticsResponse,
} from "@/lib/admin/emailsApi";

/** Data + range state for the outbound email analytics page (legacy emails.html). */
export function useEmailAnalytics() {
  const [daysInput, setDaysInput] = useState(String(EMAILS_DEFAULT_DAYS));
  const [recentLimitInput, setRecentLimitInput] = useState(
    String(EMAILS_DEFAULT_RECENT_LIMIT),
  );
  const [applied, setApplied] = useState({
    days: EMAILS_DEFAULT_DAYS,
    recentLimit: EMAILS_DEFAULT_RECENT_LIMIT,
  });
  const [nonce, setNonce] = useState(0);
  const [data, setData] = useState<EmailAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    adminGet<EmailAnalyticsResponse>(
      buildEmailAnalyticsPath(applied.days, applied.recentLimit),
      controller.signal,
    )
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Failed to load email analytics");
        setLoading(false);
      });
    return () => controller.abort();
  }, [applied, nonce]);

  /** Every reload path resets loading/error here so the fetch effect stays setState-free. */
  const beginLoad = useCallback(() => {
    setLoading(true);
    setError(null);
  }, []);

  const apply = useCallback(() => {
    beginLoad();
    setApplied({
      days: clampEmailDays(daysInput),
      recentLimit: clampRecentLimit(recentLimitInput),
    });
  }, [daysInput, recentLimitInput, beginLoad]);

  const refresh = useCallback(() => {
    beginLoad();
    setNonce((n) => n + 1);
  }, [beginLoad]);

  return {
    daysInput,
    setDaysInput,
    recentLimitInput,
    setRecentLimitInput,
    applied,
    data,
    loading,
    error,
    apply,
    refresh,
  };
}
