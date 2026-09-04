"use client";

import { Mail } from "lucide-react";

import {
  atRiskLabel,
  billingSourceLabel,
  formatAdminDate,
  paidUserDisplayName,
  type PaidUserRow,
} from "@/lib/admin/paidUsersApi";

function SourceBadge({ source }: { source: string }) {
  const styles: Record<string, string> = {
    admin: "bg-amber-500/15 text-amber-800 dark:text-amber-200",
    paddle: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200",
    referral: "bg-violet-500/15 text-violet-800 dark:text-violet-200",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${styles[source] ?? "bg-surface-container-high text-on-surface-variant"}`}
    >
      {billingSourceLabel(source)}
    </span>
  );
}

export function PaidUsersTable({
  rows,
  selectedId,
  onSelect,
  onEmail,
}: {
  rows: PaidUserRow[];
  selectedId: string | null;
  onSelect: (row: PaidUserRow) => void;
  onEmail: (row: PaidUserRow) => void;
}) {
  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-8 text-center text-sm text-on-surface-variant">
        No paid users match this filter.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-outline-variant/20 bg-surface-container-low">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-outline-variant/15 bg-surface-container">
          <tr>
            <th className="px-4 py-3 font-semibold text-on-surface-variant">User</th>
            <th className="px-4 py-3 font-semibold text-on-surface-variant">Plan</th>
            <th className="px-4 py-3 font-semibold text-on-surface-variant">Source</th>
            <th className="px-4 py-3 font-semibold text-on-surface-variant">Status</th>
            <th className="px-4 py-3 font-semibold text-on-surface-variant">Renewal</th>
            <th className="px-4 py-3 font-semibold text-on-surface-variant">First paid</th>
            <th className="px-4 py-3 font-semibold text-on-surface-variant">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const active = selectedId === row.user_id;
            return (
              <tr
                key={row.user_id}
                className={`cursor-pointer border-b border-outline-variant/10 last:border-0 ${active ? "bg-primary/5" : "hover:bg-surface-container-high/60"}`}
                onClick={() => onSelect(row)}
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-on-surface">{paidUserDisplayName(row)}</div>
                  <div className="text-xs text-on-surface-variant">{row.email}</div>
                </td>
                <td className="px-4 py-3 capitalize">{row.effective_plan_id}</td>
                <td className="px-4 py-3">
                  <SourceBadge source={row.billing_source} />
                </td>
                <td className="px-4 py-3">
                  <div className="capitalize">{row.billing_status.replace(/_/g, " ")}</div>
                  {row.is_at_risk ? (
                    <div className="mt-0.5 text-xs font-medium text-error">
                      {atRiskLabel(row.at_risk_reason)}
                    </div>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-xs text-on-surface-variant">
                  {formatAdminDate(row.current_period_end)}
                </td>
                <td className="px-4 py-3 text-xs text-on-surface-variant">
                  {formatAdminDate(row.first_paid_at)}
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    title="Send email"
                    className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEmail(row);
                    }}
                  >
                    <Mail className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
