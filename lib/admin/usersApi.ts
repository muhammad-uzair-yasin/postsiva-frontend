/**
 * Admin users — types + pure helpers (query building, filtering, paging,
 * formatting, impersonation URL handling).
 *
 * Kept dependency-free so tests can compile this file standalone
 * (see tests/admin-users.test.mjs). Network calls live in
 * app/(admin)/admin/users/_hooks/useAdminUsers.ts via adminGet/adminSend.
 */

export const USERS_BASE_PATH = "/admin/api/users";
export const USERS_PAGE_SIZE = 50;

/** User row from GET /admin/api/users (legacy /auth/users shape). */
export interface AdminUser {
  id: string;
  email: string;
  username: string;
  full_name: string;
  image_url?: string | null;
  is_active: boolean;
  is_admin: boolean;
  is_developer?: boolean;
  email_verified: boolean;
  must_set_password?: boolean;
  stats?: boolean;
  created_at: string;
  updated_at?: string;
  plan?: AdminUserPlanSummary;
}

/** Plan summary attached to admin user list rows. */
export interface AdminUserPlanSummary {
  effective_plan_id: string;
  admin_grant_active: boolean;
  admin_grant_expires_at?: string | null;
  granted_by_email?: string | null;
  months_granted?: number | null;
}

/** Body for PUT /admin/api/users/{id} (subset used by the UI). */
export interface AdminUserUpdate {
  is_active?: boolean;
  is_admin?: boolean;
  is_developer?: boolean;
  full_name?: string;
  username?: string;
}

/** Usage counters merged from GET /admin/api/tracking/dashboard per_user rows. */
export interface UserActivityStats {
  post_generation_count: number;
  image_generation_count: number;
  message_count: number;
  tool_call_count: number;
  post_published_count: number;
  comments_posted_count: number;
  api_route_hits_total: number;
  activity_score: number;
}

export interface AdminUserWithActivity extends AdminUser {
  activity: UserActivityStats;
}

export type SignupPeriodFilter = "all" | "latest" | "week" | "month";

export type UserSortKey =
  | "created_at"
  | "email"
  | "activity_score"
  | "post_published_count"
  | "api_route_hits_total";

export type SortDirection = "asc" | "desc";

const MS_DAY = 24 * 60 * 60 * 1000;

/** Weighted score for “most active user” ranking. */
export function computeActivityScore(stats: Omit<UserActivityStats, "activity_score">): number {
  return (
    (stats.api_route_hits_total ?? 0) +
    (stats.post_published_count ?? 0) * 12 +
    (stats.post_generation_count ?? 0) * 6 +
    (stats.image_generation_count ?? 0) * 4 +
    (stats.comments_posted_count ?? 0) * 8 +
    (stats.message_count ?? 0) * 3 +
    (stats.tool_call_count ?? 0) * 2
  );
}

const EMPTY_ACTIVITY: UserActivityStats = {
  post_generation_count: 0,
  image_generation_count: 0,
  message_count: 0,
  tool_call_count: 0,
  post_published_count: 0,
  comments_posted_count: 0,
  api_route_hits_total: 0,
  activity_score: 0,
};

/** Join tracking dashboard rows onto user list by id. */
export function mergeUserActivity(
  users: AdminUser[],
  perUser: Array<{
    user_id: string;
    post_generation_count?: number;
    image_generation_count?: number;
    message_count?: number;
    tool_call_count?: number;
    post_published_count?: number;
    comments_posted_count?: number;
    api_route_hits_total?: number;
  }>,
): AdminUserWithActivity[] {
  const byId = new Map(perUser.map((r) => [String(r.user_id), r]));
  return users.map((user) => {
    const row = byId.get(String(user.id));
    const base = {
      post_generation_count: row?.post_generation_count ?? 0,
      image_generation_count: row?.image_generation_count ?? 0,
      message_count: row?.message_count ?? 0,
      tool_call_count: row?.tool_call_count ?? 0,
      post_published_count: row?.post_published_count ?? 0,
      comments_posted_count: row?.comments_posted_count ?? 0,
      api_route_hits_total: row?.api_route_hits_total ?? 0,
    };
    return {
      ...user,
      activity: { ...base, activity_score: computeActivityScore(base) },
    };
  });
}

/** Filter by signup window; “latest” = all users, newest first. */
export function filterUsersBySignupPeriod(
  users: AdminUserWithActivity[],
  period: SignupPeriodFilter,
): AdminUserWithActivity[] {
  if (period === "all") return users;
  if (period === "latest") {
    return [...users].sort(
      (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at),
    );
  }
  const now = Date.now();
  const cutoff =
    period === "month" ? now - 30 * MS_DAY : now - 7 * MS_DAY;
  return users.filter((u) => {
    const t = Date.parse(u.created_at);
    return Number.isFinite(t) && t >= cutoff;
  });
}

/** Stable sort for the users table. */
export function sortUsersWithActivity(
  users: AdminUserWithActivity[],
  key: UserSortKey,
  direction: SortDirection,
): AdminUserWithActivity[] {
  const sign = direction === "asc" ? 1 : -1;
  const value = (u: AdminUserWithActivity): string | number => {
    switch (key) {
      case "email":
        return (u.email || "").toLowerCase();
      case "created_at":
        return Date.parse(u.created_at) || 0;
      case "activity_score":
        return u.activity.activity_score;
      case "post_published_count":
        return u.activity.post_published_count;
      case "api_route_hits_total":
        return u.activity.api_route_hits_total;
      default:
        return 0;
    }
  };
  return users
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

export function userRoleLabel(user: AdminUser): string {
  if (user.is_admin) return "Admin";
  if (user.is_developer) return "Developer";
  return "User";
}

export function formatActivityCount(value: number): string {
  if (!Number.isFinite(value)) return "—";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 10_000) return `${Math.round(value / 1000)}K`;
  return value.toLocaleString("en-US");
}

export function emptyActivityStats(): UserActivityStats {
  return { ...EMPTY_ACTIVITY };
}

/**
 * Impersonation response. The deployed backend returns the legacy payload
 * `{ access_token, token_type, user, redirect_url }` where the one-time code
 * is embedded in `redirect_url` (`{web}/impersonate?code=...`). The contract
 * draft documented `{ code, expires_in }` — support both shapes.
 */
export interface ImpersonateResponse {
  code?: string;
  expires_in?: number;
  redirect_url?: string;
  access_token?: string;
  token_type?: string;
  user?: AdminUser;
}

/** Builds the list path with limit/offset and optional trimmed search. */
export function buildUsersPath(
  search: string,
  limit: number,
  offset: number,
): string {
  const params = new URLSearchParams();
  const needle = search.trim();
  if (needle) {
    params.set("search", needle);
  }
  params.set("limit", String(limit));
  params.set("offset", String(offset));
  return `${USERS_BASE_PATH}?${params.toString()}`;
}

export function buildUserPath(userId: string): string {
  return `${USERS_BASE_PATH}/${encodeURIComponent(userId)}`;
}

export function buildImpersonatePath(userId: string): string {
  return `${buildUserPath(userId)}/impersonate`;
}

/**
 * Substring match on email/username/full name (case-insensitive) — parity
 * with the legacy admin users page filter.
 */
export function filterUsers(users: AdminUser[], search: string): AdminUser[] {
  const needle = search.trim().toLowerCase();
  if (!needle) {
    return users;
  }
  return users.filter(
    (u) =>
      (u.email || "").toLowerCase().includes(needle) ||
      (u.username || "").toLowerCase().includes(needle) ||
      (u.full_name || "").toLowerCase().includes(needle),
  );
}

/** Appends a page onto the accumulated list, de-duplicating by id. */
export function mergeUsersPage(
  existing: AdminUser[],
  page: AdminUser[],
): AdminUser[] {
  const seen = new Set(existing.map((u) => u.id));
  return [...existing, ...page.filter((u) => !seen.has(u.id))];
}

/** A full page means there may be more rows after it. */
export function hasMoreUsers(pageLength: number, limit: number): boolean {
  return pageLength >= limit;
}

/** Replaces a user in place (after PUT); untouched rows keep identity. */
export function replaceUser(
  users: AdminUser[],
  updated: AdminUser,
): AdminUser[] {
  return users.map((u) => (u.id === updated.id ? updated : u));
}

export function removeUser(users: AdminUser[], userId: string): AdminUser[] {
  return users.filter((u) => u.id !== userId);
}

/** Display name fallback chain — parity with legacy (`full_name || username || email`). */
export function userDisplayName(user: AdminUser): string {
  return user.full_name || user.username || user.email || "—";
}

/** "Jan 5, 2026" (en-US); invalid/missing dates render as an em dash. */
export function formatUserDate(iso: string | null | undefined): string {
  if (!iso) {
    return "—";
  }
  const time = Date.parse(iso);
  if (Number.isNaN(time)) {
    return "—";
  }
  return new Date(time).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Extracts the one-time handoff code from either contract shape:
 * `{ code }` (documented) or `{ redirect_url: ".../impersonate?code=..." }`
 * (deployed legacy payload).
 */
export function extractImpersonateCode(
  payload: ImpersonateResponse | null | undefined,
): string | null {
  if (!payload) {
    return null;
  }
  if (payload.code && payload.code.trim()) {
    return payload.code.trim();
  }
  if (payload.redirect_url) {
    try {
      const url = new URL(payload.redirect_url, "http://localhost");
      const code = url.searchParams.get("code");
      return code && code.trim() ? code.trim() : null;
    } catch {
      return null;
    }
  }
  return null;
}

/** Builds `{origin}/impersonate?code=...` against the current web origin. */
export function buildImpersonateUrl(origin: string, code: string): string {
  return `${origin.replace(/\/+$/, "")}/impersonate?code=${encodeURIComponent(code)}`;
}

/**
 * Resolves the URL to open in a new tab after POST .../impersonate.
 *
 * Prefers the backend's `redirect_url` when it already targets this web
 * origin's `/impersonate` route; otherwise rebuilds
 * `{origin}/impersonate?code=...` from the extracted one-time code (covers
 * FRONTEND_URL mismatches and the draft `{ code }` shape). Null when no code
 * can be recovered.
 */
export function resolveImpersonateRedirect(
  origin: string,
  payload: ImpersonateResponse | null | undefined,
): string | null {
  const base = origin.replace(/\/+$/, "");
  const redirect = payload?.redirect_url;
  if (typeof redirect === "string" && redirect.startsWith(`${base}/impersonate?`)) {
    return redirect;
  }
  const code = extractImpersonateCode(payload);
  return code ? buildImpersonateUrl(base, code) : null;
}
