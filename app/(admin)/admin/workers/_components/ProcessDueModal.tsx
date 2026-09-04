"use client";

import { AlertTriangle, CheckCircle2, Loader2, X, XCircle } from "lucide-react";

import {
  summarizeProcessDue,
  type ProcessDueResult,
} from "@/lib/admin/workersApi";

interface ProcessDueModalProps {
  processing: boolean;
  result: ProcessDueResult | null;
  onConfirm: () => void;
  onClose: () => void;
}

/** Confirm-then-run modal for POST /admin/api/workers/process-due-scheduled-posts. */
export function ProcessDueModal({
  processing,
  result,
  onConfirm,
  onClose,
}: ProcessDueModalProps) {
  const succeeded = result !== null && result.ok;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={processing ? undefined : onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Process due scheduled posts"
        className="w-full max-w-md rounded-2xl border border-outline-variant/20 bg-surface-container-low"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-outline-variant/20 px-5 py-4">
          <h4 className="text-sm font-bold text-on-surface">
            Process due scheduled posts
          </h4>
          <button
            type="button"
            onClick={onClose}
            disabled={processing}
            className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container-high disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-4">
          {result === null ? (
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-error-container/25 text-error">
                <AlertTriangle className="h-4.5 w-4.5" />
              </span>
              <p className="text-sm text-on-surface-variant">
                This runs the publish job now: every due scheduled post will be
                published immediately for its user. Continue?
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              {succeeded ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              ) : (
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-error" />
              )}
              <p className="text-sm text-on-surface">
                {summarizeProcessDue(result)}
              </p>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 border-t border-outline-variant/20 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={processing}
            className="rounded-xl border border-outline-variant/25 bg-surface-container px-4 py-2 text-sm font-bold text-on-surface hover:bg-surface-container-high disabled:opacity-50"
          >
            {result === null ? "Cancel" : "Close"}
          </button>
          {result === null ? (
            <button
              type="button"
              onClick={onConfirm}
              disabled={processing}
              className="inline-flex items-center gap-2 rounded-xl bg-error-container px-4 py-2 text-sm font-bold text-on-error-container disabled:opacity-60"
            >
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {processing ? "Running…" : "Run now"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
