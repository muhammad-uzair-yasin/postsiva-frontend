/**
 * Admin AI usage financials: types + pure helpers (spec 037 T15).
 * Types mirror postsiva-backend app/modules/ai_usage (service.py, reconciliation.py,
 * provider_snapshots.py). All `*_usd` fields are USD floats already converted from
 * ledger micros server-side; `*_usd_micros` fields (refresh balance rows) are raw micros.
 *
 * Import-free by design so tests can tsc-compile this file standalone
 * (same pattern as tests/admin-guard.test.mjs). Network calls live in the
 * page hooks, which pair these path builders with lib/admin/adminFetch.
 */

export type AiUsageProviderId = "openrouter" | "pollinations";

export const AI_USAGE_PROVIDERS: AiUsageProviderId[] = [
  "openrouter",
  "pollinations",
];

export interface AdminProviderSnapshot {
  provider: string;
  status: string;
  balance_usd: number | null;
  used_usd: number | null;
  total_used_usd: number | null;
  total_funded_usd: number | null;
  paid_used_usd: number | null;
  tier_used_usd: number | null;
  usage_window_days: number | null;
  fetched_at: string | null;
  error_code: string | null;
}

export interface AdminOverviewTotals {
  customer_payments_usd: number;
  customer_paid_usd: number;
  paddle_fees_usd: number;
  paddle_net_earnings_usd: number;
  net_earnings_usd: number;
  provider_cost_usd: number;
  allowance_consumed_usd: number;
  contribution_after_ai_usd: number;
  remaining_exposure_usd: number;
  ai_cost_ratio: number | null;
}

export interface AdminOverviewResponse {
  providers: AdminProviderSnapshot[];
  totals: AdminOverviewTotals;
}

export interface AdminCustomerRow {
  owner_user_id: string;
  email: string | null;
  plan_id: string | null;
  provider_cost_usd: number;
  credits_charged: number;
  credits_remaining: number;
  allowance_consumed_usd: number;
  paddle_net_earnings_usd: number;
  net_earnings_usd: number;
  customer_paid_usd: number;
  ai_cost_ratio: number;
  contribution_after_ai_usd: number;
}

export interface AdminCustomersResponse {
  items: AdminCustomerRow[];
}

export interface AdminOperationRecord {
  id: string;
  idempotency_key: string;
  owner_user_id: string | null;
  workspace_id: string | null;
  actor_user_id: string | null;
  parent_operation_id: string | null;
  operation_type: string;
  channel: string;
  status: string;
  billing_mode: string;
  policy_version: string;
  reserved_credits: number;
  charged_credits: number;
  provider_cost_usd_micros: number | null;
  cost_status: string;
  attempt_count: number;
  started_at: string;
  finished_at: string | null;
  created_at: string;
  error_code: string | null;
}

export interface AdminOperationAttempt {
  id: string;
  operation_id: string;
  attempt_index: number;
  provider: string;
  model: string;
  route_key: string;
  status: string;
  input_tokens: number | null;
  cached_input_tokens: number | null;
  output_tokens: number | null;
  reasoning_tokens: number | null;
  image_count: number | null;
  cost_usd_micros: number | null;
  latency_ms: number | null;
  started_at: string;
  finished_at: string | null;
  error_class: string | null;
}

export interface AdminOperationDetail {
  operation: AdminOperationRecord;
  attempts: AdminOperationAttempt[];
}

export interface ReconciliationOwnerRow {
  owner_user_id: string;
  legacy_credits_used: number;
  ledger_credits_charged: number;
  delta_credits: number;
  delta_ratio: number;
  operation_count: number;
  missing_ledger: boolean;
  materially_divergent: boolean;
}

export interface ReconciliationReport {
  generated_at: string;
  summary: {
    owners: number;
    missing_ledger_owners: number;
    materially_divergent_owners: number;
    unknown_or_partial_cost_operations: number;
    stale_reserved_operations: number;
    duplicate_idempotency_keys: number;
    unattributed_operations: number;
  };
  owners: ReconciliationOwnerRow[];
  unknown_or_partial_operation_ids: string[];
  stale_reserved_operation_ids: string[];
}

export interface ProviderRefreshResult {
  provider: string;
  status: "ok" | "cached" | "error";
  prices_added: number;
  balance: {
    fetched_at?: string | null;
    error_code?: string | null;
  } | null;
}

const BASE = "/admin/api/ai/usage";

/** Contract paths (contracts/admin-api.md, "AI usage (financials)"). */
export const aiUsagePaths = {
  overview: () => `${BASE}/overview`,
  customers: () => `${BASE}/customers`,
  operation: (operationId: string) =>
    `${BASE}/operations/${encodeURIComponent(operationId)}`,
  reconciliation: () => `${BASE}/reconciliation`,
  providerRefresh: (provider: AiUsageProviderId) =>
    `${BASE}/providers/${provider}/refresh`,
};

/* ------------------------------------------------------------------ */
/* Pure helpers (unit-tested in tests/admin-ai-usage.test.mjs)         */
/* ------------------------------------------------------------------ */

/** Convert ledger micros (1e-6 USD) to USD; null/undefined → 0. */
export function usdFromMicros(micros: number | null | undefined): number {
  return (micros ?? 0) / 1_000_000;
}

/**
 * Legacy-parity accessor: prefer the direct USD float, fall back to micros.
 * Returns null only when neither field is present.
 */
export function pickUsd(
  direct: number | null | undefined,
  micros: number | null | undefined,
): number | null {
  if (direct !== null && direct !== undefined) return Number(direct);
  if (micros !== null && micros !== undefined) return usdFromMicros(micros);
  return null;
}

/**
 * Format a USD amount: $ + thousands separators, 2 decimals; sub-cent values
 * keep 4 decimals so real provider costs never render as "$0.00"; null → em dash.
 */
export function formatUsd(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const abs = Math.abs(value);
  const decimals = abs > 0 && abs < 0.01 ? 4 : 2;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/** Format a percentage (already 0–100 scale): "12.34%"; null → em dash. */
export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `${value.toFixed(2)}%`;
}

/** Locale-formatted integer count (credits, tokens); null → em dash. */
export function formatCount(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return Math.trunc(value).toLocaleString("en-US");
}

/** Human age of a snapshot: "just now", "5m ago", "3h ago", "2d ago"; null → "never". */
export function snapshotAge(
  fetchedAt: string | null | undefined,
  nowMs: number = Date.now(),
): string {
  if (!fetchedAt) return "never";
  const then = Date.parse(fetchedAt);
  if (Number.isNaN(then)) return "never";
  const seconds = Math.max(0, Math.floor((nowMs - then) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export type RatioSeverity = "ok" | "warn" | "critical";

/** AI cost as % of net earnings: <50 ok, 50–99.99 warn, ≥100 critical (cost ≥ revenue). */
export function ratioSeverity(ratio: number | null | undefined): RatioSeverity {
  const value = ratio ?? 0;
  if (value >= 100) return "critical";
  if (value >= 50) return "warn";
  return "ok";
}

/** Clamp a ratio to [0, max] for meter widths. */
export function clampPercent(value: number | null | undefined, max = 100): number {
  const v = value ?? 0;
  if (Number.isNaN(v) || v < 0) return 0;
  return Math.min(v, max);
}

/** Case-insensitive filter over email, plan and owner id (legacy parity + id). */
export function filterCustomers(
  rows: AdminCustomerRow[],
  query: string,
): AdminCustomerRow[] {
  const q = query.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter((row) =>
    `${row.email ?? ""} ${row.plan_id ?? ""} ${row.owner_user_id}`
      .toLowerCase()
      .includes(q),
  );
}

/** Sort customers by provider cost, highest first (stable for ties). */
export function sortCustomersByCost(rows: AdminCustomerRow[]): AdminCustomerRow[] {
  return [...rows].sort((a, b) => b.provider_cost_usd - a.provider_cost_usd);
}

/**
 * User-facing outcome for a provider refresh. "cached" means the backend's
 * 5-minute cooldown kept the previous snapshot.
 */
export function refreshOutcomeMessage(result: ProviderRefreshResult): {
  kind: "ok" | "cooldown" | "error";
  message: string;
} {
  if (result.status === "cached") {
    return {
      kind: "cooldown",
      message:
        "Snapshot is still fresh — the provider enforces a 5 minute refresh cooldown.",
    };
  }
  if (result.status === "error") {
    const code = result.balance?.error_code;
    return {
      kind: "error",
      message: code
        ? `Provider refresh failed (${code}).`
        : "Provider refresh failed.",
    };
  }
  return {
    kind: "ok",
    message:
      result.prices_added > 0
        ? `Refreshed — ${result.prices_added} price snapshot${result.prices_added === 1 ? "" : "s"} added.`
        : "Refreshed — balance updated, prices unchanged.",
  };
}

/** Operation duration in ms from started/finished timestamps, or null while running. */
export function operationDurationMs(
  startedAt: string,
  finishedAt: string | null | undefined,
): number | null {
  if (!finishedAt) return null;
  const start = Date.parse(startedAt);
  const end = Date.parse(finishedAt);
  if (Number.isNaN(start) || Number.isNaN(end)) return null;
  return Math.max(0, end - start);
}

/** Compact duration label: 850 → "850ms", 12_400 → "12.4s"; null → em dash. */
export function formatDurationMs(ms: number | null | undefined): string {
  if (ms === null || ms === undefined || Number.isNaN(ms)) return "—";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}
