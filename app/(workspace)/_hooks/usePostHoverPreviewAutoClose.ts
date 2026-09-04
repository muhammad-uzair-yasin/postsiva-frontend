"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { POST_HOVER_PREVIEW_AUTO_CLOSE_MS } from "../_constants/postHoverPreviewTiming";

export function usePostHoverPreviewAutoClose(
  durationMs: number = POST_HOVER_PREVIEW_AUTO_CLOSE_MS,
) {
  const [open, setOpen] = useState(false);
  const [autoCloseResetKey, setAutoCloseResetKey] = useState(0);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openRef = useRef(false);

  const clearCloseTimer = useCallback((): void => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const bumpAutoCloseCountdown = useCallback((): void => {
    setAutoCloseResetKey((k) => k + 1);
  }, []);

  /** Arm close timer only — does not restart the countdown bar. */
  const scheduleAutoClose = useCallback((): void => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      openRef.current = false;
      setOpen(false);
      closeTimerRef.current = null;
    }, durationMs);
  }, [clearCloseTimer, durationMs]);

  /** Hover post row/card: open once and start the shrinking bar. */
  const openPreview = useCallback((): void => {
    clearCloseTimer();
    if (!openRef.current) {
      bumpAutoCloseCountdown();
    }
    openRef.current = true;
    setOpen(true);
    scheduleAutoClose();
  }, [bumpAutoCloseCountdown, clearCloseTimer, scheduleAutoClose]);

  /** Hover-only previews: stay open until explicit close, no countdown/timer. */
  const openPreviewUntilClosed = useCallback((): void => {
    clearCloseTimer();
    openRef.current = true;
    setOpen(true);
  }, [clearCloseTimer]);

  /** Switch to another post while preview stays open — reset countdown bar. */
  const switchPreview = useCallback((): void => {
    clearCloseTimer();
    bumpAutoCloseCountdown();
    openRef.current = true;
    setOpen(true);
    scheduleAutoClose();
  }, [bumpAutoCloseCountdown, clearCloseTimer, scheduleAutoClose]);

  /** Hover preview panel: keep open, extend timer, do not reset the bar. */
  const keepPreviewOpen = useCallback((): void => {
    if (!openRef.current) {
      openPreview();
      return;
    }
    clearCloseTimer();
    scheduleAutoClose();
  }, [clearCloseTimer, openPreview, scheduleAutoClose]);

  const scheduleClosePreview = useCallback((): void => {
    if (!openRef.current) {
      return;
    }
    scheduleAutoClose();
  }, [scheduleAutoClose]);

  const closePreviewNow = useCallback((): void => {
    clearCloseTimer();
    openRef.current = false;
    setOpen(false);
  }, [clearCloseTimer]);

  useEffect(() => {
    return () => {
      clearCloseTimer();
    };
  }, [clearCloseTimer]);

  return {
    open,
    autoCloseResetKey,
    openPreview,
    openPreviewUntilClosed,
    keepPreviewOpen,
    scheduleClosePreview,
    closePreviewNow,
    switchPreview,
  };
}
