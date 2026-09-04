"use client";

import { useWorkspaceComposerModal } from "../../../_components/WorkspaceComposerModalProvider";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { CalendarViewMode } from "../_types/calendarTypes";
import { formatWeekNavLabel } from "../_utils/postSchedulerCalendarWeekUtils";

export interface CalendarWeekNavProps {
  weekStart: Date;
  canGoBack?: boolean;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
}

interface PostSchedulerCalendarToolbarProps {
  mode: CalendarViewMode;
  onModeChange: (mode: CalendarViewMode) => void;
  onRefresh: () => Promise<void>;
  isRefreshing: boolean;
  embedded?: boolean;
  weekNav?: CalendarWeekNavProps;
}

const navIconButtonClass =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-outline-variant/25 bg-surface-container text-on-surface transition-colors hover:bg-surface-container-highest disabled:cursor-not-allowed disabled:opacity-30";

export function PostSchedulerCalendarToolbar({
  mode,
  onModeChange,
  onRefresh,
  isRefreshing,
  embedded = false,
  weekNav,
}: PostSchedulerCalendarToolbarProps): React.ReactElement {
  const { t } = useTranslations();
  const { openComposer } = useWorkspaceComposerModal();

  return (
    <div
      className={`flex shrink-0 flex-wrap items-center justify-between gap-2 ${
        embedded
          ? "border-b border-outline-variant/30 bg-surface-container-high px-3 py-2.5 sm:px-4"
          : "mb-3"
      }`}
    >
      {weekNav ? (
        <div className="flex min-w-0 items-center gap-1">
          <button
            type="button"
            onClick={weekNav.onPrevWeek}
            disabled={weekNav.canGoBack === false}
            className={navIconButtonClass}
            aria-label={t("postScheduler.calendar.prevWeek")}
          >
            <span className="material-symbols-outlined text-xl">chevron_left</span>
          </button>
          <button
            type="button"
            onClick={weekNav.onNextWeek}
            className={navIconButtonClass}
            aria-label={t("postScheduler.calendar.nextWeek")}
          >
            <span className="material-symbols-outlined text-xl">chevron_right</span>
          </button>
          <p className="ml-1 truncate text-sm font-bold text-on-surface sm:text-base">
            {formatWeekNavLabel(weekNav.weekStart)}
          </p>
          <button
            type="button"
            onClick={weekNav.onToday}
            className="ml-1 shrink-0 rounded-md border border-outline-variant/30 bg-surface-container px-2.5 py-1 text-xs font-bold text-on-surface transition-colors hover:bg-surface-container-highest sm:text-sm"
          >
            {t("postScheduler.calendar.today")}
          </button>
        </div>
      ) : (
        <div className="min-w-0 flex-1" aria-hidden />
      )}

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <button
          type="button"
          disabled={isRefreshing}
          onClick={() => void onRefresh()}
          className={`${navIconButtonClass} disabled:opacity-50`}
          aria-label={
            isRefreshing ? t("postScheduler.calendar.refreshing") : t("postScheduler.calendar.refresh")
          }
        >
          <span className={`material-symbols-outlined text-lg ${isRefreshing ? "animate-spin" : ""}`}>
            refresh
          </span>
        </button>

        <div className="flex items-center rounded-lg border border-outline-variant/30 bg-surface-container p-1">
          {(
            [
              { id: "list" as const, label: t("postScheduler.calendar.list"), icon: "view_list" },
              { id: "week" as const, label: t("postScheduler.calendar.week"), icon: "calendar_month" },
            ] as const
          ).map((tab) => {
            const active = mode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onModeChange(tab.id)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-bold transition-colors ${
                  active
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => openComposer()}
          className="flex items-center gap-1.5 rounded-lg border border-outline-variant/30 bg-secondary px-3 py-2 text-sm font-bold text-on-secondary shadow-sm transition-colors hover:opacity-95"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          {t("postScheduler.calendar.newPost")}
        </button>
      </div>
    </div>
  );
}
