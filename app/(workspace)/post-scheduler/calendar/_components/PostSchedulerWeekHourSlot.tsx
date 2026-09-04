"use client";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { WEEK_VIEW_SLOT_ROW_CLASS } from "../_utils/postSchedulerCalendarWeekUtils";

interface PostSchedulerWeekHourSlotProps {
  day: Date;
  /** First hour of this 2-hour block (0, 2, 4, … 22). */
  slotStartHour: number;
  isPast: boolean;
  onAddPost: () => void;
}

export function PostSchedulerWeekHourSlot({
  day,
  slotStartHour,
  isPast,
  onAddPost,
}: PostSchedulerWeekHourSlotProps): React.ReactElement {
  const { t } = useTranslations();
  const isTuesday = day.getDay() === 2;
  const isThursday = day.getDay() === 4;
  const showMockA = slotStartHour === 14 && isTuesday;
  const showMockB = slotStartHour === 14 && isThursday;

  return (
    <div
      className={`relative ${!isPast ? "group " : ""}${WEEK_VIEW_SLOT_ROW_CLASS} bg-surface-container/30 pb-2 pl-2 pt-2 ${isPast ? "pointer-events-none pr-2 opacity-40 saturate-50" : "pr-12"}`}
      aria-disabled={isPast}
    >
      {!isPast ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAddPost();
          }}
          className="absolute right-2 top-2 z-[2] flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant/20 bg-surface-container-high text-on-surface opacity-0 shadow-md transition-[opacity,colors] duration-200 group-hover:opacity-100 focus-visible:opacity-100 hover:border-primary/40 hover:bg-primary-container/20 hover:text-primary"
          aria-label={t("postScheduler.calendar.createInSlot")}
        >
          <span className="material-symbols-outlined text-xl">add</span>
        </button>
      ) : null}
      {showMockA ? (
        <div className="cursor-grab rounded-xl border border-primary-container/30 bg-primary-container/20 p-3 text-left transition-colors hover:bg-primary-container/30">
          <div className="mb-1.5 flex items-center gap-2">
            <span
              className="material-symbols-outlined text-base text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              work
            </span>
            <span className="truncate text-xs font-bold text-on-primary-container">
              {t("postScheduler.platforms.linkedin")}
            </span>
          </div>
          <p className="line-clamp-3 text-xs leading-snug text-on-surface-variant">
            The majority of people search for jobs only on LinkedIn...
          </p>
        </div>
      ) : null}
      {showMockB ? (
        <div className="cursor-grab rounded-xl border border-secondary-container/40 bg-secondary-container/25 p-3 text-left transition-colors hover:bg-secondary-container/35">
          <div className="mb-1.5 flex items-center gap-2">
            <span
              className="material-symbols-outlined text-base text-secondary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              work
            </span>
            <span className="truncate text-xs font-bold text-on-secondary-container">
              {t("postScheduler.platforms.linkedin")}
            </span>
          </div>
          <p className="line-clamp-3 text-xs leading-snug text-on-surface-variant">
            Tired of the &apos;Copy-Paste&apos; struggle on LinkedIn? Repos...
          </p>
        </div>
      ) : null}
    </div>
  );
}
