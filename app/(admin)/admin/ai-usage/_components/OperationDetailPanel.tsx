"use client";

import { AlertTriangle, Loader2, X } from "lucide-react";

import {
  type AdminOperationDetail,
  formatCount,
  formatDurationMs,
  formatUsd,
  operationDurationMs,
  usdFromMicros,
} from "@/lib/admin/aiUsageAdminApi";

interface OperationDetailPanelProps {
  operationId: string;
  detail: AdminOperationDetail | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
}

/** Ledger operation and provider-attempt inspector. */
export function OperationDetailPanel(props: OperationDetailPanelProps) {
  const { operationId, detail, loading, error, onClose } = props;
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="h-full w-full max-w-3xl overflow-y-auto bg-surface p-5 shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-outline-variant/20 pb-4">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-on-surface">Operation detail</h2>
            <p className="truncate font-mono text-xs text-on-surface-variant">{operationId}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close operation detail" className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container">
            <X className="h-5 w-5" />
          </button>
        </header>

        {loading ? <Loader2 className="mx-auto mt-16 h-6 w-6 animate-spin text-primary" /> : null}
        {error ? <p className="mt-5 flex gap-2 rounded-xl bg-error-container p-3 text-sm text-on-error-container"><AlertTriangle className="h-4 w-4 shrink-0" />{error}</p> : null}
        {detail ? <OperationContent detail={detail} /> : null}
      </aside>
    </div>
  );
}

function OperationContent({ detail }: { detail: AdminOperationDetail }) {
  const op = detail.operation;
  const facts = [
    ["Type", op.operation_type], ["Status", op.status], ["Channel", op.channel],
    ["Billing", op.billing_mode], ["Credits", formatCount(op.charged_credits)],
    ["Provider cost", formatUsd(usdFromMicros(op.provider_cost_usd_micros))],
    ["Duration", formatDurationMs(operationDurationMs(op.started_at, op.finished_at))],
    ["Attempts", formatCount(op.attempt_count)],
  ];
  return (
    <div className="mt-5 space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {facts.map(([label, value]) => <div key={label} className="rounded-xl bg-surface-container-low p-3"><p className="text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant">{label}</p><p className="mt-1 break-words text-sm font-semibold text-on-surface">{value || "—"}</p></div>)}
      </div>
      <div>
        <h3 className="mb-2 text-sm font-bold text-on-surface">Provider attempts</h3>
        <div className="overflow-x-auto rounded-xl border border-outline-variant/15">
          <table className="min-w-full text-xs">
            <thead className="bg-surface-container-low text-left uppercase tracking-wide text-on-surface-variant"><tr>{["#", "Provider / model", "Status", "Tokens", "Cost", "Latency"].map((h) => <th key={h} className="px-3 py-2 font-semibold">{h}</th>)}</tr></thead>
            <tbody>{detail.attempts.length ? detail.attempts.map((attempt) => <tr key={attempt.id} className="border-t border-outline-variant/10"><td className="px-3 py-2 tabular-nums">{attempt.attempt_index}</td><td className="px-3 py-2"><span className="block font-medium">{attempt.provider}</span><span className="text-on-surface-variant">{attempt.model}</span></td><td className="px-3 py-2">{attempt.status}</td><td className="px-3 py-2 tabular-nums">{formatCount((attempt.input_tokens ?? 0) + (attempt.output_tokens ?? 0) + (attempt.reasoning_tokens ?? 0))}</td><td className="px-3 py-2 tabular-nums">{formatUsd(usdFromMicros(attempt.cost_usd_micros))}</td><td className="px-3 py-2 tabular-nums">{formatDurationMs(attempt.latency_ms)}</td></tr>) : <tr><td colSpan={6} className="p-6 text-center text-on-surface-variant">No provider attempts recorded.</td></tr>}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
