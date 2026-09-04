"use client";

import { useState, type ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { useWordPressUnifiedEditActions } from "../_hooks/useWordPressUnifiedEditActions";
import { PostSchedulerPipelineSlotModal } from "../../post-scheduler/_components/PostSchedulerPipelineSlotModal";

export function WordPressUnifiedEditActionBar({
  mode,
  connectionId,
  draftId,
  scheduledPostId,
  onClose,
  onOpenSchedule,
  onUpdateSuccess,
  onScheduleComplete,
  onPublishSuccess,
  onDeleteSuccess,
  onMoveToDraftSuccess,
}: {
  mode: "draft" | "scheduled";
  connectionId: string;
  draftId?: string;
  scheduledPostId?: string;
  onClose: () => void;
  onOpenSchedule?: () => void;
  onUpdateSuccess?: () => void;
  onScheduleComplete?: () => void;
  onPublishSuccess?: () => void;
  onDeleteSuccess?: () => void;
  onMoveToDraftSuccess?: () => void;
}): ReactElement {
  const { t } = useTranslations();
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const {
    busy,
    error,
    save,
    schedule,
    reschedule,
    publish,
    remove,
    moveToDraft,
  } = useWordPressUnifiedEditActions({
    mode,
    connectionId,
    draftId,
    scheduledPostId,
    onSaved: onUpdateSuccess,
    onScheduled: onScheduleComplete,
    onPublished: onPublishSuccess,
    onDeleted: onDeleteSuccess,
    onMovedToDraft: onMoveToDraftSuccess,
  });

  const openSchedulePicker = (): void => {
    if (onOpenSchedule) {
      onOpenSchedule();
      return;
    }
    setScheduleOpen(true);
  };

  return (
    <>
      <div className="border-t border-outline-variant/15 bg-surface px-4 py-3 sm:px-5">
        {error ? (
          <p className="mb-2 rounded-xl border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
            {error}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              void save();
            }}
            className="rounded-xl bg-surface-container-high px-4 py-2.5 text-sm font-bold text-on-surface disabled:opacity-50"
          >
            {busy ? t("content.draftModalSaving") : t("common.save")}
          </button>
          {mode === "draft" ? (
            <button
              type="button"
              disabled={busy}
              onClick={openSchedulePicker}
              className="rounded-xl bg-secondary-container px-4 py-2.5 text-sm font-bold text-on-secondary-container disabled:opacity-50"
            >
              {t("composer.schedule")}
            </button>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={openSchedulePicker}
              className="rounded-xl bg-secondary-container px-4 py-2.5 text-sm font-bold text-on-secondary-container disabled:opacity-50"
            >
              {t("content.confirmReschedule")}
            </button>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              void publish();
            }}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-on-primary disabled:opacity-50"
          >
            {t("composer.publishNow")}
          </button>
          {mode === "scheduled" ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                void moveToDraft();
              }}
              className="rounded-xl border border-outline-variant/25 px-4 py-2.5 text-sm font-bold text-on-surface disabled:opacity-50"
            >
              {t("content.scheduledMoveToDrafts")}
            </button>
          ) : null}
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              void remove();
            }}
            className="ml-auto rounded-xl px-4 py-2.5 text-sm font-bold text-error disabled:opacity-50"
          >
            {t("content.actionDelete")}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-on-surface-variant"
          >
            {t("content.actionClose")}
          </button>
        </div>
      </div>
      <PostSchedulerPipelineSlotModal
        open={scheduleOpen}
        onClose={() => {
          setScheduleOpen(false);
        }}
        onPickSlot={(at) => {
          setScheduleOpen(false);
          const isoUtc = at.toISOString();
          if (mode === "draft") {
            void schedule(isoUtc);
            return;
          }
          void reschedule(isoUtc);
        }}
      />
    </>
  );
}
