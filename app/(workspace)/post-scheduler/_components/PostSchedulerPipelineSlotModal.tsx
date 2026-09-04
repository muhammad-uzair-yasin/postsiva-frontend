"use client";

import { useCallback, useEffect, type ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { ContentManagerScheduledPipelineList } from "../../content-manager/_components/ContentManagerScheduledPipelineList";
import { ContentManagerScheduledPipelineSkeleton } from "../../content-manager/_components/ContentManagerScheduledPipelineSkeleton";
import { useContentManagerScheduledPosts } from "../../content-manager/_hooks/useContentManagerScheduledPosts";
import type { ContentManagerPost } from "../../content-manager/_types/contentManagerTypes";

interface PostSchedulerPipelineSlotModalProps {
  open: boolean;
  onClose: () => void;
  /** User tapped an empty “+ New” / custom time row — local time for that slot. */
  onPickSlot: (at: Date) => void;
}

export function PostSchedulerPipelineSlotModal({
  open,
  onClose,
  onPickSlot,
}: PostSchedulerPipelineSlotModalProps): ReactElement | null {
  const { t } = useTranslations();
  const { scheduledPosts, isLoading, error } =
    useContentManagerScheduledPosts(open);

  const handlePickSlot = useCallback(
    (at: Date): void => {
      onPickSlot(at);
      onClose();
    },
    [onClose, onPickSlot],
  );

  const noopPost = useCallback((_post: ContentManagerPost): void => {
    /* Picker mode: existing posts are view-only. */
  }, []);

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

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[140] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label={t("postScheduler.pipeline.closeCalendar")}
        className="absolute inset-0 z-[140] bg-black/70"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="post-scheduler-pipeline-slot-title"
        className="relative z-[141] flex max-h-[min(90vh,820px)] w-full max-w-[min(96vw,1200px)] flex-col overflow-hidden rounded-t-3xl border border-outline-variant/20 bg-surface shadow-2xl sm:mx-4 sm:rounded-3xl"
      >
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-outline-variant/10 px-4 py-4 md:px-6">
          <h2
            id="post-scheduler-pipeline-slot-title"
            className="text-lg font-extrabold text-on-surface md:text-xl"
          >
            {t("postScheduler.pipeline.pickTime")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
            aria-label={t("common.close")}
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4 pt-2 md:px-5">
          {isLoading ? <ContentManagerScheduledPipelineSkeleton /> : null}
          {!isLoading && error ? (
            <p className="rounded-xl border border-error/25 bg-error/5 px-4 py-6 text-center text-sm text-error">
              {error}
            </p>
          ) : null}
          {!isLoading && !error ? (
            <ContentManagerScheduledPipelineList
              posts={scheduledPosts}
              onOpenScheduledEditor={noopPost}
              onRequestDeleteScheduled={noopPost}
              onPickSlot={handlePickSlot}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
