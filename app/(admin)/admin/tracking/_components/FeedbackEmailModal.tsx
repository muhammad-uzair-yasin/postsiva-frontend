"use client";

import { useState } from "react";
import { Loader2, Send, X } from "lucide-react";

import type { PerUserTrackingRow } from "@/lib/admin/trackingApi";
import { displayName, recipientPreview } from "@/lib/admin/trackingApi";
import type { FeedbackTarget } from "../_hooks/useFeedbackEmail";

const NOTE_MAX_LENGTH = 3000;

/**
 * Confirm modal for single + bulk feedback emails. Always states the recipient
 * count and previews recipients before the admin confirms with Send.
 */
export function FeedbackEmailModal({
  target,
  rows,
  sending,
  error,
  onCancel,
  onSend,
}: {
  target: FeedbackTarget | null;
  rows: PerUserTrackingRow[];
  sending: boolean;
  error: string | null;
  onCancel: () => void;
  onSend: (message: string) => void;
}) {
  const [message, setMessage] = useState("");

  if (!target) return null;

  const recipientCount = target.kind === "bulk" ? target.userIds.length : 1;
  const previewLines =
    target.kind === "bulk" ? recipientPreview(rows, target.userIds) : [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Send feedback email"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !sending) onCancel();
      }}
    >
      <div className="w-full max-w-lg rounded-2xl border border-outline-variant/20 bg-surface-container-low p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-on-surface">
              {target.kind === "bulk"
                ? `Send feedback to ${recipientCount} user(s)`
                : "Send feedback email"}
            </h3>
            <p className="mt-0.5 text-xs text-on-surface-variant">
              Branded Postsiva outreach template. Bulk sends go one after
              another on the server.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={sending}
            className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container-high"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
            {target.kind === "bulk"
              ? `Recipients (${recipientCount})`
              : "To (1 recipient)"}
          </span>
          {target.kind === "single" ? (
            <div className="mt-1">
              <p className="break-all text-sm font-medium text-on-surface">
                {target.row.email}
              </p>
              <p className="mt-0.5 text-xs text-on-surface-variant">
                {displayName(target.row)}
              </p>
            </div>
          ) : (
            <p className="mt-1 max-h-40 overflow-y-auto whitespace-pre-wrap rounded-xl bg-surface-container px-3 py-2 text-xs text-on-surface">
              {previewLines.join("\n")}
            </p>
          )}
        </div>

        <label className="mt-4 block text-sm font-medium text-on-surface">
          Optional note
          <textarea
            rows={5}
            maxLength={NOTE_MAX_LENGTH}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Optional message in the highlighted block."
            className="mt-1.5 w-full rounded-xl border border-outline-variant/25 bg-surface-container px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </label>

        {error ? (
          <p className="mt-2 rounded-lg bg-error-container/40 px-3 py-2 text-xs text-error">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={sending}
            className="rounded-xl border border-outline-variant/25 bg-surface-container px-4 py-2 text-sm font-medium text-on-surface hover:bg-surface-container-high"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSend(message)}
            disabled={sending}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-on-primary disabled:opacity-60"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {sending
              ? "Sending…"
              : `Send to ${recipientCount} recipient${recipientCount === 1 ? "" : "s"}`}
          </button>
        </div>
      </div>
    </div>
  );
}
