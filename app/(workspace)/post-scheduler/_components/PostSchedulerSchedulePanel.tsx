"use client";

import type { ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

interface PostSchedulerSchedulePanelProps {
  initialScheduledAt?: Date;
  /** Opening composer with a slot time already set (navbar + uses false). */
  pipelineSlotPreselected?: boolean;
  /** Flat layout inside `PostSchedulerComposerSidebar` (no inner card chrome). */
  embedded?: boolean;
}

export function PostSchedulerSchedulePanel({
  initialScheduledAt: _initialScheduledAt,
  pipelineSlotPreselected: _pipelineSlotPreselected = false,
  embedded = false,
}: PostSchedulerSchedulePanelProps): ReactElement {
  const { t } = useTranslations();
  const shellClass = embedded
    ? "flex min-h-0 flex-col gap-5"
    : "rounded-2xl border border-outline-variant/5 bg-surface-container p-4 shadow-xl sm:p-5";

  return (
    <div className={shellClass}>
      {embedded ? (
        <header className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/85">
            {t("postScheduler.schedule.whenToPost")}
          </p>
          <h3 className="flex items-center gap-2 text-lg font-bold tracking-tight text-on-surface">
            <span
              className="material-symbols-outlined text-2xl text-secondary/90"
              aria-hidden
            >
              event_available
            </span>
            {t("postScheduler.schedule.title")}
          </h3>
        </header>
      ) : (
        <h3 className="text-md mb-2 flex items-center gap-2 text-sm font-bold text-on-surface">
          <span className="material-symbols-outlined text-secondary">schedule</span>
          {t("postScheduler.schedule.title")}
        </h3>
      )}

      <div className={embedded ? "flex min-h-0 flex-1 flex-col gap-5" : "space-y-3"}>
        <div className="flex gap-3 rounded-2xl border border-outline-variant/15 bg-surface-container-highest/25 px-4 py-3.5">
          <span
            className="material-symbols-outlined mt-0.5 shrink-0 text-2xl text-primary-container/90"
            aria-hidden
          >
            calendar_month
          </span>
          <p className="text-xs leading-relaxed text-on-surface-variant">
            {t("postScheduler.schedule.hint", {
              schedule: t("composer.schedule"),
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
