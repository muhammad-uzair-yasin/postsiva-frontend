"use client";

import type { SignupPeriodFilter } from "@/lib/admin/usersApi";

const PERIODS: { id: SignupPeriodFilter; label: string; hint: string }[] = [
  { id: "all", label: "All users", hint: "Everyone" },
  { id: "latest", label: "Latest", hint: "Newest signups first" },
  { id: "week", label: "Last week", hint: "Created in 7 days" },
  { id: "month", label: "Last month", hint: "Created in 30 days" },
];

export function UsersPeriodFilter({
  value,
  onChange,
  counts,
}: {
  value: SignupPeriodFilter;
  onChange: (next: SignupPeriodFilter) => void;
  counts: Record<SignupPeriodFilter, number>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {PERIODS.map((p) => {
        const active = value === p.id;
        return (
          <button
            key={p.id}
            type="button"
            title={p.hint}
            onClick={() => onChange(p.id)}
            className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition-colors ${
              active
                ? "border-primary bg-primary/10 text-primary"
                : "border-outline-variant/25 bg-surface-container text-on-surface hover:bg-surface-container-high"
            }`}
          >
            {p.label}
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] tabular-nums ${
                active
                  ? "bg-primary/15 text-primary"
                  : "bg-surface-container-high text-on-surface-variant"
              }`}
            >
              {counts[p.id] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}
