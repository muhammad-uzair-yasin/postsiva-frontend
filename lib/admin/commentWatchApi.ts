/**
 * Types + pure helpers for the admin LinkedIn AI comment watch page.
 * Kept import-free so unit tests can compile this file standalone.
 * API calls live in app/(admin)/admin/comment-watch/_hooks.
 */

export interface EnabledWatch {
  id: number;
  user_id?: string | null;
  user_email?: string | null;
  user_username?: string | null;
  workspace_id?: string | null;
  post_id?: string | null;
  created_at?: string | null;
}

export interface EnabledWatchesResponse {
  watches?: EnabledWatch[];
}

export interface WatchRun {
  id: number;
  started_at?: string | null;
  status?: string | null;
  total_posts?: number | null;
  posts_ok?: number | null;
  posts_failed?: number | null;
  total_replies_posted?: number | null;
  total_replies_failed?: number | null;
}

export interface WatchRunsResponse {
  runs?: WatchRun[];
}

export interface RunPostDetail {
  post_id?: string | null;
  status?: string | null;
  comments_fetched?: number | null;
  replies_posted?: number | null;
  replies_failed?: number | null;
  error_message?: string | null;
}

export interface RunDetailResponse {
  success?: boolean;
  message?: string | null;
  error_summary?: string | null;
  details?: RunPostDetail[] | null;
}

export interface DisableWatchResponse {
  success?: boolean;
  message?: string | null;
}

export interface ErrorSummaryEntry {
  post_id: string;
  error: string;
}

export type RunStatusTone = "success" | "error" | "pending";

/** Legacy mapping: success → green, failed → red, anything else → amber. */
export function runStatusTone(status: string | null | undefined): RunStatusTone {
  if (status === "success") return "success";
  if (status === "failed") return "error";
  return "pending";
}

/** Legacy posts column: "2/3 ok" plus ", 1 failed" when applicable, else em dash. */
export function formatRunPosts(run: WatchRun): string {
  if (run.posts_ok == null || run.total_posts == null) return "—";
  const base = `${run.posts_ok}/${run.total_posts} ok`;
  return run.posts_failed != null && run.posts_failed > 0
    ? `${base}, ${run.posts_failed} failed`
    : base;
}

/** Newest runs first; runs without a parseable started_at sink to the end. */
export function sortRunsByStartedAt(runs: WatchRun[]): WatchRun[] {
  const time = (run: WatchRun): number => {
    if (!run.started_at) return Number.NEGATIVE_INFINITY;
    const t = Date.parse(run.started_at);
    return Number.isNaN(t) ? Number.NEGATIVE_INFINITY : t;
  };
  return [...runs].sort((a, b) => time(b) - time(a));
}

/** Legacy count label: "1 watch" / "0 watches" / "2 watches". */
export function watchCountLabel(count: number): string {
  return `${count} watch${count === 1 ? "" : "es"}`;
}

/** Legacy user column preference: email, then username, then user id. */
export function watchUserLabel(watch: EnabledWatch): string {
  return watch.user_email || watch.user_username || watch.user_id || "—";
}

/** Legacy truncation: keep max chars, ellipsize with "..." (counts toward max). */
export function truncateId(value: string | null | undefined, max: number): string {
  const v = value ?? "";
  return v.length > max ? `${v.substring(0, max - 3)}...` : v;
}

/**
 * error_summary is stored as a JSON array of { post_id, error }; fall back to
 * showing the raw string when it does not parse to a non-empty array.
 */
export function parseErrorSummary(
  raw: string | null | undefined,
): { entries: ErrorSummaryEntry[] } | { raw: string } | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const entries = parsed.map((item): ErrorSummaryEntry => {
        const rec = (item ?? {}) as Record<string, unknown>;
        return {
          post_id: typeof rec.post_id === "string" ? rec.post_id : "",
          error: typeof rec.error === "string" ? rec.error : "",
        };
      });
      return { entries };
    }
  } catch {
    // fall through to raw
  }
  return { raw };
}

/** Date display used across the page; em dash for missing/invalid values. */
export function formatWatchDate(value: string | null | undefined): string {
  if (!value) return "—";
  const t = Date.parse(value);
  if (Number.isNaN(t)) return "—";
  return new Date(t).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Numeric cell that keeps 0 but em-dashes null/undefined. */
export function formatCount(value: number | null | undefined): string {
  return value == null ? "—" : String(value);
}
