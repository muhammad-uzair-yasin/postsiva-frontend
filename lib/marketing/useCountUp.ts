"use client";

import { useEffect, useState } from "react";

/** Ease-out cubic count from 0 → target. */
export function useCountUp(
  target: number | null,
  options?: { durationMs?: number; delayMs?: number; enabled?: boolean },
): number {
  const durationMs = options?.durationMs ?? 1400;
  const delayMs = options?.delayMs ?? 0;
  const enabled = options?.enabled ?? true;
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!enabled || target == null || target <= 0) {
      setValue(0);
      return;
    }

    if (durationMs <= 0) {
      setValue(target);
      return;
    }

    let raf = 0;
    let startTs: number | null = null;

    const timeout = window.setTimeout(() => {
      const tick = (ts: number): void => {
        if (startTs == null) startTs = ts;
        const progress = Math.min(1, (ts - startTs) / durationMs);
        const eased = 1 - (1 - progress) ** 3;
        setValue(Math.round(target * eased));
        if (progress < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, delayMs);

    return () => {
      window.clearTimeout(timeout);
      cancelAnimationFrame(raf);
    };
  }, [target, durationMs, delayMs, enabled]);

  return value;
}
