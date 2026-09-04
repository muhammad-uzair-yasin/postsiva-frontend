"use client";

import { Loader2, TriangleAlert } from "lucide-react";

import {
  type AdminOverviewTotals,
  formatPercent,
  formatUsd,
  ratioSeverity,
} from "@/lib/admin/aiUsageAdminApi";

interface FinancialTotalsProps {
  totals: AdminOverviewTotals | null;
  loading: boolean;
}

interface Tile {
  label: string;
  value: string;
  hint?: string;
  alert?: boolean;
}

function buildTiles(totals: AdminOverviewTotals): Tile[] {
  const severity = ratioSeverity(totals.ai_cost_ratio);
  return [
    { label: "Customer paid", value: formatUsd(totals.customer_paid_usd) },
    {
      label: "Paddle net earnings",
      value: formatUsd(totals.net_earnings_usd),
      hint: "After tax and Paddle fees",
    },
    { label: "Paddle fees", value: formatUsd(totals.paddle_fees_usd) },
    { label: "Actual AI cost", value: formatUsd(totals.provider_cost_usd) },
    {
      label: "Allowance consumed",
      value: formatUsd(totals.allowance_consumed_usd),
      hint: "Credits charged at list rate",
    },
    {
      label: "AI cost ratio",
      value: formatPercent(totals.ai_cost_ratio),
      hint: "Share of net earnings",
      alert: severity !== "ok",
    },
    {
      label: "Contribution after AI",
      value: formatUsd(totals.contribution_after_ai_usd),
      hint: "Not total company profit",
      alert: totals.contribution_after_ai_usd < 0,
    },
    {
      label: "Remaining exposure",
      value: formatUsd(totals.remaining_exposure_usd),
      hint: "Unspent customer allowance",
    },
  ];
}

/** KPI row of stat tiles for the financial overview totals. */
export function FinancialTotals({ totals, loading }: FinancialTotalsProps) {
  if (loading && !totals) {
    return (
      <section
        aria-busy
        className="flex h-28 items-center justify-center rounded-2xl border border-outline-variant/15 bg-surface-container-low"
      >
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
      </section>
    );
  }
  if (!totals) return null;

  return (
    <section>
      <h2 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">
        Financial overview
      </h2>
      <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {buildTiles(totals).map((tile) => (
          <div
            key={tile.label}
            className="rounded-2xl border border-outline-variant/15 bg-surface-container-low p-4"
          >
            <p className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant">
              {tile.label}
              {tile.alert ? (
                <TriangleAlert className="h-3.5 w-3.5 shrink-0 text-error" />
              ) : null}
            </p>
            <p className="mt-1.5 text-2xl font-black text-on-surface">
              {tile.value}
            </p>
            {tile.hint ? (
              <p className="mt-0.5 text-[11px] text-on-surface-variant/80">
                {tile.hint}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
