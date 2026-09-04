"use client";

import type { ReactElement, ReactNode } from "react";

export function AiUsageStatCard(props: {
  icon: ReactNode;
  label: string;
  value: number;
  hint: string;
}): ReactElement {
  return (
    <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-high/40 p-4 ring-1 ring-outline-variant/5">
      <div className="mb-3 flex items-center gap-2 text-primary">
        {props.icon}
        <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
          {props.label}
        </span>
      </div>
      <p className="mt-1 font-headline text-3xl font-extrabold tabular-nums text-on-surface">
        {props.value.toLocaleString()}
      </p>
      <p className="mt-2 text-xs leading-snug text-on-surface-variant">
        {props.hint}
      </p>
    </div>
  );
}
