import assert from "node:assert/strict";
import test from "node:test";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const outDir = mkdtempSync(join(tmpdir(), "postsiva-admin-analytics-"));
const require = createRequire(import.meta.url);

execFileSync(
  join(process.cwd(), "node_modules/.bin/tsc"),
  [
    "lib/admin/apiHitsApi.ts",
    "lib/admin/emailsApi.ts",
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

const {
  clampInt,
  clampApiHitsLimit,
  buildApiHitsPath,
  prevOffset,
  nextOffset,
  hasNextPage,
  apiHitsMetaLabel,
  hitDisplayName,
  formatSeenAt,
  feedbackEmailBody,
} = require(join(outDir, "apiHitsApi.js"));

const {
  clampEmailDays,
  clampRecentLimit,
  buildEmailAnalyticsPath,
  periodLabel,
  formatSentAt,
  formatStat,
} = require(join(outDir, "emailsApi.js"));

test("clampInt parses strings, clamps, and falls back on garbage", () => {
  assert.equal(clampInt("42", 100, 1, 500), 42);
  assert.equal(clampInt("9999", 100, 1, 500), 500);
  assert.equal(clampInt("0", 100, 1, 500), 1);
  assert.equal(clampInt("-3", 100, 1, 500), 1);
  assert.equal(clampInt("abc", 100, 1, 500), 100);
  assert.equal(clampInt("", 100, 1, 500), 100);
  assert.equal(clampInt(null, 100, 1, 500), 100);
  assert.equal(clampInt(250.9, 100, 1, 500), 250);
});

test("clampApiHitsLimit mirrors legacy 1..500 default 100", () => {
  assert.equal(clampApiHitsLimit(""), 100);
  assert.equal(clampApiHitsLimit("500"), 500);
  assert.equal(clampApiHitsLimit("501"), 500);
  assert.equal(clampApiHitsLimit("1"), 1);
});

test("buildApiHitsPath emits limit/offset and optional filters", () => {
  assert.equal(
    buildApiHitsPath({ limit: 100, offset: 0 }),
    "/admin/api/tracking/api-hits?limit=100&offset=0",
  );
  assert.equal(
    buildApiHitsPath({
      limit: 50,
      offset: 150,
      userId: "  abc-123  ",
      routeContains: "GET /workspaces",
    }),
    "/admin/api/tracking/api-hits?limit=50&offset=150&user_id=abc-123&route_key_contains=GET+%2Fworkspaces",
  );
  assert.equal(
    buildApiHitsPath({ limit: 10, offset: 0, userId: "   ", routeContains: "" }),
    "/admin/api/tracking/api-hits?limit=10&offset=0",
  );
});

test("pagination math never goes negative and detects last page", () => {
  assert.equal(prevOffset(0, 100), 0);
  assert.equal(prevOffset(50, 100), 0);
  assert.equal(prevOffset(300, 100), 200);
  assert.equal(nextOffset(200, 100), 300);
  assert.equal(hasNextPage(0, 100, 250), true);
  assert.equal(hasNextPage(200, 50, 250), false);
  assert.equal(hasNextPage(0, 0, 0), false);
});

test("apiHitsMetaLabel matches legacy meta line", () => {
  assert.equal(apiHitsMetaLabel(100, 250, 0), "Showing 100 of 250 rows (offset 0)");
  assert.equal(apiHitsMetaLabel(0, 0, 0), "Showing 0 of 0 rows (offset 0)");
});

test("hitDisplayName prefers full name, then username, trimmed", () => {
  assert.equal(hitDisplayName({ full_name: " Ada Lovelace ", username: "ada" }), "Ada Lovelace");
  assert.equal(hitDisplayName({ full_name: "", username: "ada" }), "ada");
  assert.equal(hitDisplayName({ full_name: "", username: "" }), "");
});

test("formatSeenAt handles missing and invalid dates like legacy formatDate", () => {
  assert.equal(formatSeenAt(null), "N/A");
  assert.equal(formatSeenAt(""), "N/A");
  assert.equal(formatSeenAt("not-a-date"), "N/A");
  assert.notEqual(formatSeenAt("2026-06-21T10:00:00Z"), "N/A");
});

test("feedbackEmailBody nulls out empty messages", () => {
  assert.deepEqual(feedbackEmailBody("u1", "  "), { user_id: "u1", message: null });
  assert.deepEqual(feedbackEmailBody("u1", " hi "), { user_id: "u1", message: "hi" });
});

test("email range clamps mirror legacy inputs", () => {
  assert.equal(clampEmailDays(""), 30);
  assert.equal(clampEmailDays("366"), 365);
  assert.equal(clampEmailDays("0"), 1);
  assert.equal(clampRecentLimit("junk"), 100);
  assert.equal(clampRecentLimit("501"), 500);
});

test("buildEmailAnalyticsPath emits days and recent_limit", () => {
  assert.equal(
    buildEmailAnalyticsPath(30, 100),
    "/admin/api/emails/analytics?days=30&recent_limit=100",
  );
});

test("periodLabel matches legacy 'Since ...Z (UTC)' format", () => {
  assert.equal(
    periodLabel("2026-06-21T00:00:00Z"),
    "Since 2026-06-21T00:00Z (UTC)",
  );
  assert.equal(periodLabel(null), "");
  assert.equal(periodLabel("garbage"), "");
});

test("formatSentAt matches legacy 'YYYY-MM-DD HH:MM:SS UTC'", () => {
  assert.equal(formatSentAt("2026-06-21T14:03:22Z"), "2026-06-21 14:03:22 UTC");
  assert.equal(formatSentAt(null), "—");
  assert.equal(formatSentAt("garbage"), "—");
});

test("formatStat shows em dash for missing values", () => {
  assert.equal(formatStat(7), "7");
  assert.equal(formatStat(null), "—");
  assert.equal(formatStat(undefined), "—");
});

test.after(() => {
  rmSync(outDir, { recursive: true, force: true });
});
