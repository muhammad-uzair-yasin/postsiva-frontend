"use client";

import { useEffect } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

export type CalendarRefreshTarget = "scheduled" | "published";

interface CalendarRefreshChoiceModalProps {
  open: boolean;
  isBusy?: boolean;
  onCancel: () => void;
  onChoose: (target: CalendarRefreshTarget) => void;
}

export function CalendarRefreshChoiceModal({
  open,
  isBusy = false,
  onCancel,
  onChoose,
}: CalendarRefreshChoiceModalProps): React.ReactElement | null {
  const { t } = useTranslations();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape" && !isBusy) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, isBusy, onCancel]);

  if (!open) return null;

  const busyLabel = t("postScheduler.calendar.refreshing");

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label={t("content.actionDismiss")}
        className="absolute inset-0 z-[120] bg-black/60"
        disabled={isBusy}
        onClick={() => {
          if (!isBusy) onCancel();
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="calendar-refresh-choice-title"
        aria-describedby="calendar-refresh-choice-desc"
        className="relative z-[121] w-full max-w-sm rounded-2xl border border-outline-variant/20 bg-surface p-6 shadow-2xl"
      >
        <h2
          id="calendar-refresh-choice-title"
          className="text-lg font-extrabold text-on-surface"
        >
          {t("postScheduler.calendar.refreshChoiceTitle")}
        </h2>
        <p
          id="calendar-refresh-choice-desc"
          className="mt-2 text-sm leading-relaxed text-on-surface-variant"
        >
          {t("postScheduler.calendar.refreshChoiceDescription")}
        </p>
        <div className="mt-5 flex flex-col gap-2.5">
          <button
            type="button"
            disabled={isBusy}
            onClick={() => onChoose("scheduled")}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-outline-variant/25 bg-surface-container px-4 py-3 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-high disabled:cursor-wait disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-lg text-secondary">
              schedule
            </span>
            {isBusy ? busyLabel : t("postScheduler.calendar.refreshScheduled")}
          </button>
          <button
            type="button"
            disabled={isBusy}
            onClick={() => onChoose("published")}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-outline-variant/25 bg-surface-container px-4 py-3 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-high disabled:cursor-wait disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-lg text-primary">
              check_circle
            </span>
            {isBusy ? busyLabel : t("postScheduler.calendar.refreshPublished")}
          </button>
          <button
            type="button"
            disabled={isBusy}
            onClick={onCancel}
            className="mt-1 w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface disabled:opacity-60"
          >
            {t("content.actionCancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
