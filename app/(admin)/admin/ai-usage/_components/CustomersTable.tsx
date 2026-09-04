"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Loader2, Search } from "lucide-react";

import {
  type AdminCustomerRow,
  clampPercent,
  filterCustomers,
  formatCount,
  formatPercent,
  formatUsd,
  ratioSeverity,
  sortCustomersByCost,
} from "@/lib/admin/aiUsageAdminApi";
import { CustomerDrilldown } from "./CustomerDrilldown";

interface CustomersTableProps {
  customers: AdminCustomerRow[];
  loading: boolean;
  onOpenOperation: (operationId: string) => void;
}

/** Single-ratio meter: severity fill on a lighter same-ramp track, value text beside it. */
function RatioMeter({ ratio }: { ratio: number }) {
  const severity = ratioSeverity(ratio);
  const width = clampPercent(ratio);
  const fillClass = severity === "critical" ? "fill-error" : "fill-primary";
  const trackClass = severity === "critical" ? "fill-error/20" : "fill-primary/15";
  return (
    <span className="inline-flex items-center justify-end gap-2">
      <svg
        width="56"
        height="6"
        viewBox="0 0 56 6"
        aria-hidden
        className="shrink-0"
      >
        <rect x="0" y="0" width="56" height="6" rx="3" className={trackClass} />
        {width > 0 ? (
          <rect
            x="0"
            y="0"
            width={Math.max(6, (width / 100) * 56)}
            height="6"
            rx="3"
            className={fillClass}
          />
        ) : null}
      </svg>
      <span className="tabular-nums">{formatPercent(ratio)}</span>
    </span>
  );
}

const HEADERS = [
  { label: "Customer", align: "text-left" },
  { label: "Plan", align: "text-left" },
  { label: "Credits", align: "text-right" },
  { label: "Paid", align: "text-right" },
  { label: "Net earnings", align: "text-right" },
  { label: "AI cost", align: "text-right" },
  { label: "AI cost %", align: "text-right" },
  { label: "After AI", align: "text-right" },
];

/** Per-customer revenue vs AI cost comparison with expandable drill-down. */
export function CustomersTable({
  customers,
  loading,
  onOpenOperation,
}: CustomersTableProps) {
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const rows = useMemo(
    () => filterCustomers(sortCustomersByCost(customers), query),
    [customers, query],
  );

  return (
    <section className="rounded-2xl border border-outline-variant/15 bg-surface-container-low">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/15 p-4">
        <div>
          <h2 className="text-sm font-bold text-on-surface">Customer comparison</h2>
          <p className="text-xs text-on-surface-variant">
            Paddle earnings compared with measured AI provider cost — click a row for
            detail
          </p>
        </div>
        <label className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-on-surface-variant" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter by email, plan or user id"
            className="w-64 rounded-lg border border-outline-variant/25 bg-surface-container py-1.5 pl-8 pr-3 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-on-surface-variant">
              {HEADERS.map((h) => (
                <th key={h.label} className={`px-4 py-2.5 font-semibold ${h.align}`}>
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && customers.length === 0 ? (
              <tr>
                <td colSpan={HEADERS.length} className="p-8 text-center">
                  <Loader2 className="mx-auto h-4 w-4 animate-spin text-primary" />
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={HEADERS.length}
                  className="p-8 text-center text-sm text-on-surface-variant"
                >
                  {customers.length === 0
                    ? "No customer AI activity recorded yet."
                    : "No customers match this filter."}
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const expanded = expandedId === row.owner_user_id;
                const creditsTotal = row.credits_charged + row.credits_remaining;
                return (
                  <CustomerRowGroup
                    key={row.owner_user_id}
                    row={row}
                    expanded={expanded}
                    creditsTotal={creditsTotal}
                    onToggle={() =>
                      setExpandedId(expanded ? null : row.owner_user_id)
                    }
                    onOpenOperation={onOpenOperation}
                  />
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function CustomerRowGroup({
  row,
  expanded,
  creditsTotal,
  onToggle,
  onOpenOperation,
}: {
  row: AdminCustomerRow;
  expanded: boolean;
  creditsTotal: number;
  onToggle: () => void;
  onOpenOperation: (operationId: string) => void;
}) {
  const Chevron = expanded ? ChevronDown : ChevronRight;
  return (
    <>
      <tr
        onClick={onToggle}
        className="cursor-pointer border-t border-outline-variant/10 transition-colors hover:bg-surface-container"
      >
        <td className="px-4 py-3">
          <span className="flex items-center gap-2">
            <Chevron className="h-3.5 w-3.5 shrink-0 text-on-surface-variant" />
            <span className="min-w-0">
              <span className="block truncate font-medium text-on-surface">
                {row.email || row.owner_user_id}
              </span>
              <span className="block truncate text-[11px] text-on-surface-variant/70">
                {row.owner_user_id}
              </span>
            </span>
          </span>
        </td>
        <td className="px-4 py-3 capitalize text-on-surface-variant">
          {row.plan_id || "—"}
        </td>
        <td className="px-4 py-3 text-right tabular-nums text-on-surface-variant">
          {formatCount(row.credits_charged)} / {formatCount(creditsTotal)}
        </td>
        <td className="px-4 py-3 text-right tabular-nums">
          {formatUsd(row.customer_paid_usd)}
        </td>
        <td className="px-4 py-3 text-right tabular-nums">
          {formatUsd(row.net_earnings_usd)}
        </td>
        <td className="px-4 py-3 text-right font-semibold tabular-nums">
          {formatUsd(row.provider_cost_usd)}
        </td>
        <td className="px-4 py-3 text-right tabular-nums">
          <RatioMeter ratio={row.ai_cost_ratio} />
        </td>
        <td className="px-4 py-3 text-right font-semibold tabular-nums">
          {formatUsd(row.contribution_after_ai_usd)}
        </td>
      </tr>
      {expanded ? (
        <tr className="border-t border-outline-variant/10 bg-surface-container/50">
          <td colSpan={HEADERS.length} className="px-4 py-4">
            <CustomerDrilldown row={row} onOpenOperation={onOpenOperation} />
          </td>
        </tr>
      ) : null}
    </>
  );
}
