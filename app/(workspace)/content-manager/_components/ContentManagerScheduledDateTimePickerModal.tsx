"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
  type ReactElement,
} from "react";
import { createPortal } from "react-dom";
import {
  addDays,
  isSameDay,
  startOfDay,
} from "../../post-scheduler/calendar/_utils/postSchedulerCalendarWeekUtils";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { ScheduledDateTimePickerCalendar } from "./scheduled-datetime-picker/ScheduledDateTimePickerCalendar";
import { ScheduledDateTimePickerTimeControls } from "./scheduled-datetime-picker/ScheduledDateTimePickerTimeControls";
import {
  combineDateAndTime,
  defaultPickDateTime,
  formatSummary,
  from12HourParts,
  nextFriday,
  nextMonday,
  tonightOrTomorrowAt,
  to12HourParts,
} from "./scheduled-datetime-picker/scheduledDateTimePickerUtils";

type QuickKind =
  | "plus1h"
  | "plus3h"
  | "tonight8"
  | "tomorrow9"
  | "tomorrow14"
  | "in2days"
  | "nextMonday"
  | "nextFriday";

interface ContentManagerScheduledDateTimePickerModalProps {
  open: boolean;
  day: Date;
  now: Date;
  onClose: () => void;
  onConfirm: (at: Date) => void;
  initialValue?: Date | null;
  confirmLabel?: string;
  body?: string;
}

export function ContentManagerScheduledDateTimePickerModal({
  open,
  day,
  now,
  onClose,
  onConfirm,
  initialValue = null,
  confirmLabel,
  body,
}: ContentManagerScheduledDateTimePickerModalProps): ReactElement | null {
  const { t } = useTranslations();
  const titleId = useId();

  const seedDate = useMemo(() => {
    if (initialValue && !Number.isNaN(initialValue.getTime())) {
      return initialValue;
    }
    return defaultPickDateTime(day, now);
  }, [day, initialValue, now]);

  const [pickedAt, setPickedAt] = useState<Date>(seedDate);
  const [viewMonth, setViewMonth] = useState(
    () => new Date(seedDate.getFullYear(), seedDate.getMonth(), 1),
  );

  const initialValueMs =
    initialValue && !Number.isNaN(initialValue.getTime())
      ? initialValue.getTime()
      : null;

  useEffect(() => {
    if (!open) return;
    const seed =
      initialValueMs !== null
        ? new Date(initialValueMs)
        : defaultPickDateTime(day, now);
    setPickedAt(seed);
    setViewMonth(new Date(seed.getFullYear(), seed.getMonth(), 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sample `now` on open
  }, [open, day, initialValueMs]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent): void {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const isInvalid = pickedAt.getTime() <= now.getTime();

  const selectDay = useCallback(
    (nextDay: Date): void => {
      const parts = to12HourParts(pickedAt);
      const { hours24, minute } = from12HourParts(
        parts.hour12,
        parts.minute,
        parts.period,
      );
      let next = combineDateAndTime(nextDay, hours24, minute);
      if (isSameDay(nextDay, now) && next.getTime() <= now.getTime()) {
        next = defaultPickDateTime(nextDay, now);
      }
      setPickedAt(next);
    },
    [now, pickedAt],
  );

  const applyQuick = useCallback(
    (kind: QuickKind): void => {
      let d: Date;
      switch (kind) {
        case "plus1h": {
          d = new Date(now);
          d.setHours(d.getHours() + 1, 0, 0, 0);
          break;
        }
        case "plus3h": {
          d = new Date(now);
          d.setHours(d.getHours() + 3, 0, 0, 0);
          break;
        }
        case "tonight8":
          d = tonightOrTomorrowAt(now, 20, 0);
          break;
        case "tomorrow9": {
          d = addDays(startOfDay(now), 1);
          d.setHours(9, 0, 0, 0);
          break;
        }
        case "tomorrow14": {
          d = addDays(startOfDay(now), 1);
          d.setHours(14, 0, 0, 0);
          break;
        }
        case "in2days": {
          d = addDays(startOfDay(now), 2);
          d.setHours(9, 0, 0, 0);
          break;
        }
        case "nextMonday": {
          d = nextMonday(now);
          d.setHours(9, 0, 0, 0);
          break;
        }
        case "nextFriday": {
          d = nextFriday(now);
          d.setHours(9, 0, 0, 0);
          break;
        }
        default:
          return;
      }
      setPickedAt(d);
      setViewMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    },
    [now],
  );

  const confirm = useCallback((): void => {
    if (isInvalid) return;
    onConfirm(pickedAt);
  }, [isInvalid, onConfirm, pickedAt]);

  if (!open) return null;

  const modal = (
    <div
      className="fixed inset-0 z-[320] flex items-center justify-center overflow-y-auto p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        aria-label={t("content.actionClose")}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-[321] my-auto max-h-[min(88vh,760px)] w-full max-w-[36rem] overflow-y-auto rounded-2xl border border-outline-variant/20 bg-surface-container-high shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-outline-variant/15 bg-surface-container-highest/40 px-4 py-3.5 sm:px-5">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-bold tracking-tight text-on-surface">
              {t("content.dateTimePickerTitle")}
            </h2>
            <p className="mt-0.5 text-xs leading-snug text-on-surface-variant">
              {body ?? t("content.dateTimePickerBody")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("content.actionClose")}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden>
              close
            </span>
          </button>
        </div>

        <div className="px-4 py-4 sm:px-5">
          <div className="rounded-xl border border-secondary/25 bg-gradient-to-br from-secondary-container/35 via-surface-container to-surface-container px-3.5 py-3 sm:px-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-secondary">
              {t("content.dateTimePickerSelected")}
            </p>
            <p className="mt-0.5 text-base font-bold tracking-tight text-on-surface sm:text-lg">
              {formatSummary(pickedAt)}
            </p>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {(
              [
                ["plus1h", "content.dateTimePickerQuickPlus1h"],
                ["plus3h", "content.dateTimePickerQuickPlus3h"],
                ["tonight8", "content.dateTimePickerQuickTonight8"],
                ["tomorrow9", "content.dateTimePickerQuickTomorrow9"],
                ["tomorrow14", "content.dateTimePickerQuickTomorrow14"],
                ["in2days", "content.dateTimePickerQuickIn2Days"],
                ["nextMonday", "content.dateTimePickerQuickNextMonday"],
                ["nextFriday", "content.dateTimePickerQuickNextFriday"],
              ] as const
            ).map(([kind, key]) => (
              <QuickChip
                key={kind}
                label={t(key)}
                onClick={() => applyQuick(kind)}
              />
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-outline-variant/20 bg-surface-container/80 p-3">
              <ScheduledDateTimePickerCalendar
                selected={pickedAt}
                now={now}
                viewMonth={viewMonth}
                onViewMonthChange={setViewMonth}
                onSelectDay={selectDay}
                labels={{
                  prevMonth: t("content.dateTimePickerPrevMonth"),
                  nextMonth: t("content.dateTimePickerNextMonth"),
                  today: t("content.dateTimePickerToday"),
                }}
              />
            </div>
            <div className="rounded-xl border border-outline-variant/20 bg-surface-container/80 p-3">
              <ScheduledDateTimePickerTimeControls
                value={pickedAt}
                onChange={setPickedAt}
                labels={{
                  hour: t("content.dateTimePickerHour"),
                  minute: t("content.dateTimePickerMinute"),
                  customTime: t("content.dateTimePickerCustomTime"),
                  customTimePlaceholder: t(
                    "content.dateTimePickerCustomPlaceholder",
                  ),
                  customTimeInvalid: t("content.dateTimePickerCustomInvalid"),
                  am: t("content.dateTimePickerAm"),
                  pm: t("content.dateTimePickerPm"),
                }}
              />
            </div>
          </div>

          {isInvalid ? (
            <p className="mt-3 rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-xs font-medium text-error">
              {t("content.dateTimePickerInvalid")}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-outline-variant/15 bg-surface-container-highest/30 px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-outline-variant/30 px-4 py-2 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container"
          >
            {t("content.actionCancel")}
          </button>
          <button
            type="button"
            disabled={isInvalid}
            onClick={confirm}
            className="rounded-lg bg-secondary px-4 py-2 text-sm font-bold text-on-secondary shadow-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-45"
          >
            {confirmLabel ?? t("content.dateTimePickerContinue")}
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") {
    return null;
  }
  return createPortal(modal, document.body);
}

function QuickChip({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}): ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-outline-variant/30 bg-surface-container-highest/50 px-3 py-1.5 text-xs font-semibold text-on-surface transition-colors hover:border-secondary/50 hover:bg-secondary-container/40 hover:text-secondary"
    >
      {label}
    </button>
  );
}
