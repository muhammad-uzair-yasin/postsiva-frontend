/**
 * Admin overview (dashboard stats) — types + pure helpers.
 *
 * Kept dependency-free so tests can compile this file standalone
 * (see tests/admin-users.test.mjs). Fetching happens in the screen via
 * adminGet(OVERVIEW_PATH).
 */

export const OVERVIEW_PATH = "/admin/api/overview";

/** Response of GET /admin/api/overview (scalar stats; no time series). */
export interface AdminOverview {
  total_users: number;
  active_users: number;
  admins: number;
  verified_users: number;
  recent_signups_7d: number;
}

export interface OverviewTile {
  key: keyof AdminOverview;
  label: string;
  value: string;
  /** Optional secondary line, e.g. "82% of total". */
  hint?: string;
}

/** Compact stat formatting: 1,284 / 12.9K / 4.2M. Non-finite values → em dash. */
export function formatStatValue(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "—";
  }
  const abs = Math.abs(value);
  if (abs >= 1_000_000) {
    return `${trimTrailingZero((value / 1_000_000).toFixed(1))}M`;
  }
  if (abs >= 10_000) {
    return `${trimTrailingZero((value / 1_000).toFixed(1))}K`;
  }
  return value.toLocaleString("en-US");
}

function trimTrailingZero(fixed: string): string {
  return fixed.endsWith(".0") ? fixed.slice(0, -2) : fixed;
}

/** Percentage of total users, rounded; null when total is 0/invalid. */
export function percentOfTotal(part: number, total: number): number | null {
  if (!Number.isFinite(part) || !Number.isFinite(total) || total <= 0) {
    return null;
  }
  return Math.round((part / total) * 100);
}

/** Builds the KPI-row tiles for the dashboard from the overview payload. */
export function buildOverviewTiles(overview: AdminOverview): OverviewTile[] {
  const activePct = percentOfTotal(overview.active_users, overview.total_users);
  const verifiedPct = percentOfTotal(
    overview.verified_users,
    overview.total_users,
  );
  return [
    {
      key: "total_users",
      label: "Total users",
      value: formatStatValue(overview.total_users),
    },
    {
      key: "active_users",
      label: "Active users",
      value: formatStatValue(overview.active_users),
      hint: activePct === null ? undefined : `${activePct}% of total`,
    },
    {
      key: "admins",
      label: "Admins",
      value: formatStatValue(overview.admins),
    },
    {
      key: "verified_users",
      label: "Verified users",
      value: formatStatValue(overview.verified_users),
      hint: verifiedPct === null ? undefined : `${verifiedPct}% of total`,
    },
    {
      key: "recent_signups_7d",
      label: "Signups (7 days)",
      value: formatStatValue(overview.recent_signups_7d),
    },
  ];
}
