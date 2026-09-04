"use client";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { formatWeekNavLabel } from "../_utils/postSchedulerCalendarWeekUtils";

interface PostSchedulerWeekGridNavProps {
  weekStart: Date;
  canGoBack?: boolean;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function PostSchedulerWeekGridNav({
  weekStart,
  canGoBack = true,
  onPrevWeek,
  onNextWeek,
  onToday,
  onRefresh,
  isRefreshing = false,
}: PostSchedulerWeekGridNavProps): React.ReactElement {
  const { t } = useTranslations();

  return (
    <div className="flex shrink-0 items-center justify-between gap-3 border-b border-outline-variant/30 bg-surface-container-high px-3 py-2.5 sm:px-4">
      <div className="flex min-w-0 items-center gap-1">
        <button
          type="button"
          onClick={onPrevWeek}
          disabled={!canGoBack}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-outline-variant/25 bg-surface-container text-on-surface transition-colors hover:bg-surface-container-highest disabled:cursor-not-allowed disabled:opacity-30"
          aria-label={t("postScheduler.calendar.prevWeek")}
        >
          <span className="material-symbols-outlined text-xl">chevron_left</span>
        </button>
        <button
          type="button"
          onClick={onNextWeek}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-outline-variant/25 bg-surface-container text-on-surface transition-colors hover:bg-surface-container-highest"
          aria-label={t("postScheduler.calendar.nextWeek")}
        >
          <span className="material-symbols-outlined text-xl">chevron_right</span>
        </button>
        <p className="ml-1 truncate text-sm font-bold text-on-surface sm:text-base">
          {formatWeekNavLabel(weekStart)}
        </p>
        <button
          type="button"
          onClick={onToday}
          className="ml-2 shrink-0 rounded-md border border-outline-variant/30 bg-surface-container px-2.5 py-1 text-xs font-bold text-on-surface transition-colors hover:bg-surface-container-highest sm:text-sm"
        >
          {t("postScheduler.calendar.today")}
        </button>
      </div>
      {onRefresh ? (
        <button
          type="button"
          disabled={isRefreshing}
          onClick={() => void onRefresh()}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-outline-variant/25 bg-surface-container text-on-surface transition-colors hover:bg-surface-container-highest disabled:opacity-50"
          aria-label={isRefreshing ? t("postScheduler.calendar.refreshing") : t("postScheduler.calendar.refresh")}
        >
          <span className={`material-symbols-outlined text-lg ${isRefreshing ? "animate-spin" : ""}`}>
            refresh
          </span>
        </button>
      ) : null}
    </div>
  );
}
