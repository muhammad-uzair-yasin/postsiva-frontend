"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Filter,
  LineChart,
  Play,
  RefreshCw,
  Save,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import {
  fetchInsightsLogs,
  fetchInsightsSettings,
  triggerInsightsSnapshotRun,
  updateInsightsSettings,
  type InsightsCronSettings,
  type InsightsExecutionLog,
  type InsightsRunNowResult,
} from "@/lib/admin/insightsWorkerApi";

export function InsightsWorkerScreen({ embedded = false }: { embedded?: boolean }) {
  const [settings, setSettings] = useState<InsightsCronSettings | null>(null);
  const [logs, setLogs] = useState<InsightsExecutionLog[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters
  const [platformFilter, setPlatformFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Form State
  const [isEnabled, setIsEnabled] = useState(true);
  const [lookbackLimit, setLookbackLimit] = useState(25);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, l] = await Promise.all([
        fetchInsightsSettings(),
        fetchInsightsLogs({ platform: platformFilter, status: statusFilter, limit: 50 }),
      ]);
      setSettings(s);
      setIsEnabled(s.is_enabled);
      setLookbackLimit(s.post_lookback_limit);

      setLogs(l.logs || []);
      setTotalLogs(l.total || 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load insights worker data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [platformFilter, statusFilter]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const updated = await updateInsightsSettings({
        is_enabled: isEnabled,
        post_lookback_limit: lookbackLimit,
      });
      setSettings(updated);
      setSuccessMsg("Worker configuration saved successfully!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleRunNow = async () => {
    if (!confirm("Run Insights Daily Snapshot background job manually now?")) return;
    setRunning(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res: InsightsRunNowResult = await triggerInsightsSnapshotRun();
      setSuccessMsg(
        `Job completed! Processed ${res.total_workspaces_processed} workspaces and saved ${res.total_records_saved} snapshot records in ${res.duration_seconds}s.`,
      );
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Manual snapshot run failed");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className={embedded ? "w-full min-w-0 space-y-6" : "w-full min-w-0 space-y-6"}>
      {embedded ? null : (
      <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-on-surface">
            <LineChart className="h-6 w-6 text-primary" />
            Insights Worker Management
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Centralized admin controls and audit logs for daily social media performance snapshots.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-outline-variant/30 bg-surface-container px-4 py-2.5 text-sm font-semibold text-on-surface hover:bg-surface-container-high transition disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>

          <button
            type="button"
            onClick={handleRunNow}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary shadow-sm hover:opacity-90 transition disabled:opacity-50"
          >
            {running ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Run Snapshot Now
          </button>
        </div>
      </div>
      </>
      )}

      {embedded ? (
        <div className="flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            type="button"
            onClick={handleRunNow}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-on-primary disabled:opacity-50"
          >
            {running ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Run Snapshot Now
          </button>
        </div>
      ) : null}

      {/* Notifications */}
      {error ? (
        <div className="flex items-center gap-3 rounded-2xl border border-error/40 bg-error-container/20 px-4 py-3 text-sm text-on-error-container">
          <AlertTriangle className="h-5 w-5 shrink-0 text-error" />
          <span>{error}</span>
        </div>
      ) : null}

      {successMsg ? (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      ) : null}

      {/* Settings Card */}
      <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm">
        <h2 className="text-lg font-bold text-on-surface flex items-center gap-2 mb-4">
          <ShieldCheck className="h-5 w-5 text-secondary" />
          Snapshot Execution Settings
        </h2>

        <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Master Switch */}
          <div className="rounded-xl border border-outline-variant/20 bg-surface-container/50 p-4">
            <label className="block text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-2">
              Master Status
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                className="h-5 w-5 rounded text-primary focus:ring-primary"
              />
              <span className={`text-sm font-semibold ${isEnabled ? "text-emerald-600" : "text-on-surface-variant"}`}>
                {isEnabled ? "Worker Active" : "Worker Disabled"}
              </span>
            </label>
          </div>

          {/* Lookback Limit */}
          <div className="rounded-xl border border-outline-variant/20 bg-surface-container/50 p-4">
            <label className="block text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-1">
              Post Lookback Depth
            </label>
            <input
              type="number"
              min={1}
              max={200}
              value={lookbackLimit}
              onChange={(e) => setLookbackLimit(Number(e.target.value))}
              className="w-full rounded-lg border border-outline-variant/40 bg-surface px-3 py-1.5 text-sm text-on-surface font-mono"
            />
            <p className="mt-1 text-[11px] text-on-surface-variant">Posts checked per platform sweep</p>
          </div>

          {/* User eligibility note */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 md:col-span-2 lg:col-span-1">
            <label className="block text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-2">
              User eligibility
            </label>
            <p className="text-xs text-on-surface leading-relaxed">
              Snapshots run only for users with <strong>insights enabled</strong> on the{" "}
              <strong>User access</strong> tab. Paid/dev auto-inclusion is no longer used.
            </p>
          </div>

          {/* Submit */}
          <div className="flex items-end">
            <button
              type="submit"
              disabled={saving}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-bold text-on-secondary hover:opacity-90 transition disabled:opacity-50"
            >
              {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Config
            </button>
          </div>
        </form>
      </div>

      {/* Audit Logs Table Card */}
      <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <Database className="h-5 w-5 text-tertiary" />
              Execution Audit Logs ({totalLogs})
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">Real-time audit history of platform snapshot runs</p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-on-surface-variant" />
              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="rounded-xl border border-outline-variant/40 bg-surface px-3 py-1.5 text-xs text-on-surface"
              >
                <option value="">All Social Networks</option>
                <option value="pinterest">Pinterest</option>
                <option value="instagram">Instagram</option>
                <option value="threads">Threads</option>
                <option value="tiktok">TikTok</option>
                <option value="youtube">YouTube</option>
                <option value="linkedin">LinkedIn</option>
                <option value="facebook">Facebook</option>
                <option value="bluesky">Bluesky</option>
                <option value="mastodon">Mastodon</option>
                <option value="wordpress">WordPress</option>
              </select>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-outline-variant/40 bg-surface px-3 py-1.5 text-xs text-on-surface"
            >
              <option value="">All Statuses</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-outline-variant/20 bg-surface-container/30 text-on-surface-variant font-semibold">
                <th className="py-3 px-3">Executed At</th>
                <th className="py-3 px-3">Target User</th>
                <th className="py-3 px-3">Platform</th>
                <th className="py-3 px-3">API Group</th>
                <th className="py-3 px-3">Records Saved</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Endpoints Called</th>
                <th className="py-3 px-3">Data Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-on-surface-variant">
                    No snapshot execution logs match current filters.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-container/20 transition">
                    <td className="py-3 px-3 font-mono text-on-surface-variant whitespace-nowrap">
                      {new Date(log.executed_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-semibold text-on-surface">
                      {log.user_email || log.user_id}
                    </td>
                    <td className="py-3 px-3 font-bold capitalize text-primary">
                      {log.platform}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          log.group_type === "GROUP_A"
                            ? "bg-blue-500/10 text-blue-700 dark:text-blue-300"
                            : "bg-purple-500/10 text-purple-700 dark:text-purple-300"
                        }`}
                      >
                        {log.group_type}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-on-surface">{log.records_saved}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          log.status === "SUCCESS"
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                            : "bg-red-500/10 text-red-700 dark:text-red-300"
                        }`}
                      >
                        {log.status === "SUCCESS" ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-on-surface-variant max-w-[200px] truncate" title={log.apis_called?.join(", ") || ""}>
                      {log.apis_called?.join(", ") || "—"}
                    </td>
                    <td className="py-3 px-3 font-mono text-on-surface-variant max-w-[200px] truncate" title={JSON.stringify(log.data_summary || {})}>
                      {log.data_summary ? JSON.stringify(log.data_summary) : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
