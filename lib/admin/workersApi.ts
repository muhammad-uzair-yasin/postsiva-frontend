/**
 * Admin Workers page: types + pure payload-mapping/format helpers.
 *
 * Response shapes mirror the consolidated admin API (`/admin/api/workers/*`),
 * which delegates to `app/modules/workers/service.py` on the backend.
 * Keep this module dependency-free so it can be unit-tested standalone.
 */

export interface WorkerEntry {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  interval_minutes: number;
  last_run_at: string | null;
  last_status: string | null;
  last_run_result: unknown;
  last_run_error: string | null;
}

export interface WorkerRunResult {
  ok: boolean;
  skipped?: boolean;
  worker_id?: string;
  run_id?: string;
  error?: string | null;
  reason?: string;
  [key: string]: unknown;
}

/** Quick interval presets for admin tuning. */
export const INTERVAL_PRESETS: ReadonlyArray<{ label: string; minutes: number }> = [
  { label: "1 min", minutes: 1 },
  { label: "5 min", minutes: 5 },
  { label: "15 min", minutes: 15 },
  { label: "1 hr", minutes: 60 },
  { label: "24 hr", minutes: 1440 },
];

export interface WorkersStatus {
  workers: WorkerEntry[];
  broker_connected: boolean;
  error: string | null;
  config_path: string | null;
  config_source?: string | null;
  scheduling_note: string | null;
}

export interface WorkerRunLog {
  id: string;
  run_id: string;
  worker_id: string;
  status: string;
  started_at: string;
  finished_at: string | null;
  duration_seconds: number | null;
  result_json: Record<string, unknown> | null;
  error_message: string | null;
  triggered_by: string;
  instance_id: string | null;
}

export interface WorkerRunLogsResponse {
  success: boolean;
  total: number;
  offset: number;
  limit: number;
  logs: WorkerRunLog[];
}

export interface ScheduledTask {
  scheduled_post_id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  platform: string;
  post_type: string;
  scheduled_time: string | null;
  status: string;
  created_at: string | null;
}

export interface PendingTask {
  worker: string;
  queue: string;
  task_name: string;
  task_id: string;
  eta: string | null;
  kind: string;
  args_preview: string;
}

export interface WorkerConfigPatch {
  enabled?: boolean;
  interval_minutes?: number;
}

export interface ProcessDueResult {
  ok: boolean;
  skipped: boolean;
  due: number;
  published_ok: number;
  published_fail: number;
  error: string | null;
}

// ---------------------------------------------------------------------------
// Endpoint paths
// ---------------------------------------------------------------------------

export function workerRunPath(workerId: string): string {
  return `/admin/api/workers/run/${encodeURIComponent(workerId)}`;
}

export const WORKERS_STATUS_PATH = "/admin/api/workers/status";
export const WORKERS_RUN_LOGS_PATH = "/admin/api/workers/run-logs";

export function workerRunLogsPath(params: {
  worker_id?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): string {
  const query = new URLSearchParams();
  if (params.worker_id) query.set("worker_id", params.worker_id);
  if (params.status) query.set("status", params.status);
  if (params.limit) query.set("limit", String(params.limit));
  if (params.offset) query.set("offset", String(params.offset));
  const qs = query.toString();
  return qs ? `${WORKERS_RUN_LOGS_PATH}?${qs}` : WORKERS_RUN_LOGS_PATH;
}
export const WORKERS_CONFIG_PATH = "/admin/api/workers/config";
export const WORKERS_PENDING_TASKS_PATH = "/admin/api/workers/pending-tasks";
export const WORKERS_PROCESS_DUE_PATH =
  "/admin/api/workers/process-due-scheduled-posts";

export function workerConfigPatchPath(workerId: string): string {
  return `/admin/api/workers/config/${encodeURIComponent(workerId)}`;
}

export function scheduledTasksPath(limit: number): string {
  const safe = Number.isFinite(limit) && limit >= 1 ? Math.floor(limit) : 100;
  return `/admin/api/workers/scheduled-tasks?limit=${safe}`;
}

// ---------------------------------------------------------------------------
// Payload normalization
// ---------------------------------------------------------------------------

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNullableString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  return typeof value === "string" ? value : String(value);
}

export function normalizeWorker(raw: unknown): WorkerEntry {
  const r = asRecord(raw);
  const interval = Number(r.interval_minutes);
  return {
    id: asString(r.id),
    name: asString(r.name) || asString(r.id) || "—",
    description: asString(r.description),
    enabled: r.enabled === undefined ? true : Boolean(r.enabled),
    interval_minutes:
      Number.isFinite(interval) && interval >= 1 ? Math.floor(interval) : 30,
    last_run_at: asNullableString(r.last_run_at),
    last_status: asNullableString(r.last_status),
    last_run_result: r.last_run_result ?? null,
    last_run_error: asNullableString(r.last_run_error),
  };
}

/** Maps GET /admin/api/workers/status (also accepts the /config payload). */
export function normalizeWorkersStatus(raw: unknown): WorkersStatus {
  const r = asRecord(raw);
  const workers = Array.isArray(r.workers) ? r.workers.map(normalizeWorker) : [];
  return {
    workers,
    broker_connected: Boolean(r.broker_connected),
    error: asNullableString(r.error),
    config_path: asNullableString(r.config_path),
    config_source: asNullableString(r.config_source),
    scheduling_note: asNullableString(r.scheduling_note),
  };
}

export function normalizeScheduledTasks(raw: unknown): ScheduledTask[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const r = asRecord(item);
    return {
      scheduled_post_id: asString(r.scheduled_post_id),
      user_id: asString(r.user_id),
      user_email: asString(r.user_email),
      user_name: asString(r.user_name),
      platform: asString(r.platform),
      post_type: asString(r.post_type),
      scheduled_time: asNullableString(r.scheduled_time),
      status: asString(r.status),
      created_at: asNullableString(r.created_at),
    };
  });
}

export function normalizePendingTasks(raw: unknown): PendingTask[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const r = asRecord(item);
    return {
      worker: asString(r.worker),
      queue: asString(r.queue),
      task_name: asString(r.task_name),
      task_id: asString(r.task_id),
      eta: asNullableString(r.eta),
      kind: asString(r.kind, "reserved"),
      args_preview: asString(r.args_preview),
    };
  });
}

export function normalizeProcessDueResult(raw: unknown): ProcessDueResult {
  const r = asRecord(raw);
  const num = (v: unknown): number => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };
  return {
    ok: Boolean(r.ok),
    skipped: Boolean(r.skipped),
    due: num(r.due),
    published_ok: num(r.published_ok),
    published_fail: num(r.published_fail),
    error: asNullableString(r.error),
  };
}

// ---------------------------------------------------------------------------
// Pure state helpers
// ---------------------------------------------------------------------------

/** Optimistic update: returns a new list with the patch applied to one worker. */
export function applyWorkerPatch(
  workers: WorkerEntry[],
  workerId: string,
  patch: WorkerConfigPatch,
): WorkerEntry[] {
  return workers.map((w) => (w.id === workerId ? { ...w, ...patch } : w));
}

/** Validates the inline interval input; null when not a usable value. */
export function parseIntervalMinutes(input: string): number | null {
  const trimmed = input.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const n = Number.parseInt(trimmed, 10);
  return Number.isFinite(n) && n >= 1 ? n : null;
}

// ---------------------------------------------------------------------------
// Formatting helpers (parity with legacy admin/workers.html)
// ---------------------------------------------------------------------------

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString();
}

export function normalizeWorkerRunLogs(raw: unknown): WorkerRunLogsResponse {
  const r = asRecord(raw);
  const logs = Array.isArray(r.logs)
    ? r.logs.map((item) => {
        const row = asRecord(item);
        const duration = Number(row.duration_seconds);
        return {
          id: asString(row.id),
          run_id: asString(row.run_id),
          worker_id: asString(row.worker_id),
          status: asString(row.status),
          started_at: asString(row.started_at),
          finished_at: asNullableString(row.finished_at),
          duration_seconds: Number.isFinite(duration) ? duration : null,
          result_json:
            row.result_json && typeof row.result_json === "object"
              ? (row.result_json as Record<string, unknown>)
              : null,
          error_message: asNullableString(row.error_message),
          triggered_by: asString(row.triggered_by, "scheduler"),
          instance_id: asNullableString(row.instance_id),
        };
      })
    : [];
  return {
    success: r.success !== false,
    total: Number(r.total) || logs.length,
    offset: Number(r.offset) || 0,
    limit: Number(r.limit) || logs.length,
    logs,
  };
}

/** Config display label — DB or legacy file path. */
export function configSourceLabel(status: WorkersStatus | null): string {
  if (!status) return "—";
  if (status.config_source === "database") return "MySQL (worker_definitions)";
  return configFileName(status.config_path);
}

/** Human-readable interval label for admin tables. */
export function formatIntervalMinutes(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes < 1) return "—";
  if (minutes < 60) return `${minutes} min`;
  if (minutes % 1440 === 0) {
    const days = minutes / 1440;
    return days === 1 ? "24 hr" : `${days} days`;
  }
  if (minutes % 60 === 0) return `${minutes / 60} hr`;
  return `${minutes} min`;
}

export function normalizeWorkerRunResult(raw: unknown): WorkerRunResult {
  const r = asRecord(raw);
  return {
    ok: Boolean(r.ok),
    skipped: r.skipped === true,
    worker_id: asNullableString(r.worker_id) ?? undefined,
    run_id: asNullableString(r.run_id) ?? undefined,
    error: asNullableString(r.error),
    reason: asNullableString(r.reason) ?? undefined,
    ...r,
  };
}

/** Basename of the workers config file path (handles / and \ separators). */
export function configFileName(path: string | null | undefined): string {
  if (!path) return "workers_config.json";
  const parts = path.split(/[/\\]/);
  return parts[parts.length - 1] || path;
}

/** Compact `key=value` summary of a worker's last_run_result (legacy parity). */
export function summarizeRunResult(result: unknown): string {
  if (result === null || result === undefined) return "—";
  if (typeof result !== "object") return String(result);
  return describeWorkerRunLog({
    worker_id: "",
    status: "",
    result_json: result as Record<string, unknown>,
  }).headline;
}

export interface WorkerRunDescription {
  headline: string;
  lines: string[];
}

/** Human-readable narrative for a worker run log entry. */
export function describeWorkerRunLog(log: {
  worker_id: string;
  status?: string;
  result_json?: Record<string, unknown> | null;
  error_message?: string | null;
  triggered_by?: string;
  duration_seconds?: number | null;
}): WorkerRunDescription {
  const r = log.result_json ?? {};
  const lines: string[] = [];
  const wid = log.worker_id;
  const st = (log.status || "").toUpperCase();

  if (st === "SKIPPED") {
    const reason = typeof r.reason === "string" ? r.reason : "skipped";
    lines.push(`Run was skipped (${reason}).`);
    if (log.triggered_by) lines.push(`Triggered by: ${log.triggered_by}.`);
    return { headline: `Skipped — ${reason}`, lines };
  }

  if (st === "RUNNING") {
    return { headline: "Running…", lines: ["Worker is still executing."] };
  }

  if (wid === "process_due_scheduled_posts") {
    if (r.due !== undefined) lines.push(`Found ${r.due} due post(s).`);
    if (r.published_ok !== undefined) lines.push(`Published successfully: ${r.published_ok}.`);
    if (r.published_fail !== undefined) lines.push(`Publish failures: ${r.published_fail}.`);
  } else if (wid === "ai_comment_watch") {
    if (r.run_id) lines.push(`Watcher run id: ${r.run_id}.`);
    if (r.status) lines.push(`Watcher status: ${r.status}.`);
    if (r.videos_ok !== undefined) lines.push(`Videos processed: ${r.videos_ok}.`);
    if (r.total_replies_posted !== undefined) lines.push(`Replies posted: ${r.total_replies_posted}.`);
  } else if (wid === "linkedin_ai_comment_watch") {
    if (r.run_id) lines.push(`Watcher run id: ${r.run_id}.`);
    if (r.posts_ok !== undefined) lines.push(`Posts processed: ${r.posts_ok}.`);
    if (r.total_replies_posted !== undefined) lines.push(`Replies posted: ${r.total_replies_posted}.`);
  } else if (wid === "unified_ai_comment_watch") {
    if (r.total_posts !== undefined) lines.push(`Posts watched: ${r.total_posts}.`);
    if (r.total_replies_posted !== undefined) lines.push(`Replies posted: ${r.total_replies_posted}.`);
    if (r.duration_seconds !== undefined) lines.push(`Duration: ${r.duration_seconds}s.`);
    const platforms = r.platforms;
    if (platforms && typeof platforms === "object") {
      lines.push(`Platforms: ${Object.keys(platforms as object).join(", ") || "none"}.`);
    }
  } else if (wid === "ai_provider_inventory") {
    const providers = r.providers;
    if (providers && typeof providers === "object") {
      for (const [name, info] of Object.entries(providers as Record<string, unknown>)) {
        const row = info as Record<string, unknown>;
        lines.push(`${name}: status=${row.status ?? "?"}, low_balance=${row.low_balance ?? "?"}.`);
      }
    }
    const alerts = r.alerts;
    if (Array.isArray(alerts) && alerts.length) lines.push(`Alerts: ${alerts.length}.`);
  } else if (wid === "insights_daily_snapshot") {
    if (r.total_users_processed !== undefined) lines.push(`Users processed: ${r.total_users_processed}.`);
    if (r.total_workspaces_processed !== undefined) lines.push(`Workspaces: ${r.total_workspaces_processed}.`);
    if (r.total_records_saved !== undefined) lines.push(`Snapshot records saved: ${r.total_records_saved}.`);
    if (r.duration_seconds !== undefined) lines.push(`Duration: ${r.duration_seconds}s.`);
  }

  if (log.duration_seconds != null) lines.push(`Finished in ${log.duration_seconds}s.`);
  if (log.triggered_by) lines.push(`Triggered by: ${log.triggered_by}.`);
  if (log.error_message) lines.push(`Error: ${log.error_message}`);
  else if (typeof r.error === "string" && r.error) lines.push(`Error: ${r.error}`);

  if (lines.length === 0) {
    if (log.result_json === null || log.result_json === undefined) {
      return { headline: "—", lines: ["No result payload stored."] };
    }
    const parts: string[] = [];
    if (r.due !== null && r.due !== undefined) parts.push(`due=${r.due}`);
    if (r.published_ok !== null && r.published_ok !== undefined) parts.push(`ok=${r.published_ok}`);
    if (r.published_fail !== null && r.published_fail !== undefined) parts.push(`fail=${r.published_fail}`);
    if (r.run_id !== null && r.run_id !== undefined) parts.push(`run_id=${r.run_id}`);
    if (r.videos_ok !== null && r.videos_ok !== undefined) parts.push(`videos_ok=${r.videos_ok}`);
    if (r.total_replies_posted !== null && r.total_replies_posted !== undefined)
      parts.push(`replies=${r.total_replies_posted}`);
    const headline = parts.length ? parts.join(" ") : st === "SUCCESS" ? "Completed" : st || "—";
    lines.push(headline === "—" ? "See full JSON for details." : `Result: ${headline}.`);
    return { headline, lines };
  }

  const headline = lines[0].replace(/\.$/, "");
  return { headline, lines };
}

export function truncateText(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max)}…`;
}

/** Visual tone for a scheduled-post status badge. */
export function scheduledStatusTone(
  status: string,
): "scheduled" | "publishing" | "other" {
  const s = status.toLowerCase();
  if (s === "scheduled") return "scheduled";
  if (s === "publishing") return "publishing";
  return "other";
}

/** Human summary of the process-due-scheduled-posts run result. */
export function summarizeProcessDue(result: ProcessDueResult): string {
  if (result.skipped) return "Skipped — worker is disabled or lock not acquired.";
  if (result.error) return `Failed: ${result.error}`;
  return `Done — ${result.due} due, ${result.published_ok} published, ${result.published_fail} failed.`;
}
