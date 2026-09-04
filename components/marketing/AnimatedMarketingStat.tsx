"use client";

import { useReducedMotion } from "framer-motion";

import { formatMarketingStat } from "@/lib/marketing/platformStatsApi";
import { useCountUp } from "@/lib/marketing/useCountUp";

type AnimatedMarketingStatProps = {
  readonly target: number | null;
  readonly delayMs?: number;
  readonly placeholder?: string;
  readonly showPlus?: boolean;
};

function withPlusSuffix(value: string): string {
  return value.endsWith("+") ? value : `${value}+`;
}

export function AnimatedMarketingStat({
  target,
  delayMs = 0,
  placeholder = "—",
  showPlus = false,
}: AnimatedMarketingStatProps): React.ReactElement {
  const reduceMotion = useReducedMotion();
  const animated = useCountUp(target, {
    durationMs: reduceMotion ? 0 : 1600,
    delayMs: reduceMotion ? 0 : delayMs,
    enabled: target != null,
  });

  if (target == null) {
    return <>{placeholder}</>;
  }

  const display = reduceMotion ? target : animated;
  const formatted = formatMarketingStat(display);
  return <>{showPlus ? withPlusSuffix(formatted) : formatted}</>;
}
