"use client";

import { useState, type ReactElement } from "react";
import {
  formatCustomTimeInput,
  from12HourParts,
  parseCustomTime,
  to12HourParts,
} from "./scheduledDateTimePickerUtils";

interface ScheduledDateTimePickerTimeControlsProps {
  value: Date;
  onChange: (next: Date) => void;
  labels: {
    hour: string;
    minute: string;
    customTime: string;
    customTimePlaceholder: string;
    customTimeInvalid: string;
    am: string;
    pm: string;
  };
}

function Stepper({
  label,
  display,
  onInc,
  onDec,
}: {
  label: string;
  display: string;
  onInc: () => void;
  onDec: () => void;
}): ReactElement {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-secondary">
        {label}
      </span>
      <button
        type="button"
        aria-label={`Increase ${label}`}
        onClick={onInc}
        className="flex h-8 w-12 items-center justify-center rounded-lg border border-outline-variant/25 bg-surface-container-high text-on-surface transition-colors hover:border-secondary/50 hover:text-secondary"
      >
        <span className="material-symbols-outlined text-[18px]" aria-hidden>
          expand_less
        </span>
      </button>
      <div className="flex h-12 w-14 items-center justify-center rounded-xl border border-secondary/35 bg-secondary-container/40 text-xl font-bold tabular-nums text-on-surface shadow-inner">
        {display}
      </div>
      <button
        type="button"
        aria-label={`Decrease ${label}`}
        onClick={onDec}
        className="flex h-8 w-12 items-center justify-center rounded-lg border border-outline-variant/25 bg-surface-container-high text-on-surface transition-colors hover:border-secondary/50 hover:text-secondary"
      >
        <span className="material-symbols-outlined text-[18px]" aria-hidden>
          expand_more
        </span>
      </button>
    </div>
  );
}

export function ScheduledDateTimePickerTimeControls({
  value,
  onChange,
  labels,
}: ScheduledDateTimePickerTimeControlsProps): ReactElement {
  const { hour12, minute, period } = to12HourParts(value);
  const [customDraft, setCustomDraft] = useState<string | null>(null);
  const [customError, setCustomError] = useState<string | null>(null);
  const customValue = customDraft ?? formatCustomTimeInput(value);

  const applyParts = (h12: number, min: number, per: "AM" | "PM"): void => {
    const { hours24, minute: m } = from12HourParts(h12, min, per);
    const next = new Date(value);
    next.setHours(hours24, m, 0, 0);
    onChange(next);
    setCustomDraft(null);
    setCustomError(null);
  };

  const bumpHour = (delta: number): void => {
    let h = hour12 + delta;
    let per = period;
    if (h > 12) {
      h = 1;
      per = period === "AM" ? "PM" : "AM";
    } else if (h < 1) {
      h = 12;
      per = period === "AM" ? "PM" : "AM";
    }
    applyParts(h, minute, per);
  };

  const bumpMinute = (delta: number): void => {
    let total = hour12 * 60 + minute + delta;
    let per = period;
    while (total >= 12 * 60) {
      total -= 12 * 60;
      per = per === "AM" ? "PM" : "AM";
    }
    while (total < 0) {
      total += 12 * 60;
      per = per === "AM" ? "PM" : "AM";
    }
    const h = Math.floor(total / 60) || 12;
    const m = total % 60;
    const h12 = h === 0 ? 12 : h;
    applyParts(h12, m, per);
  };

  const applyCustom = (): void => {
    const parsed = parseCustomTime(customValue);
    if (!parsed) {
      setCustomError(labels.customTimeInvalid);
      return;
    }
    const next = new Date(value);
    next.setHours(parsed.hours24, parsed.minute, 0, 0);
    onChange(next);
    setCustomDraft(null);
    setCustomError(null);
  };

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-start justify-center gap-2 pt-0.5">
        <Stepper
          label={labels.hour}
          display={String(hour12)}
          onInc={() => bumpHour(1)}
          onDec={() => bumpHour(-1)}
        />
        <div className="pt-10 text-xl font-bold text-secondary/70">:</div>
        <Stepper
          label={labels.minute}
          display={minute.toString().padStart(2, "0")}
          onInc={() => bumpMinute(5)}
          onDec={() => bumpMinute(-5)}
        />
        <div className="ml-1 flex flex-col gap-1.5 self-center rounded-xl border border-outline-variant/25 bg-surface-container-high p-1">
          {(["AM", "PM"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => applyParts(hour12, minute, p)}
              className={[
                "min-w-[2.9rem] rounded-lg px-2.5 py-2 text-xs font-bold transition-colors",
                period === p
                  ? "bg-secondary text-on-secondary shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
              ].join(" ")}
            >
              {p === "AM" ? labels.am : labels.pm}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto rounded-lg border border-outline-variant/20 bg-surface-container-high/60 p-2.5">
        <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-secondary">
          {labels.customTime}
        </label>
        <input
          type="text"
          value={customValue}
          placeholder={labels.customTimePlaceholder}
          onChange={(e) => {
            setCustomDraft(e.target.value);
            setCustomError(null);
          }}
          onBlur={() => {
            applyCustom();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              applyCustom();
            }
          }}
          className="mt-1.5 w-full rounded-lg border border-outline-variant/30 bg-surface-container px-3 py-2 text-sm font-medium text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/60 focus:border-secondary"
        />
        {customError ? (
          <p className="mt-2 text-xs font-medium text-error" role="alert">
            {customError}
          </p>
        ) : null}
      </div>
    </div>
  );
}
