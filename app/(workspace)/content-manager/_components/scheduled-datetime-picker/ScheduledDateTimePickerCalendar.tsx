"use client";

import type { ReactElement } from "react";
import {
  isSameDay,
  startOfDay,
} from "@/app/(workspace)/post-scheduler/calendar/_utils/postSchedulerCalendarWeekUtils";
import {
  buildMonthGrid,
  formatMonthYear,
  isBeforeDay,
} from "./scheduledDateTimePickerUtils";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

interface ScheduledDateTimePickerCalendarProps {
  selected: Date;
  now: Date;
  viewMonth: Date;
  onViewMonthChange: (month: Date) => void;
  onSelectDay: (day: Date) => void;
  labels: {
    prevMonth: string;
    nextMonth: string;
    today: string;
  };
}

export function ScheduledDateTimePickerCalendar({
  selected,
  now,
  viewMonth,
  onViewMonthChange,
  onSelectDay,
  labels,
}: ScheduledDateTimePickerCalendarProps): ReactElement {
  const cells = buildMonthGrid(viewMonth);
  const today = startOfDay(now);
  const monthStart = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);

  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-center justify-between gap-2">
        <button
          type="button"
          aria-label={labels.prevMonth}
          onClick={() =>
            onViewMonthChange(
              new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1),
            )
          }
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-outline-variant/25 bg-surface-container-high text-on-surface transition-colors hover:border-secondary/40 hover:text-secondary"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden>
            chevron_left
          </span>
        </button>
        <p className="text-sm font-bold tracking-tight text-on-surface">
          {formatMonthYear(monthStart)}
        </p>
        <button
          type="button"
          aria-label={labels.nextMonth}
          onClick={() =>
            onViewMonthChange(
              new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1),
            )
          }
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-outline-variant/25 bg-surface-container-high text-on-surface transition-colors hover:border-secondary/40 hover:text-secondary"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden>
            chevron_right
          </span>
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-0.5">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="py-0.5 text-center text-[10px] font-bold uppercase tracking-wide text-on-surface-variant"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((cell) => {
          const inMonth = cell.getMonth() === viewMonth.getMonth();
          const disabled = isBeforeDay(cell, today);
          const selectedDay = isSameDay(cell, selected);
          const isToday = isSameDay(cell, today);
          return (
            <button
              key={cell.toISOString()}
              type="button"
              disabled={disabled}
              onClick={() => onSelectDay(startOfDay(cell))}
              className={[
                "relative flex h-8 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                disabled
                  ? "cursor-not-allowed text-on-surface-variant/30"
                  : "hover:bg-secondary-container/45",
                !inMonth && !disabled ? "text-on-surface-variant/45" : "",
                selectedDay
                  ? "bg-secondary text-on-secondary shadow-sm hover:bg-secondary"
                  : inMonth && !disabled
                    ? "text-on-surface"
                    : "",
                isToday && !selectedDay
                  ? "ring-2 ring-inset ring-secondary/70"
                  : "",
              ].join(" ")}
            >
              {cell.getDate()}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => {
          onViewMonthChange(new Date(today.getFullYear(), today.getMonth(), 1));
          onSelectDay(today);
        }}
        className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-secondary transition-colors hover:text-secondary/80"
      >
        <span className="material-symbols-outlined text-[16px]" aria-hidden>
          today
        </span>
        {labels.today}
      </button>
    </div>
  );
}
