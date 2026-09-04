"use client";

import { Loader2, Send, X } from "lucide-react";

import type { FeedbackEmailTarget } from "../_hooks/useFeedbackEmail";

interface FeedbackEmailModalProps {
  target: FeedbackEmailTarget | null;
  message: string;
  sending: boolean;
  error: string | null;
  onMessageChange: (value: string) => void;
  onClose: () => void;
  onSend: () => void;
}

/** Branded feedback email modal (legacy #feedbackEmailModal on the usage page). */
export function FeedbackEmailModal({
  target,
  message,
  sending,
  error,
  onMessageChange,
  onClose,
  onSend,
}: FeedbackEmailModalProps) {
  if (!target) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-outline-variant/20 bg-surface-container-low p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-on-surface">Send feedback email</h2>
            <p className="mt-1 truncate text-sm text-on-surface">{target.email}</p>
            {target.name ? (
              <p className="truncate text-xs text-on-surface-variant">{target.name}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <label
          htmlFor="feedback-email-message"
          className="mt-4 block text-xs font-semibold text-on-surface-variant"
        >
          Optional message (shown in a highlighted block)
        </label>
        <textarea
          id="feedback-email-message"
          value={message}
          maxLength={3000}
          rows={5}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder="Leave empty to send the template-only copy."
          className="mt-1.5 w-full rounded-xl border border-outline-variant/25 bg-surface px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        {error ? <p className="mt-2 text-sm text-error">{error}</p> : null}
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-outline-variant/25 bg-surface-container px-4 py-2 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-high"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSend}
            disabled={sending}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-on-primary disabled:opacity-60"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {sending ? "Sending…" : "Send email"}
          </button>
        </div>
      </div>
    </div>
  );
}
