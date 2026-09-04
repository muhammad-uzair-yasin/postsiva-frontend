"use client";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

interface ScheduledPostPrimaryActionsProps {
  isSaving: boolean;
  onUpdateClick: () => void;
  onPublishClick: () => void;
  onDeleteClick: () => void;
  onMoveToDraftClick: () => void;
  compact?: boolean;
  /** When true, show "Reschedule" instead of "Update" */
  timeChanged?: boolean;
  /** When true (text/media/optional settings edited), highlight Update */
  hasChanges?: boolean;
}

export function ScheduledPostPrimaryActions({
  isSaving,
  onUpdateClick,
  onPublishClick,
  onDeleteClick,
  onMoveToDraftClick,
  compact = false,
  timeChanged = false,
  hasChanges = false,
}: ScheduledPostPrimaryActionsProps): React.ReactElement {
  const { t } = useTranslations();
  const updateButtonLabel = timeChanged
    ? t("content.scheduledReschedule")
    : isSaving
      ? t("content.scheduledUpdating")
      : t("content.scheduledUpdate");
  const updateHighlighted = timeChanged || hasChanges;

  if (compact) {
    return (
      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          disabled={isSaving}
          onClick={onDeleteClick}
          className="rounded-lg p-2 text-error/80 transition-colors hover:bg-error/10 hover:text-error disabled:opacity-60"
          aria-label={t("content.actionDelete")}
          title={t("content.actionDelete")}
        >
          <span className="material-symbols-outlined text-[20px]">delete</span>
        </button>
        <button
          type="button"
          disabled={isSaving}
          onClick={onMoveToDraftClick}
          className="rounded-lg border border-outline-variant/30 bg-surface-container-low px-3 py-2 text-xs font-bold text-on-surface transition-opacity hover:bg-surface-container disabled:opacity-60"
        >
          {t("content.scheduledMoveToDrafts")}
        </button>
        <button
          type="button"
          disabled={isSaving}
          onClick={onUpdateClick}
          className={`rounded-lg px-3 py-2 text-xs font-bold transition-opacity disabled:opacity-60 ${
            updateHighlighted
              ? "bg-secondary-container text-on-secondary-container shadow-sm ring-1 ring-secondary/40"
              : "border border-outline-variant/35 bg-surface text-on-surface opacity-70"
          }`}
        >
          {updateButtonLabel}
        </button>
        <button
          type="button"
          disabled={isSaving}
          onClick={onPublishClick}
          className="rounded-lg bg-secondary-container px-4 py-2 text-xs font-bold text-on-secondary-container transition-opacity hover:brightness-110 disabled:opacity-60"
        >
          {t("content.draftPublishNow")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        disabled={isSaving}
        onClick={onUpdateClick}
        className={`rounded-xl px-6 py-3 text-sm font-bold shadow-lg transition-opacity disabled:opacity-60 ${
          updateHighlighted
            ? "bg-secondary-container text-on-secondary-container ring-1 ring-secondary/40"
            : "border border-outline-variant/35 bg-surface-container-low text-on-surface opacity-70"
        }`}
      >
        {updateButtonLabel}
      </button>
      <button
        type="button"
        disabled={isSaving}
        onClick={onPublishClick}
        className="rounded-xl border border-secondary/40 bg-secondary-container px-6 py-3 text-sm font-bold text-on-secondary-container transition-opacity disabled:opacity-60"
      >
        {t("content.draftPublishNow")}
      </button>
      <button
        type="button"
        disabled={isSaving}
        onClick={onMoveToDraftClick}
        className="rounded-xl border border-outline-variant/35 bg-surface-container-low px-6 py-3 text-sm font-bold text-on-surface transition-opacity hover:bg-surface-container disabled:opacity-60"
      >
        {t("content.scheduledMoveToDrafts")}
      </button>
      <button
        type="button"
        disabled={isSaving}
        onClick={onDeleteClick}
        className="rounded-xl border border-error/40 px-6 py-3 text-sm font-bold text-error transition-opacity disabled:opacity-60"
      >
        {t("content.actionDelete")}
      </button>
    </div>
  );
}
