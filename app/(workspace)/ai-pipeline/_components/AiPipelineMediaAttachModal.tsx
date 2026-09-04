"use client";

import { useEffect } from "react";

import type { ComposerAttachedMedia } from "@/lib/post-composer/composerAttachedMediaTypes";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { AiPipelineMediaLibraryPickerContent } from "./AiPipelineMediaLibraryPickerContent";

export interface AiPipelineMediaAttachModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onSelect: (media: ComposerAttachedMedia) => void;
  readonly currentPending: ComposerAttachedMedia | null;
}

export function AiPipelineMediaAttachModal({
  open,
  onClose,
  onSelect,
  currentPending,
}: AiPipelineMediaAttachModalProps): React.ReactElement | null {
  const { t } = useTranslations();

  useEffect(() => {
    if (!open) {
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[132] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label={t("common.close")}
        className="absolute inset-0 z-[132] bg-black/70"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-pipeline-media-modal-title"
        className="relative z-[133] flex max-h-[min(90dvh,640px)] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-outline-variant/20 bg-surface shadow-2xl sm:rounded-2xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-outline-variant/15 px-4 py-3 sm:px-5">
          <h2
            id="ai-pipeline-media-modal-title"
            className="flex min-w-0 items-center gap-2 text-sm font-bold text-on-surface"
          >
            <span className="material-symbols-outlined shrink-0 text-secondary">
              photo_library
            </span>
            <span className="truncate">{t("aiPipeline.mediaLibraryTitle")}</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high"
            aria-label={t("common.close")}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 sm:p-5">
          <AiPipelineMediaLibraryPickerContent
            enabled={open}
            onSelect={onSelect}
            onClose={onClose}
            currentPending={currentPending}
          />
        </div>
      </div>
    </div>
  );
}
