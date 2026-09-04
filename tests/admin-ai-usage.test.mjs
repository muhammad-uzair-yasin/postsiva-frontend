import assert from "node:assert/strict";
import test from "node:test";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const outDir = mkdtempSync(join(tmpdir(), "postsiva-admin-ai-usage-"));
const require = createRequire(import.meta.url);

execFileSync(
  join(process.cwd(), "node_modules/.bin/tsc"),
  [
    "lib/admin/aiUsageAdminApi.ts",
    "--outDir",
    outDir,
    "--module",
    "commonjs",
    "--target",
    "es2020",
    "--esModuleInterop",
    "--skipLibCheck",
  ],
  { stdio: "inherit" },
);

const api = require(join(outDir, "aiUsageAdminApi.js"));

test("aiUsagePaths match the admin API contract", () => {
  assert.equal(api.aiUsagePaths.overview(), "/admin/api/ai/usage/overview");
  assert.equal(api.aiUsagePaths.customers(), "/admin/api/ai/usage/customers");
  assert.equal(
    api.aiUsagePaths.operation("0b6f4b0e-1"),
    "/admin/api/ai/usage/operations/0b6f4b0e-1",
  );
  assert.equal(
    api.aiUsagePaths.reconciliation(),
    "/admin/api/ai/usage/reconciliation",
  );
  assert.equal(
    api.aiUsagePaths.providerRefresh("openrouter"),
    "/admin/api/ai/usage/providers/openrouter/refresh",
  );
  assert.deepEqual(api.AI_USAGE_PROVIDERS, ["openrouter", "pollinations"]);
});

test("usdFromMicros converts ledger micros to dollars", () => {
  assert.equal(api.usdFromMicros(1_000_000), 1);
  assert.equal(api.usdFromMicros(1_234_500), 1.2345);
  assert.equal(api.usdFromMicros(0), 0);
  assert.equal(api.usdFromMicros(null), 0);
  assert.equal(api.usdFromMicros(undefined), 0);
});

test("pickUsd prefers direct USD floats, falls back to micros", () => {
  assert.equal(api.pickUsd(12.5, 99_000_000), 12.5);
  assert.equal(api.pickUsd(0, 99_000_000), 0);
  assert.equal(api.pickUsd(null, 2_500_000), 2.5);
  assert.equal(api.pickUsd(undefined, undefined), null);
});

test("formatUsd uses $, separators and sensible precision", () => {
  assert.equal(api.formatUsd(1234.5), "$1,234.50");
  assert.equal(api.formatUsd(0), "$0.00");
  assert.equal(api.formatUsd(-3.2), "-$3.20");
  // Sub-cent provider costs keep 4 decimals instead of collapsing to $0.00.
  assert.equal(api.formatUsd(0.0042), "$0.0042");
  assert.equal(api.formatUsd(0.01), "$0.01");
  assert.equal(api.formatUsd(null), "—");
  assert.equal(api.formatUsd(undefined), "—");
});

test("formatPercent and formatCount handle nulls", () => {
  assert.equal(api.formatPercent(12.345), "12.35%");
  assert.equal(api.formatPercent(0), "0.00%");
  assert.equal(api.formatPercent(null), "—");
  assert.equal(api.formatCount(1234567), "1,234,567");
  assert.equal(api.formatCount(null), "—");
});

test("snapshotAge buckets by minutes, hours and days", () => {
  const now = Date.parse("2026-07-21T12:00:00Z");
  assert.equal(api.snapshotAge("2026-07-21T11:59:40Z", now), "just now");
  assert.equal(api.snapshotAge("2026-07-21T11:55:00Z", now), "5m ago");
  assert.equal(api.snapshotAge("2026-07-21T09:00:00Z", now), "3h ago");
  assert.equal(api.snapshotAge("2026-07-19T11:00:00Z", now), "2d ago");
  assert.equal(api.snapshotAge(null, now), "never");
  assert.equal(api.snapshotAge("not-a-date", now), "never");
});

test("ratioSeverity thresholds: <50 ok, 50-99.99 warn, >=100 critical", () => {
  assert.equal(api.ratioSeverity(0), "ok");
  assert.equal(api.ratioSeverity(49.99), "ok");
  assert.equal(api.ratioSeverity(50), "warn");
  assert.equal(api.ratioSeverity(99.99), "warn");
  assert.equal(api.ratioSeverity(100), "critical");
  assert.equal(api.ratioSeverity(250), "critical");
  assert.equal(api.ratioSeverity(null), "ok");
});

test("clampPercent bounds meter widths", () => {
  assert.equal(api.clampPercent(42), 42);
  assert.equal(api.clampPercent(180), 100);
  assert.equal(api.clampPercent(-5), 0);
  assert.equal(api.clampPercent(null), 0);
});

const customers = [
  {
    owner_user_id: "aaa-1",
    email: "alice@example.com",
    plan_id: "pro",
    provider_cost_usd: 4.2,
  },
  {
    owner_user_id: "bbb-2",
    email: "bob@example.com",
    plan_id: "starter",
    provider_cost_usd: 9.9,
  },
  {
    owner_user_id: "ccc-3",
    email: null,
    plan_id: null,
    provider_cost_usd: 0.5,
  },
];

test("filterCustomers matches email, plan and owner id, case-insensitive", () => {
  assert.equal(api.filterCustomers(customers, "").length, 3);
  assert.deepEqual(
    api.filterCustomers(customers, "ALICE").map((r) => r.owner_user_id),
    ["aaa-1"],
  );
  assert.deepEqual(
    api.filterCustomers(customers, "starter").map((r) => r.owner_user_id),
    ["bbb-2"],
  );
  assert.deepEqual(
    api.filterCustomers(customers, "ccc-3").map((r) => r.owner_user_id),
    ["ccc-3"],
  );
  assert.equal(api.filterCustomers(customers, "zzz").length, 0);
});

test("sortCustomersByCost is descending and non-mutating", () => {
  const sorted = api.sortCustomersByCost(customers);
  assert.deepEqual(
    sorted.map((r) => r.owner_user_id),
    ["bbb-2", "aaa-1", "ccc-3"],
  );
  assert.equal(customers[0].owner_user_id, "aaa-1");
});

test("refreshOutcomeMessage maps ok / cached / error results", () => {
  const ok = api.refreshOutcomeMessage({
    provider: "openrouter",
    status: "ok",
    prices_added: 3,
    balance: {},
  });
  assert.equal(ok.kind, "ok");
  assert.match(ok.message, /3 price snapshots/);

  const okNone = api.refreshOutcomeMessage({
    provider: "openrouter",
    status: "ok",
    prices_added: 0,
    balance: {},
  });
  assert.equal(okNone.kind, "ok");
  assert.match(okNone.message, /prices unchanged/);

  const cooldown = api.refreshOutcomeMessage({
    provider: "pollinations",
    status: "cached",
    prices_added: 0,
    balance: {},
  });
  assert.equal(cooldown.kind, "cooldown");
  assert.match(cooldown.message, /cooldown/);

  const error = api.refreshOutcomeMessage({
    provider: "pollinations",
    status: "error",
    prices_added: 0,
    balance: { error_code: "AUTH_FAILED" },
  });
  assert.equal(error.kind, "error");
  assert.match(error.message, /AUTH_FAILED/);
});

test("operationDurationMs and formatDurationMs", () => {
  assert.equal(
    api.operationDurationMs("2026-07-21T12:00:00Z", "2026-07-21T12:00:12.400Z"),
    12_400,
  );
  assert.equal(api.operationDurationMs("2026-07-21T12:00:00Z", null), null);
  assert.equal(api.operationDurationMs("bad", "2026-07-21T12:00:12Z"), null);
  assert.equal(api.formatDurationMs(850), "850ms");
  assert.equal(api.formatDurationMs(12_400), "12.4s");
  assert.equal(api.formatDurationMs(null), "—");
});

test.after(() => {
  rmSync(outDir, { recursive: true, force: true });
});
