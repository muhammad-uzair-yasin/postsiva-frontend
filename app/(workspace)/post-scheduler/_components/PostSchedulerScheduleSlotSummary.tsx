"use client";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

interface PostSchedulerScheduleSlotSummaryProps {
  readonly dateLabel: string;
  readonly timeLabel: string;
  readonly onChangeSlot: () => void;
  /** Clears the picked slot (compact layout only). */
  readonly onClearSelection?: () => void;
  /** Single tappable summary card (sidebar layout). */
  readonly compact?: boolean;
}

export function PostSchedulerScheduleSlotSummary({
  dateLabel,
  timeLabel,
  onChangeSlot,
  onClearSelection,
  compact = false,
}: PostSchedulerScheduleSlotSummaryProps): React.ReactElement {
  const { t } = useTranslations();

  if (compact) {
    return (
      <div className="relative w-full rounded-2xl border border-secondary/25 bg-gradient-to-br from-secondary/[0.08] to-transparent transition hover:border-secondary/45 hover:from-secondary/[0.12]">
        {onClearSelection ? (
          <button
            type="button"
            aria-label={t("postScheduler.calendar.clearScheduledTime")}
            onClick={(e) => {
              e.stopPropagation();
              onClearSelection();
            }}
            className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-surface-container-highest/80 hover:text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
          >
            <span className="material-symbols-outlined text-xl leading-none">
              close
            </span>
          </button>
        ) : null}
        <button
          type="button"
          onClick={onChangeSlot}
          className={`group w-full rounded-2xl px-4 pb-3.5 pt-3.5 text-left transition ${
            onClearSelection ? "pr-12" : ""
          }`}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-secondary">
            {t("postScheduler.schedule.scheduled")}
          </p>
          <p className="mt-1.5 text-sm font-bold leading-snug text-on-surface">
            {dateLabel}
            <span className="mx-1.5 text-on-surface-variant/60">·</span>
            {timeLabel}
          </p>
          <p className="mt-2 flex items-center gap-1 text-[11px] font-medium text-on-surface-variant">
            <span className="material-symbols-outlined text-base text-secondary/90">
              edit_calendar
            </span>
            {t("postScheduler.schedule.changeInPipeline")}
          </p>
        </button>
      </div>
    );
  }

  return (
    <>
      <div>
        <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-outline">
          {t("postScheduler.schedule.date")}
        </label>
        <div className="flex items-center justify-between rounded-lg border border-outline-variant/10 bg-surface-container-lowest px-2.5 py-2 text-sm font-medium text-on-surface">
          <span>{dateLabel}</span>
          <span className="material-symbols-outlined text-on-surface-variant">
            calendar_today
          </span>
        </div>
      </div>
      <div>
        <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-outline">
          {t("postScheduler.schedule.time")}
        </label>
        <div className="flex items-center justify-between rounded-lg border border-outline-variant/10 bg-surface-container-lowest px-2.5 py-2 text-sm font-medium text-on-surface">
          <span>{timeLabel}</span>
          <span className="material-symbols-outlined text-on-surface-variant">
            schedule
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={onChangeSlot}
        className="w-full text-center text-xs font-semibold text-secondary underline-offset-2 hover:underline"
      >
        {t("postScheduler.schedule.changeTimeInPipeline")}
      </button>
    </>
  );
}
