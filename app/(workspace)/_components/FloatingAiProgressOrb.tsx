"use client";

import { useEffect, useState, type ReactElement } from "react";
import { createPortal } from "react-dom";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

const R = 15;
const C = 2 * Math.PI * R;

/** Large, high-contrast floating pill so the ring stays readable on any inbox/scheduler background. */
const orbShellClassName =
  "relative flex h-36 w-36 shrink-0 items-center justify-center rounded-full border border-outline-variant/25 bg-surface/95 p-3 shadow-[0_16px_48px_-8px_rgba(0,0,0,0.45)] ring-2 ring-primary/35 backdrop-blur-md sm:h-40 sm:w-40";

const svgFrameClassName = "pointer-events-none absolute inset-3";

const orbFixedPositionClassName =
  "pointer-events-none fixed right-3 top-3 z-[400] flex flex-col items-center gap-3 sm:right-5 sm:top-5";

export type FloatingAiProgressOrbLabel = "generating" | "posting";

export interface FloatingAiDeterminateProgress {
  readonly total: number;
  readonly completed: number;
}

export interface FloatingAiProgressOrbProps {
  readonly determinate: FloatingAiDeterminateProgress | null;
  readonly indeterminate: boolean;
  readonly label: FloatingAiProgressOrbLabel;
  readonly labelTextOverride?: string | null;
}

/** Fixed top-right orb: same layout as post-scheduler multi-channel generate (ring + count + label). */
export function FloatingAiProgressOrb({
  determinate,
  indeterminate,
  label,
  labelTextOverride,
}: FloatingAiProgressOrbProps): ReactElement | null {
  const { t } = useTranslations();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Client-only portal: match server render (null) then mount to document.body.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe portal gate
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const labelText =
    labelTextOverride?.trim() ||
    (label === "posting"
      ? t("postScheduler.publish.posting")
      : t("postScheduler.preview.generating"));

  const showDeterminate =
    determinate != null &&
    determinate.total >= 1 &&
    determinate.completed < determinate.total;

  if (!showDeterminate && !indeterminate) {
    return null;
  }

  if (showDeterminate && determinate) {
    const { total, completed } = determinate;
    const safeTotal = Math.max(1, total);
    const pct = Math.min(1, Math.max(0, completed / safeTotal));
    const offset = C * (1 - pct);
    const remaining = Math.max(0, total - completed);

    return createPortal(
      <div
        className={orbFixedPositionClassName}
        aria-live="polite"
        aria-busy={remaining > 0}
        aria-label={`${labelText}: ${remaining} of ${total} remaining`}
      >
        <div className={orbShellClassName}>
          <svg
            className={`${svgFrameClassName} -rotate-90 text-primary select-none`}
            viewBox="0 0 36 36"
            aria-hidden
          >
            <circle
              cx="18"
              cy="18"
              r={R}
              fill="none"
              className="stroke-outline-variant/55"
              strokeWidth="5"
            />
            <circle
              cx="18"
              cy="18"
              r={R}
              fill="none"
              className="stroke-primary transition-[stroke-dashoffset] duration-300 ease-out"
              strokeWidth="5"
              strokeDasharray={C}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          </svg>
          <span className="relative z-[1] font-headline text-4xl font-bold tabular-nums text-on-surface drop-shadow-sm sm:text-5xl">
            {remaining}
          </span>
        </div>
        <span className="max-w-[10rem] text-center font-body text-sm font-bold uppercase tracking-wider text-on-surface drop-shadow-sm sm:text-base">
          {labelText}
        </span>
      </div>,
      document.body,
    );
  }

  return createPortal(
    <div
      className={orbFixedPositionClassName}
      aria-live="polite"
      aria-busy
      aria-label={labelText}
    >
      <div className={orbShellClassName}>
        <svg
          className={`${svgFrameClassName} animate-spin text-primary [animation-duration:1.05s]`}
          viewBox="0 0 36 36"
          aria-hidden
        >
          <circle
            cx="18"
            cy="18"
            r={R}
            fill="none"
            className="stroke-outline-variant/55"
            strokeWidth="5"
          />
          <circle
            cx="18"
            cy="18"
            r={R}
            fill="none"
            className="stroke-primary"
            strokeWidth="5"
            strokeDasharray={`${C * 0.28} ${C}`}
            strokeLinecap="round"
          />
        </svg>
      </div>
      <span className="max-w-[10rem] text-center font-body text-sm font-bold uppercase tracking-wider text-on-surface drop-shadow-sm sm:text-base">
        {labelText}
      </span>
    </div>,
    document.body,
  );
}
