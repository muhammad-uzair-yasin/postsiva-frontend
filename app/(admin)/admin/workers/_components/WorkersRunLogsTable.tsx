"use client";

import {
  describeWorkerRunLog,
  formatDateTime,
  truncateText,
  type WorkerEntry,
  type WorkerRunLog,
} from "@/lib/admin/workersApi";
import { Loader2, X } from "lucide-react";
import { useState } from "react";

interface WorkersRunLogsTableProps {
  workers: WorkerEntry[];
  logs: WorkerRunLog[];
  total: number;
  hasMore: boolean;
  loading: boolean;
  loadingMore: boolean;
  workerFilter: string;
  statusFilter: string;
  onWorkerFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onLoadMore: () => void;
}

function workerLabel(workers: WorkerEntry[], workerId: string): string {
  const w = workers.find((x) => x.id === workerId);
  return w?.name || workerId;
}

function statusTone(status: string): string {
  const s = status.toUpperCase();
  if (s === "SUCCESS") return "text-emerald-600";
  if (s === "FAILED") return "text-error";
  if (s === "RUNNING") return "text-primary";
  return "text-on-surface-variant";
}

function LogDetailModal({
  log,
  workers,
  onClose,
}: {
  log: WorkerRunLog;
  workers: WorkerEntry[];
  onClose: () => void;
}) {
  const narrative = describeWorkerRunLog(log);
  const json =
    log.result_json === null ? "—" : JSON.stringify(log.result_json, null, 2);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border bg-surface-container-low"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h4 className="text-sm font-bold">{workerLabel(workers, log.worker_id)}</h4>
            <p className="text-xs font-mono text-on-surface-variant">{log.worker_id} · {log.status}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 hover:bg-surface-container-high">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4 text-sm space-y-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <p><span className="font-semibold">Started:</span> {formatDateTime(log.started_at)}</p>
            <p><span className="font-semibold">Finished:</span> {formatDateTime(log.finished_at)}</p>
            <p><span className="font-semibold">Duration:</span> {log.duration_seconds ?? "—"}s</p>
            <p><span className="font-semibold">Trigger:</span> {log.triggered_by}</p>
            <p><span className="font-semibold">Instance:</span> {log.instance_id ?? "—"}</p>
            <p><span className="font-semibold">Run id:</span> <span className="font-mono text-xs">{log.run_id}</span></p>
          </div>
          <div className="rounded-xl bg-surface-container-high p-4">
            <p className="text-xs font-bold uppercase text-on-surface-variant">What happened</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {narrative.lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-on-surface-variant">Full result JSON</p>
            <pre className="mt-2 whitespace-pre-wrap rounded-xl bg-surface-container-high p-3 font-mono text-xs">{json}</pre>
          </div>
          {log.error_message ? (
            <pre className="whitespace-pre-wrap rounded-xl bg-error-container/20 p-3 font-mono text-xs text-error">
              {log.error_message}
            </pre>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function WorkersRunLogsTable({
  workers,
  logs,
  total,
  hasMore,
  loading,
  loadingMore,
  workerFilter,
  statusFilter,
  onWorkerFilterChange,
  onStatusFilterChange,
  onLoadMore,
}: WorkersRunLogsTableProps) {
  const [detailLog, setDetailLog] = useState<WorkerRunLog | null>(null);

  return (
    <section className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-on-surface">Run history — complete logs</h3>
          <p className="mt-0.5 text-xs text-on-surface-variant">
            Each row shows which job ran, what it did, and the outcome. Click a row for full detail + JSON.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={workerFilter}
            onChange={(e) => onWorkerFilterChange(e.target.value)}
            className="rounded-xl border border-outline-variant/25 bg-surface px-3 py-1.5 text-xs"
          >
            <option value="">All jobs ({workers.length})</option>
            {workers.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="rounded-xl border border-outline-variant/25 bg-surface px-3 py-1.5 text-xs"
          >
            <option value="">All statuses</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="FAILED">FAILED</option>
            <option value="SKIPPED">SKIPPED</option>
            <option value="RUNNING">RUNNING</option>
          </select>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        {loading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-on-surface-variant">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading run logs…
          </div>
        ) : logs.length === 0 ? (
          <p className="py-8 text-sm text-on-surface-variant">No run logs yet.</p>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                <th className="px-3 py-2">Started</th>
                <th className="px-3 py-2">Job</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Duration</th>
                <th className="px-3 py-2">What happened</th>
                <th className="px-3 py-2">Error</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const narrative = describeWorkerRunLog(log);
                return (
                  <tr
                    key={log.id}
                    className="cursor-pointer border-b align-top hover:bg-surface-container"
                    onClick={() => setDetailLog(log)}
                  >
                    <td className="px-3 py-3 whitespace-nowrap text-on-surface-variant">
                      {formatDateTime(log.started_at)}
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-medium">{workerLabel(workers, log.worker_id)}</p>
                      <p className="font-mono text-xs text-on-surface-variant">{log.worker_id}</p>
                    </td>
                    <td className={`px-3 py-3 text-xs font-bold ${statusTone(log.status)}`}>{log.status}</td>
                    <td className="px-3 py-3 text-on-surface-variant">
                      {log.duration_seconds != null ? `${log.duration_seconds}s` : "—"}
                    </td>
                    <td className="px-3 py-3 text-xs">
                      <p className="font-medium">{narrative.headline}</p>
                      {narrative.lines.length > 1 ? (
                        <p className="mt-0.5 text-on-surface-variant">
                          {truncateText(narrative.lines.slice(1).join(" "), 120)}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-3 py-3 text-xs text-error">
                      {log.error_message ? truncateText(log.error_message, 80) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <p className="mt-3 text-xs text-on-surface-variant">
        Showing {logs.length} of {total} runs
      </p>

      {hasMore ? (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            disabled={loadingMore}
            onClick={onLoadMore}
            className="rounded-xl border px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      ) : null}

      {detailLog ? (
        <LogDetailModal log={detailLog} workers={workers} onClose={() => setDetailLog(null)} />
      ) : null}
    </section>
  );
}
