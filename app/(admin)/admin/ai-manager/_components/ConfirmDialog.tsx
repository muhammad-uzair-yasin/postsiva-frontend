"use client";

import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Blocking confirmation modal for destructive resets. */
export function ConfirmDialog({
  title,
  body,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-outline-variant/20 bg-surface-container-low p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-error/12 text-error">
            <AlertTriangle className="h-4.5 w-4.5" />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-on-surface">{title}</h2>
            <p className="mt-1 text-sm text-on-surface-variant">{body}</p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-outline-variant/25 bg-surface-container px-4 py-2 text-sm font-bold text-on-surface hover:bg-surface-container-high"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-error px-4 py-2 text-sm font-bold text-on-error hover:opacity-90"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
