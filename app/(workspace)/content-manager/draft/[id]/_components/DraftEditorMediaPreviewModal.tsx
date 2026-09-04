"use client";

import { useEffect, type ReactElement } from "react";
import { createPortal } from "react-dom";

import { WorkspaceVideoWithControls } from "@/app/(workspace)/_components/WorkspaceVideoWithControls";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

interface DraftEditorMediaPreviewModalProps {
  readonly open: boolean;
  readonly imageUrl?: string | null;
  readonly videoUrl?: string | null;
  readonly busy?: boolean;
  readonly onClose: () => void;
  readonly onChange?: () => void;
}

export function DraftEditorMediaPreviewModal({
  open,
  imageUrl,
  videoUrl,
  busy = false,
  onClose,
  onChange,
}: DraftEditorMediaPreviewModalProps): ReactElement | null {
  const { t } = useTranslations();
  const portalRoot = typeof document !== "undefined" ? document.body : null;

  useEffect(() => {
    if (!open) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open || !portalRoot) {
    return null;
  }

  const showVideo = Boolean(videoUrl?.trim());
  const showImage = Boolean(imageUrl?.trim()) && !showVideo;

  return createPortal(
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center overflow-hidden bg-black/75 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="draft-media-preview-title"
        className="flex max-h-[calc(100dvh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-low shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-outline-variant/10 px-4 py-3">
          <h2 id="draft-media-preview-title" className="text-sm font-bold text-on-surface">
            {t("content.draftMediaPreviewTitle")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
            aria-label={t("common.close")}
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-black/90 p-3">
          {showVideo && videoUrl ? (
            <WorkspaceVideoWithControls
              src={videoUrl}
              size="preview"
              objectFit="contain"
              className="max-h-full w-full rounded-xl"
            />
          ) : showImage && imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- user media preview
            <img
              src={imageUrl}
              alt=""
              className="max-h-full max-w-full object-contain"
            />
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-outline-variant/10 px-4 py-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high"
          >
            {t("common.close")}
          </button>
          {onChange ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                onClose();
                onChange();
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-on-primary disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-base">edit</span>
              {t("content.draftMediaChange")}
            </button>
          ) : null}
        </div>
      </div>
    </div>,
    portalRoot,
  );
}
