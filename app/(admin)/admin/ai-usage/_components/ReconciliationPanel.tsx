"use client";

import { AlertTriangle, ExternalLink, Loader2, RefreshCw } from "lucide-react";

import { type ReconciliationReport, formatCount, formatPercent } from "@/lib/admin/aiUsageAdminApi";

interface Props {
  report: ReconciliationReport | null;
  loading: boolean;
  error: string | null;
  onReload: () => void;
  onOpenOperation: (operationId: string) => void;
}

/** Legacy-credit versus ledger reconciliation and anomaly drill-down. */
export function ReconciliationPanel({ report, loading, error, onReload, onOpenOperation }: Props) {
  if (loading && !report) return <Loader2 className="mx-auto mt-16 h-6 w-6 animate-spin text-primary" />;
  if (error && !report) return <div className="rounded-xl bg-error-container p-4 text-sm text-on-error-container"><AlertTriangle className="mr-2 inline h-4 w-4" />{error}<button type="button" onClick={onReload} className="ml-3 font-semibold underline">Retry</button></div>;
  if (!report) return null;
  const summary = report.summary;
  const cards = [["Owners", summary.owners], ["Missing ledger", summary.missing_ledger_owners], ["Divergent", summary.materially_divergent_owners], ["Unknown cost", summary.unknown_or_partial_cost_operations], ["Stale reservations", summary.stale_reserved_operations], ["Duplicate keys", summary.duplicate_idempotency_keys]];
  return <section className="space-y-5">
    <div className="flex items-center justify-between"><div><h2 className="text-sm font-bold text-on-surface">Ledger reconciliation</h2><p className="text-xs text-on-surface-variant">Generated {new Date(report.generated_at).toLocaleString()}</p></div><button type="button" onClick={onReload} disabled={loading} className="rounded-lg border border-outline-variant/25 p-2 text-on-surface-variant hover:bg-surface-container disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /></button></div>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">{cards.map(([label, value]) => <div key={label} className="rounded-xl bg-surface-container-low p-3"><p className="text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant">{label}</p><p className="mt-1 text-xl font-bold tabular-nums text-on-surface">{formatCount(Number(value))}</p></div>)}</div>
    <div className="overflow-x-auto rounded-xl border border-outline-variant/15"><table className="min-w-full text-sm"><thead className="bg-surface-container-low text-left text-[11px] uppercase tracking-wide text-on-surface-variant"><tr>{["Owner", "Legacy used", "Ledger charged", "Delta", "Delta %", "Operations", "Flags"].map((h) => <th key={h} className="px-3 py-2 font-semibold">{h}</th>)}</tr></thead><tbody>{report.owners.map((row) => <tr key={row.owner_user_id} className="border-t border-outline-variant/10"><td className="max-w-52 truncate px-3 py-2 font-mono text-xs">{row.owner_user_id}</td><td className="px-3 py-2 tabular-nums">{formatCount(row.legacy_credits_used)}</td><td className="px-3 py-2 tabular-nums">{formatCount(row.ledger_credits_charged)}</td><td className="px-3 py-2 tabular-nums">{formatCount(row.delta_credits)}</td><td className="px-3 py-2 tabular-nums">{formatPercent(row.delta_ratio)}</td><td className="px-3 py-2 tabular-nums">{formatCount(row.operation_count)}</td><td className="px-3 py-2 text-xs text-error">{[row.missing_ledger && "Missing", row.materially_divergent && "Divergent"].filter(Boolean).join(", ") || "—"}</td></tr>)}</tbody></table></div>
    <AnomalyOperations title="Unknown or partial cost" ids={report.unknown_or_partial_operation_ids} onOpen={onOpenOperation} />
    <AnomalyOperations title="Stale reserved operations" ids={report.stale_reserved_operation_ids} onOpen={onOpenOperation} />
  </section>;
}

function AnomalyOperations({ title, ids, onOpen }: { title: string; ids: string[]; onOpen: (id: string) => void }) {
  if (!ids.length) return null;
  return <div className="rounded-xl bg-surface-container-low p-4"><h3 className="text-sm font-bold text-on-surface">{title}</h3><div className="mt-2 flex flex-wrap gap-2">{ids.map((id) => <button key={id} type="button" onClick={() => onOpen(id)} className="inline-flex max-w-full items-center gap-1 rounded-lg bg-surface-container-high px-2 py-1 font-mono text-xs text-primary hover:underline"><span className="truncate">{id}</span><ExternalLink className="h-3 w-3 shrink-0" /></button>)}</div></div>;
}
