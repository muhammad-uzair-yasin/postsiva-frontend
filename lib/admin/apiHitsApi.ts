/** Types + pure helpers for the admin API hits page (`/admin/api-hits`).
 *
 * Wraps `GET /admin/api/tracking/api-hits` (legacy
 * `/user-activity/admin/api-route-hits`). Fetching itself lives in the page
 * hooks via `adminGet`/`adminSend`; everything here is side-effect free so it
 * can be unit-tested with plain tsc compilation.
 */

export interface ApiHitRow {
  user_id: string;
  email: string;
  username: string;
  full_name: string;
  /** METHOD + path template, e.g. `GET /workspaces/{id}` */
  route_key: string;
  hit_count: number;
  first_seen_at: string;
  last_seen_at: string;
}

export interface ApiHitsResponse {
  success: boolean;
  hits: ApiHitRow[];
  total: number;
  limit: number;
  offset: number;
}

export interface FeedbackEmailResponse {
  success: boolean;
  detail: string;
}

export interface ApiHitsQuery {
  limit: number;
  offset: number;
  userId?: string;
  routeContains?: string;
}

export const API_HITS_DEFAULT_LIMIT = 100;
export const API_HITS_MAX_LIMIT = 500;

/** Parse a numeric input; clamp into [min, max]; fall back when unparsable (legacy input behavior). */
export function clampInt(
  raw: string | number | null | undefined,
  fallback: number,
  min: number,
  max: number,
): number {
  const n =
    typeof raw === "number" ? Math.trunc(raw) : parseInt(String(raw ?? ""), 10);
  const value = Number.isFinite(n) && !Number.isNaN(n) ? n : fallback;
  return Math.min(max, Math.max(min, value));
}

export function clampApiHitsLimit(raw: string | number | null | undefined): number {
  return clampInt(raw, API_HITS_DEFAULT_LIMIT, 1, API_HITS_MAX_LIMIT);
}

/** Build the admin API path incl. optional user/route filters (parity with legacy query). */
export function buildApiHitsPath(query: ApiHitsQuery): string {
  const params = new URLSearchParams({
    limit: String(query.limit),
    offset: String(query.offset),
  });
  const userId = query.userId?.trim();
  const routeContains = query.routeContains?.trim();
  if (userId) params.set("user_id", userId);
  if (routeContains) params.set("route_key_contains", routeContains);
  return `/admin/api/tracking/api-hits?${params.toString()}`;
}

export function prevOffset(offset: number, limit: number): number {
  return Math.max(0, offset - limit);
}

export function nextOffset(offset: number, limit: number): number {
  return offset + limit;
}

/** More rows exist after the current page. */
export function hasNextPage(offset: number, shown: number, total: number): boolean {
  return offset + shown < total;
}

/** Meta line, parity with legacy "Showing X of Y rows (offset Z)". */
export function apiHitsMetaLabel(shown: number, total: number, offset: number): string {
  return `Showing ${shown} of ${total.toLocaleString()} rows (offset ${offset})`;
}

/** Display name used by the legacy table + feedback modal. */
export function hitDisplayName(row: Pick<ApiHitRow, "full_name" | "username">): string {
  return (row.full_name || row.username || "").trim();
}

/** Legacy `formatDate`: locale string or "N/A". */
export function formatSeenAt(iso: string | null | undefined): string {
  if (!iso) return "N/A";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "N/A" : d.toLocaleString();
}

/** Body for POST /admin/api/tracking/feedback-email (empty message → null, as legacy). */
export function feedbackEmailBody(
  userId: string,
  message: string,
): { user_id: string; message: string | null } {
  const trimmed = message.trim();
  return { user_id: userId, message: trimmed.length > 0 ? trimmed : null };
}
