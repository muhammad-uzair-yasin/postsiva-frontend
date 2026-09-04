"use client";

import type { ReactElement } from "react";

interface AiPipelineNewChatDialogProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  confirming: boolean;
  compact?: boolean;
}

export function AiPipelineNewChatDialog({
  open,
  onCancel,
  onConfirm,
  confirming,
  compact = false,
}: AiPipelineNewChatDialogProps): ReactElement | null {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        aria-label="Close dialog"
        onClick={onCancel}
        disabled={confirming}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-pipeline-new-chat-title"
        className={`relative z-[1] w-full max-w-md rounded-2xl border border-white/10 bg-surface-container-high px-5 py-5 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.85)] ${
          compact ? "text-left" : ""
        }`}
      >
        <h2
          id="ai-pipeline-new-chat-title"
          className="font-headline text-base font-bold text-on-surface"
        >
          Start a new chat?
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
          Your previous conversation in this workspace will be cleared from the archive and the
          agent&apos;s memory for this workspace will be reset — same as using the clear command
          in chat. This cannot be undone.
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={confirming}
            className="rounded-xl border border-outline-variant/30 bg-surface-container-low px-4 py-2 text-xs font-bold uppercase tracking-widest text-on-surface transition-colors hover:border-secondary/35 hover:text-secondary disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirming}
            className="rounded-xl border border-error/40 bg-error/15 px-4 py-2 text-xs font-bold uppercase tracking-widest text-error transition-colors hover:bg-error/25 disabled:opacity-50"
          >
            {confirming ? "Clearing…" : "Clear & start new"}
          </button>
        </div>
      </div>
    </div>
  );
}
