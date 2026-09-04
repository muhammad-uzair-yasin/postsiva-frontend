/**
 * Admin tracking dashboard: response types + pure helpers.
 * Mirrors `GET /admin/api/tracking/dashboard` and the feedback-email endpoints
 * (see specs/037-admin-dashboard-rewrite/contracts/admin-api.md).
 * Pure module (no imports) — unit-tested in tests/admin-tracking.test.mjs.
 */

export interface WorkspaceUsageTotals {
  post_generation_count: number;
  image_generation_count: number;
  message_count: number;
  tool_call_count: number;
  post_published_count: number;
  comments_posted_count: number;
}

export interface ApiRouteHitsTotals {
  total_hits: number;
  distinct_users: number;
  distinct_route_keys: number;
}

export interface TopRouteKeyRow {
  route_key: string;
  hit_count: number;
}

export interface PerUserTrackingRow {
  user_id: string;
  email: string;
  username: string;
  full_name: string;
  post_generation_count: number;
  image_generation_count: number;
  message_count: number;
  tool_call_count: number;
  post_published_count: number;
  comments_posted_count: number;
  api_route_hits_total: number;
}

export interface TrackingDashboardResponse {
  success: boolean;
  workspace_usage_totals: WorkspaceUsageTotals;
  api_route_hits_totals: ApiRouteHitsTotals;
  users_with_tracking_activity: number;
  top_route_keys: TopRouteKeyRow[];
  per_user: PerUserTrackingRow[];
}

export interface SendFeedbackEmailResponse {
  success: boolean;
  detail: string;
}

export interface BulkFeedbackFailure {
  user_id: string;
  detail: string;
}

export interface BulkSendFeedbackEmailResponse {
  success: boolean;
  sent: number;
  failed: BulkFeedbackFailure[];
  detail: string;
}

/** Server-enforced cap on bulk feedback recipients. */
export const BULK_RECIPIENT_LIMIT = 100;

export function formatCount(value: number | null | undefined): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  return value.toLocaleString("en-US");
}

/** Legacy parity: full_name, falling back to username, trimmed. */
export function displayName(row: {
  full_name?: string | null;
  username?: string | null;
}): string {
  return (row.full_name || row.username || "").trim();
}

/** Legacy parity: case-insensitive blob match on email/name/username/user id. */
export function filterPerUserRows(
  rows: PerUserTrackingRow[],
  query: string,
): PerUserTrackingRow[] {
  const q = query.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter((r) =>
    `${r.email || ""} ${r.full_name || ""} ${r.username || ""} ${r.user_id || ""}`
      .toLowerCase()
      .includes(q),
  );
}

export type PerUserSortKey =
  | "email"
  | "name"
  | "post_generation_count"
  | "image_generation_count"
  | "tool_call_count"
  | "post_published_count"
  | "comments_posted_count"
  | "message_count"
  | "api_route_hits_total";

export type SortDirection = "asc" | "desc";

/** Stable sort of per-user rows; strings compare case-insensitively. */
export function sortPerUserRows(
  rows: PerUserTrackingRow[],
  key: PerUserSortKey,
  direction: SortDirection,
): PerUserTrackingRow[] {
  const sign = direction === "asc" ? 1 : -1;
  const value = (r: PerUserTrackingRow): string | number =>
    key === "email"
      ? (r.email || "").toLowerCase()
      : key === "name"
        ? displayName(r).toLowerCase()
        : r[key] ?? 0;
  return rows
    .map((row, index) => ({ row, index }))
    .sort((a, b) => {
      const va = value(a.row);
      const vb = value(b.row);
      if (va < vb) return -1 * sign;
      if (va > vb) return 1 * sign;
      return a.index - b.index;
    })
    .map((entry) => entry.row);
}

/** Toggle one user id in a selection (returns a new array, order preserved). */
export function toggleSelection(selected: string[], userId: string): string[] {
  return selected.includes(userId)
    ? selected.filter((id) => id !== userId)
    : [...selected, userId];
}

/** Select-all semantics: if every visible row is selected, clear; else select all visible. */
export function selectAllVisible(
  selected: string[],
  visibleRows: PerUserTrackingRow[],
): string[] {
  const visibleIds = visibleRows.map((r) => r.user_id);
  const allSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selected.includes(id));
  return allSelected ? [] : visibleIds;
}

/** Legacy parity: preview lines "email (name or —)", capped with a trailing "… and N more". */
export function recipientPreview(
  rows: PerUserTrackingRow[],
  selectedIds: string[],
  maxLines = 12,
): string[] {
  const lines = selectedIds.map((uid) => {
    const row = rows.find((r) => String(r.user_id) === String(uid));
    if (!row) return String(uid);
    return `${row.email} (${displayName(row) || "—"})`;
  });
  if (lines.length <= maxLines) return lines;
  return [
    ...lines.slice(0, maxLines),
    `… and ${lines.length - maxLines} more`,
  ];
}

export interface LabeledValue {
  label: string;
  value: number;
}

/** Stat tiles in the legacy card order (Totals section of usage.html). */
export function statTiles(data: TrackingDashboardResponse): LabeledValue[] {
  const w = data.workspace_usage_totals;
  const a = data.api_route_hits_totals;
  return [
    { label: "Post generation", value: w.post_generation_count ?? 0 },
    { label: "Image generation", value: w.image_generation_count ?? 0 },
    { label: "Tool calls", value: w.tool_call_count ?? 0 },
    { label: "Posts published", value: w.post_published_count ?? 0 },
    { label: "Comments posted", value: w.comments_posted_count ?? 0 },
    { label: "Agent messages", value: w.message_count ?? 0 },
    { label: "API hits (all)", value: a.total_hits ?? 0 },
    { label: "Users (API tracked)", value: a.distinct_users ?? 0 },
    { label: "Distinct route keys", value: a.distinct_route_keys ?? 0 },
    { label: "Users w/ activity", value: data.users_with_tracking_activity ?? 0 },
  ];
}

/** Workspace activity mix for the aggregate bar chart. */
export function usageMixBars(totals: WorkspaceUsageTotals): LabeledValue[] {
  return [
    { label: "Post generation", value: totals.post_generation_count ?? 0 },
    { label: "Image generation", value: totals.image_generation_count ?? 0 },
    { label: "Tool calls", value: totals.tool_call_count ?? 0 },
    { label: "Posts published", value: totals.post_published_count ?? 0 },
    { label: "Comments posted", value: totals.comments_posted_count ?? 0 },
    { label: "Agent messages", value: totals.message_count ?? 0 },
  ];
}

/** Clean axis ticks: 0..>=max with enough detail for larger whole-number totals. */
export function niceTicks(maxValue: number, tickCount = 4): number[] {
  if (!Number.isFinite(maxValue) || maxValue <= 0) return [0, 1];
  const rawStep = maxValue / tickCount;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const normalized = rawStep / magnitude;
  // Keep compact charts for two-digit totals, but allow quarter-thousand ticks so
  // a 1,000-value chart does not collapse to only three axis labels.
  const niceFactor =
    normalized <= 1
      ? 1
      : normalized <= 2
        ? 2
        : normalized <= 2.5 && magnitude >= 100
          ? 2.5
          : normalized <= 5
            ? 5
            : 10;
  const step = niceFactor * magnitude;
  const ticks: number[] = [];
  const top = Math.ceil(maxValue / step - 1e-9) * step;
  for (let v = 0; v <= top + step / 2; v += step) {
    ticks.push(Math.round(v * 1e6) / 1e6);
  }
  return ticks;
}

/**
 * SVG path for a horizontal bar growing from a left baseline:
 * square at the baseline, rounded (radius) data-end. Empty string when width <= 0.
 */
export function roundedBarPath(
  x: number,
  y: number,
  width: number,
  height: number,
  radius = 4,
): string {
  if (width <= 0 || height <= 0) return "";
  const r = Math.max(0, Math.min(radius, width, height / 2));
  const straight = width - r;
  return (
    `M${x},${y} h${straight} ` +
    `a${r},${r} 0 0 1 ${r},${r} v${height - 2 * r} a${r},${r} 0 0 1 -${r},${r} ` +
    `h-${straight} z`
  );
}

/** Extract a readable message from a FastAPI-style error payload. */
export function describeApiError(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object" && "detail" in payload) {
    const detail = (payload as { detail?: unknown }).detail;
    if (typeof detail === "string" && detail) return detail;
    if (Array.isArray(detail)) {
      const parts = detail
        .map((d) =>
          d && typeof d === "object" && "msg" in d
            ? String((d as { msg?: unknown }).msg)
            : JSON.stringify(d),
        )
        .filter(Boolean);
      if (parts.length) return parts.join(" ");
    }
  }
  return fallback;
}

/** Bulk-result summary: detail plus per-user failure lines (legacy alert parity). */
export function bulkResultSummary(res: BulkSendFeedbackEmailResponse): string {
  const head = res.detail || `Sent ${res.sent} email(s).`;
  if (!res.failed || res.failed.length === 0) return head;
  const failures = res.failed
    .map((f) => `${f.user_id}: ${f.detail}`)
    .join("\n");
  return `${head}\n\nFailed:\n${failures}`;
}
