"use client";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

interface DraftEditorPrimaryActionsProps {
  isSaving: boolean;
  onUpdateClick: () => void;
  onPublishClick: () => void;
  onDeleteClick: () => void;
  /** Dense footer matching ScheduledPostPrimaryActions compact mode. */
  compact?: boolean;
}

export function DraftEditorPrimaryActions({
  isSaving,
  onUpdateClick,
  onPublishClick,
  onDeleteClick,
  compact = false,
}: DraftEditorPrimaryActionsProps): React.ReactElement {
  const { t } = useTranslations();

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
          onClick={onUpdateClick}
          className="rounded-lg border border-outline-variant/35 bg-surface px-3 py-2 text-xs font-bold text-on-surface transition-opacity hover:bg-surface-container disabled:opacity-60"
        >
          {isSaving ? t("content.draftUpdating") : t("content.draftUpdate")}
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
        className="rounded-xl bg-primary-container px-6 py-3 text-sm font-bold text-on-primary-container shadow-lg transition-opacity disabled:opacity-60"
      >
        {isSaving ? t("content.draftUpdating") : t("content.draftUpdate")}
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
        onClick={onDeleteClick}
        className="rounded-xl border border-error/40 px-6 py-3 text-sm font-bold text-error transition-opacity disabled:opacity-60"
      >
        {t("content.actionDelete")}
      </button>
    </div>
  );
}
