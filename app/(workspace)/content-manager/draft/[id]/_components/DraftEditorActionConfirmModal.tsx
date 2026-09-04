"use client";

import { useEffect, useState } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { WorkspaceVideoWithControls } from "@/app/(workspace)/_components/WorkspaceVideoWithControls";

interface DraftEditorActionConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  isDanger?: boolean;
  isBusy?: boolean;
  /** Library / remote media preview shown left of the description. */
  mediaPreviewUrl?: string | null;
  /** Device file preview (object URL created inside the modal). */
  mediaPreviewFile?: File | null;
  mediaPreviewIsVideo?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DraftEditorActionConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  isDanger = false,
  isBusy = false,
  mediaPreviewUrl = null,
  mediaPreviewFile = null,
  mediaPreviewIsVideo = false,
  onConfirm,
  onCancel,
}: DraftEditorActionConfirmModalProps): React.ReactElement | null {
  const { t } = useTranslations();
  const [fileObjectUrl, setFileObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !mediaPreviewFile) {
      setFileObjectUrl(null);
      return;
    }
    const url = URL.createObjectURL(mediaPreviewFile);
    setFileObjectUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [open, mediaPreviewFile]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        onCancel();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onCancel]);

  if (!open) {
    return null;
  }

  const previewSrc =
    (typeof mediaPreviewUrl === "string" && mediaPreviewUrl.trim()) ||
    fileObjectUrl ||
    null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label={t("content.actionDismiss")}
        className="absolute inset-0 z-[120] bg-black/60"
        onClick={onCancel}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="draft-action-confirm-title"
        aria-describedby="draft-action-confirm-desc"
        className="relative z-[121] w-full max-w-md rounded-2xl border border-outline-variant/20 bg-surface p-6 shadow-2xl"
      >
        <h2
          id="draft-action-confirm-title"
          className="text-lg font-extrabold text-on-surface"
        >
          {title}
        </h2>
        <div className="mt-3 flex items-start gap-3">
          {previewSrc ? (
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container-low">
              {mediaPreviewIsVideo ? (
                <WorkspaceVideoWithControls
                  src={previewSrc}
                  size="compact"
                  className="h-full w-full"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewSrc}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          ) : null}
          <p
            id="draft-action-confirm-desc"
            className="min-w-0 flex-1 text-sm leading-relaxed text-on-surface-variant"
          >
            {description}
          </p>
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            disabled={isBusy}
            onClick={onCancel}
            className="rounded-xl border border-outline-variant/30 px-5 py-2.5 text-sm font-bold text-on-surface transition-opacity disabled:opacity-60"
          >
            {t("content.actionCancel")}
          </button>
          <button
            type="button"
            disabled={isBusy}
            onClick={onConfirm}
            className={`rounded-xl px-5 py-2.5 text-sm font-bold transition-opacity disabled:opacity-60 ${
              isDanger
                ? "bg-error text-on-error"
                : "bg-primary-container text-on-primary-container"
            }`}
          >
            {isBusy ? t("content.pleaseWait") : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
