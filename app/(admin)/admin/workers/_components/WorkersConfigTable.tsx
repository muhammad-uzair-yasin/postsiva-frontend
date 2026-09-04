"use client";

import { useState } from "react";
import {
  Check,
  FileText,
  History,
  Loader2,
  Play,
  X,
} from "lucide-react";

import {
  formatDateTime,
  formatIntervalMinutes,
  INTERVAL_PRESETS,
  parseIntervalMinutes,
  summarizeRunResult,
  truncateText,
  type WorkerEntry,
} from "@/lib/admin/workersApi";

interface WorkersConfigTableProps {
  workers: WorkerEntry[];
  loading: boolean;
  savingWorkerIds: ReadonlySet<string>;
  runningWorkerIds: ReadonlySet<string>;
  onToggle: (workerId: string, enabled: boolean) => void;
  onSaveInterval: (workerId: string, intervalMinutes: number) => void;
  onRunNow: (workerId: string) => void;
  onViewHistory: (workerId: string) => void;
}

function statusBadgeClass(status: string | null): string {
  const s = (status ?? "").toUpperCase();
  if (s === "SUCCESS") return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
  if (s === "FAILED") return "bg-error/15 text-error";
  if (s === "RUNNING") return "bg-primary/15 text-primary";
  if (s === "SKIPPED") return "bg-surface-container-highest text-on-surface-variant";
  return "bg-surface-container-highest text-on-surface-variant";
}

function EnabledToggle({
  enabled,
  disabled,
  onChange,
}: {
  enabled: boolean;
  disabled: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      onClick={() => onChange(!enabled)}
      className={[
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50",
        enabled ? "bg-primary" : "bg-surface-container-highest",
      ].join(" ")}
    >
      <span
        className={[
          "inline-block h-4.5 w-4.5 transform rounded-full bg-surface transition-transform",
          enabled ? "translate-x-[1.375rem]" : "translate-x-1",
        ].join(" ")}
      />
    </button>
  );
}

function IntervalEditor({
  worker,
  saving,
  onSave,
}: {
  worker: WorkerEntry;
  saving: boolean;
  onSave: (minutes: number) => void;
}) {
  const [draft, setDraft] = useState(String(worker.interval_minutes));
  const parsed = parseIntervalMinutes(draft);
  const dirty = parsed !== worker.interval_minutes;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          min={1}
          value={draft}
          disabled={saving}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && parsed !== null && dirty) onSave(parsed);
          }}
          aria-label={`Interval in minutes for ${worker.name}`}
          className="w-16 rounded-lg border border-outline-variant/25 bg-surface px-2 py-1 text-sm text-on-surface focus:border-primary focus:outline-none disabled:opacity-50"
        />
        <span className="text-xs text-on-surface-variant">
          min ({formatIntervalMinutes(worker.interval_minutes)})
        </span>
        {dirty ? (
          <button
            type="button"
            disabled={parsed === null || saving}
            onClick={() => parsed !== null && onSave(parsed)}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-on-primary disabled:opacity-40"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-1">
        {INTERVAL_PRESETS.map((preset) => (
          <button
            key={preset.minutes}
            type="button"
            disabled={saving}
            onClick={() => {
              setDraft(String(preset.minutes));
              onSave(preset.minutes);
            }}
            className={[
              "rounded-md px-1.5 py-0.5 text-[10px] font-semibold transition",
              worker.interval_minutes === preset.minutes
                ? "bg-primary/15 text-primary"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high",
            ].join(" ")}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function LastRunModal({
  worker,
  onClose,
}: {
  worker: WorkerEntry;
  onClose: () => void;
}) {
  const result =
    worker.last_run_result === null || worker.last_run_result === undefined
      ? "—"
      : typeof worker.last_run_result === "object"
        ? JSON.stringify(worker.last_run_result, null, 2)
        : String(worker.last_run_result);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="flex max-h-[80vh] w-full max-w-2xl flex-col rounded-2xl border border-outline-variant/20 bg-surface-container-low"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-outline-variant/20 px-5 py-4">
          <h4 className="text-sm font-bold text-on-surface">{worker.name} — last run</h4>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 hover:bg-surface-container-high">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 text-sm">
          <p className="text-xs font-semibold text-on-surface-variant">Last run</p>
          <p className="mb-3 mt-0.5">{formatDateTime(worker.last_run_at)}</p>
          <p className="text-xs font-semibold text-on-surface-variant">Status</p>
          <p className="mb-3 mt-0.5">{worker.last_status ?? "—"}</p>
          <p className="text-xs font-semibold text-on-surface-variant">Result</p>
          <pre className="mb-3 mt-1 whitespace-pre-wrap rounded-xl bg-surface-container-high p-3 font-mono text-xs">
            {result}
          </pre>
          <p className="text-xs font-semibold text-on-surface-variant">Error</p>
          <pre className="mt-1 whitespace-pre-wrap rounded-xl bg-error-container/20 p-3 font-mono text-xs text-on-error-container">
            {worker.last_run_error || "—"}
          </pre>
        </div>
      </div>
    </div>
  );
}

export function WorkersConfigTable({
  workers,
  loading,
  savingWorkerIds,
  runningWorkerIds,
  onToggle,
  onSaveInterval,
  onRunNow,
  onViewHistory,
}: WorkersConfigTableProps) {
  const [logWorkerId, setLogWorkerId] = useState<string | null>(null);
  const logWorker = workers.find((w) => w.id === logWorkerId) ?? null;

  return (
    <section className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-5">
      <h3 className="text-sm font-bold text-on-surface">All workers — control &amp; tune</h3>
      <p className="mt-0.5 text-xs text-on-surface-variant">
        Enable/disable, set interval (presets or custom minutes), run manually, or jump to
        full history.
      </p>
      <div className="mt-4 overflow-x-auto">
        {loading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-on-surface-variant">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading workers…
          </div>
        ) : workers.length === 0 ? (
          <p className="py-8 text-sm text-on-surface-variant">No workers in database.</p>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-outline-variant/20 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                <th className="px-3 py-2">Job</th>
                <th className="px-3 py-2">On</th>
                <th className="px-3 py-2">Interval</th>
                <th className="px-3 py-2">Last status</th>
                <th className="px-3 py-2">Last run</th>
                <th className="px-3 py-2">Summary</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {workers.map((worker) => {
                const saving = savingWorkerIds.has(worker.id);
                const running = runningWorkerIds.has(worker.id);
                const busy = saving || running;
                return (
                  <tr key={worker.id} className="border-b border-outline-variant/10 align-top hover:bg-surface-container">
                    <td className="px-3 py-3">
                      <div className="font-semibold text-on-surface">{worker.name}</div>
                      <div className="mt-0.5 font-mono text-[10px] text-on-surface-variant">{worker.id}</div>
                      <div className="mt-0.5 max-w-xs text-xs text-on-surface-variant">
                        {truncateText(worker.description, 100) || "—"}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <EnabledToggle
                        enabled={worker.enabled}
                        disabled={busy}
                        onChange={(next) => onToggle(worker.id, next)}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <IntervalEditor
                        key={`${worker.id}:${worker.interval_minutes}`}
                        worker={worker}
                        saving={saving}
                        onSave={(m) => onSaveInterval(worker.id, m)}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={[
                          "inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase",
                          statusBadgeClass(worker.last_status),
                        ].join(" ")}
                      >
                        {worker.last_status ?? "—"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-on-surface-variant whitespace-nowrap">
                      {formatDateTime(worker.last_run_at)}
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-on-surface-variant">
                      {summarizeRunResult(worker.last_run_result)}
                      {worker.last_run_error ? (
                        <p className="mt-1 text-error">{truncateText(worker.last_run_error, 60)}</p>
                      ) : null}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-col gap-1.5">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => {
                            if (confirm(`Run "${worker.name}" now?`)) onRunNow(worker.id);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-on-primary disabled:opacity-50"
                        >
                          {running ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Play className="h-3.5 w-3.5" />
                          )}
                          Run now
                        </button>
                        <button
                          type="button"
                          onClick={() => onViewHistory(worker.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-outline-variant/25 px-2.5 py-1.5 text-xs font-semibold hover:bg-surface-container-high"
                        >
                          <History className="h-3.5 w-3.5" />
                          History
                        </button>
                        <button
                          type="button"
                          onClick={() => setLogWorkerId(worker.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-outline-variant/25 px-2.5 py-1.5 text-xs font-semibold hover:bg-surface-container-high"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          Last run
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      {logWorker ? <LastRunModal worker={logWorker} onClose={() => setLogWorkerId(null)} /> : null}
    </section>
  );
}
