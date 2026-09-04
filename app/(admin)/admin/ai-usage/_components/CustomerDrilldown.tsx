"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";

import {
  type AdminCustomerRow,
  formatCount,
  formatUsd,
} from "@/lib/admin/aiUsageAdminApi";

interface CustomerDrilldownProps {
  row: AdminCustomerRow;
  onOpenOperation: (operationId: string) => void;
}

/** Expanded customer financial detail plus direct ledger-operation lookup. */
export function CustomerDrilldown({ row, onOpenOperation }: CustomerDrilldownProps) {
  const [operationId, setOperationId] = useState("");
  const metrics = [
    ["Credits charged", formatCount(row.credits_charged)],
    ["Credits remaining", formatCount(row.credits_remaining)],
    ["Allowance consumed", formatUsd(row.allowance_consumed_usd)],
    ["Paddle net", formatUsd(row.paddle_net_earnings_usd)],
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {metrics.map(([label, value]) => (
          <div key={label} className="rounded-xl bg-surface-container-high p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-on-surface-variant">
              {label}
            </p>
            <p className="mt-1 font-semibold tabular-nums text-on-surface">{value}</p>
          </div>
        ))}
      </div>
      <form
        className="flex items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const id = operationId.trim();
          if (id) onOpenOperation(id);
        }}
      >
        <label className="min-w-0 flex-1 text-xs font-semibold text-on-surface-variant">
          Inspect ledger operation
          <input
            value={operationId}
            onChange={(event) => setOperationId(event.target.value)}
            placeholder="Operation UUID"
            className="mt-1 w-full rounded-lg border border-outline-variant/25 bg-surface-container-low px-3 py-2 text-sm font-normal text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </label>
        <button
          type="submit"
          disabled={!operationId.trim()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-on-primary disabled:opacity-50"
        >
          <ExternalLink className="h-3.5 w-3.5" /> Open
        </button>
      </form>
    </div>
  );
}
