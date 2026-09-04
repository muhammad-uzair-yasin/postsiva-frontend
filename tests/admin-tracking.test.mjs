import assert from "node:assert/strict";
import test from "node:test";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const outDir = mkdtempSync(join(tmpdir(), "postsiva-admin-tracking-"));
const require = createRequire(import.meta.url);

execFileSync(
  join(process.cwd(), "node_modules/.bin/tsc"),
  [
    "lib/admin/trackingApi.ts",
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
  BULK_RECIPIENT_LIMIT,
  bulkResultSummary,
  describeApiError,
  displayName,
  filterPerUserRows,
  formatCount,
  niceTicks,
  recipientPreview,
  roundedBarPath,
  selectAllVisible,
  sortPerUserRows,
  statTiles,
  toggleSelection,
  usageMixBars,
} = require(join(outDir, "trackingApi.js"));

function row(overrides = {}) {
  return {
    user_id: "u1",
    email: "a@x.com",
    username: "a",
    full_name: "Alice A",
    post_generation_count: 0,
    image_generation_count: 0,
    message_count: 0,
    tool_call_count: 0,
    post_published_count: 0,
    comments_posted_count: 0,
    api_route_hits_total: 0,
    ...overrides,
  };
}

const rows = [
  row({ user_id: "u1", email: "alice@x.com", full_name: "Alice A", api_route_hits_total: 5 }),
  row({ user_id: "u2", email: "bob@y.com", full_name: "", username: "bobby", api_route_hits_total: 30 }),
  row({ user_id: "u3", email: "carol@z.com", full_name: "Carol C", api_route_hits_total: 30, post_generation_count: 7 }),
];

test("displayName prefers full_name, falls back to username, trims", () => {
  assert.equal(displayName({ full_name: "  Jo Doe  ", username: "jo" }), "Jo Doe");
  assert.equal(displayName({ full_name: "", username: "jo" }), "jo");
  assert.equal(displayName({ full_name: null, username: null }), "");
});

test("filterPerUserRows matches email, name, username, and user id (case-insensitive)", () => {
  assert.equal(filterPerUserRows(rows, "ALICE").length, 1);
  assert.equal(filterPerUserRows(rows, "bobby")[0].user_id, "u2");
  assert.equal(filterPerUserRows(rows, "u3")[0].email, "carol@z.com");
  assert.equal(filterPerUserRows(rows, "  ").length, 3);
  assert.equal(filterPerUserRows(rows, "nomatch").length, 0);
});

test("sortPerUserRows sorts numerically and is stable on ties", () => {
  const desc = sortPerUserRows(rows, "api_route_hits_total", "desc");
  assert.deepEqual(
    desc.map((r) => r.user_id),
    ["u2", "u3", "u1"],
  );
  const asc = sortPerUserRows(rows, "api_route_hits_total", "asc");
  assert.deepEqual(
    asc.map((r) => r.user_id),
    ["u1", "u2", "u3"],
  );
  assert.deepEqual(
    rows.map((r) => r.user_id),
    ["u1", "u2", "u3"],
    "input array is not mutated",
  );
});

test("sortPerUserRows sorts strings case-insensitively (name uses displayName)", () => {
  const byName = sortPerUserRows(rows, "name", "asc");
  assert.deepEqual(
    byName.map((r) => r.user_id),
    ["u1", "u2", "u3"],
  );
  const byEmailDesc = sortPerUserRows(rows, "email", "desc");
  assert.equal(byEmailDesc[0].email, "carol@z.com");
});

test("toggleSelection adds and removes ids without mutating", () => {
  const s1 = toggleSelection([], "u1");
  assert.deepEqual(s1, ["u1"]);
  const s2 = toggleSelection(s1, "u2");
  assert.deepEqual(s2, ["u1", "u2"]);
  assert.deepEqual(toggleSelection(s2, "u1"), ["u2"]);
  assert.deepEqual(s1, ["u1"]);
});

test("selectAllVisible selects all visible rows, then clears when all selected", () => {
  assert.deepEqual(selectAllVisible([], rows), ["u1", "u2", "u3"]);
  assert.deepEqual(selectAllVisible(["u1", "u2", "u3"], rows), []);
  assert.deepEqual(selectAllVisible(["u1"], rows), ["u1", "u2", "u3"]);
  assert.deepEqual(selectAllVisible([], []), []);
});

test("recipientPreview shows email (name) lines and caps with a more-line", () => {
  assert.deepEqual(recipientPreview(rows, ["u2", "u1"]), [
    "bob@y.com (bobby)",
    "alice@x.com (Alice A)",
  ]);
  assert.deepEqual(recipientPreview(rows, ["unknown-id"]), ["unknown-id"]);
  const noName = recipientPreview([row({ user_id: "u9", email: "e@x.com", full_name: "", username: "" })], ["u9"]);
  assert.deepEqual(noName, ["e@x.com (—)"]);
  const manyIds = Array.from({ length: 15 }, () => "u1");
  const preview = recipientPreview(rows, manyIds, 12);
  assert.equal(preview.length, 13);
  assert.equal(preview[12], "… and 3 more");
});

test("bulk recipient limit matches the server contract", () => {
  assert.equal(BULK_RECIPIENT_LIMIT, 100);
});

test("statTiles maps the ten legacy total cards in order", () => {
  const tiles = statTiles({
    success: true,
    workspace_usage_totals: {
      post_generation_count: 1,
      image_generation_count: 2,
      message_count: 6,
      tool_call_count: 3,
      post_published_count: 4,
      comments_posted_count: 5,
    },
    api_route_hits_totals: { total_hits: 7, distinct_users: 8, distinct_route_keys: 9 },
    users_with_tracking_activity: 10,
    top_route_keys: [],
    per_user: [],
  });
  assert.deepEqual(
    tiles.map((t) => t.value),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  );
  assert.equal(tiles[0].label, "Post generation");
  assert.equal(tiles[9].label, "Users w/ activity");
});

test("usageMixBars maps the six workspace counters", () => {
  const bars = usageMixBars({
    post_generation_count: 1,
    image_generation_count: 2,
    message_count: 6,
    tool_call_count: 3,
    post_published_count: 4,
    comments_posted_count: 5,
  });
  assert.equal(bars.length, 6);
  assert.deepEqual(bars.map((b) => b.value), [1, 2, 3, 4, 5, 6]);
});

test("niceTicks produces clean 1/2/5 steps covering the max", () => {
  assert.deepEqual(niceTicks(0), [0, 1]);
  assert.deepEqual(niceTicks(-5), [0, 1]);
  assert.deepEqual(niceTicks(4), [0, 1, 2, 3, 4]);
  assert.deepEqual(niceTicks(97), [0, 50, 100]);
  assert.deepEqual(niceTicks(1000), [0, 250, 500, 750, 1000]);
  const t = niceTicks(1234);
  assert.equal(t[0], 0);
  assert.ok(t[t.length - 1] >= 1234);
});

test("roundedBarPath rounds only the data end and handles degenerate sizes", () => {
  assert.equal(roundedBarPath(0, 0, 0, 20), "");
  assert.equal(roundedBarPath(0, 0, -5, 20), "");
  const p = roundedBarPath(10, 5, 100, 20, 4);
  assert.ok(p.startsWith("M10,5 h96 "), p);
  assert.ok(p.endsWith("h-96 z"), p);
  assert.ok(p.includes("a4,4"), "uses 4px radius arcs");
  const thin = roundedBarPath(0, 0, 2, 20, 4);
  assert.ok(thin.includes("a2,2"), "radius clamps to bar width");
});

test("formatCount formats with thousands separators and dashes non-numbers", () => {
  assert.equal(formatCount(1234567), "1,234,567");
  assert.equal(formatCount(0), "0");
  assert.equal(formatCount(null), "—");
  assert.equal(formatCount(undefined), "—");
  assert.equal(formatCount(Number.NaN), "—");
});

test("describeApiError handles string and FastAPI-array details", () => {
  assert.equal(describeApiError({ detail: "Nope" }, "fallback"), "Nope");
  assert.equal(
    describeApiError({ detail: [{ msg: "bad id" }, { msg: "too many" }] }, "f"),
    "bad id too many",
  );
  assert.equal(describeApiError({}, "fallback"), "fallback");
  assert.equal(describeApiError(null, "fallback"), "fallback");
});

test("bulkResultSummary appends failure lines like the legacy alert", () => {
  assert.equal(
    bulkResultSummary({ success: true, sent: 3, failed: [], detail: "Sent 3 email(s)." }),
    "Sent 3 email(s).",
  );
  assert.equal(
    bulkResultSummary({
      success: true,
      sent: 1,
      failed: [{ user_id: "u2", detail: "SMTP down" }],
      detail: "Sent 1 of 2.",
    }),
    "Sent 1 of 2.\n\nFailed:\nu2: SMTP down",
  );
  assert.equal(
    bulkResultSummary({ success: true, sent: 2, failed: [], detail: "" }),
    "Sent 2 email(s).",
  );
});

test.after(() => {
  rmSync(outDir, { recursive: true, force: true });
});
