import assert from "node:assert/strict";
import test from "node:test";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const outDir = mkdtempSync(join(tmpdir(), "postsiva-admin-comment-watch-"));
const require = createRequire(import.meta.url);

execFileSync(
  join(process.cwd(), "node_modules/.bin/tsc"),
  [
    "lib/admin/commentWatchApi.ts",
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
  runStatusTone,
  formatRunPosts,
  sortRunsByStartedAt,
  watchCountLabel,
  watchUserLabel,
  truncateId,
  parseErrorSummary,
  formatWatchDate,
  formatCount,
} = require(join(outDir, "commentWatchApi.js"));

test("runStatusTone maps legacy statuses", () => {
  assert.equal(runStatusTone("success"), "success");
  assert.equal(runStatusTone("failed"), "error");
  assert.equal(runStatusTone("running"), "pending");
  assert.equal(runStatusTone(null), "pending");
  assert.equal(runStatusTone(undefined), "pending");
});

test("formatRunPosts matches legacy posts column", () => {
  assert.equal(
    formatRunPosts({ id: 1, posts_ok: 3, total_posts: 4, posts_failed: 1 }),
    "3/4 ok, 1 failed",
  );
  assert.equal(
    formatRunPosts({ id: 1, posts_ok: 4, total_posts: 4, posts_failed: 0 }),
    "4/4 ok",
  );
  assert.equal(formatRunPosts({ id: 1, posts_ok: 4, total_posts: 4 }), "4/4 ok");
  assert.equal(formatRunPosts({ id: 1, posts_ok: null, total_posts: 4 }), "—");
  assert.equal(formatRunPosts({ id: 1 }), "—");
});

test("sortRunsByStartedAt sorts newest first and keeps input intact", () => {
  const runs = [
    { id: 1, started_at: "2026-01-01T00:00:00Z" },
    { id: 2, started_at: "2026-03-01T00:00:00Z" },
    { id: 3, started_at: "2026-02-01T00:00:00Z" },
  ];
  const sorted = sortRunsByStartedAt(runs);
  assert.deepEqual(
    sorted.map((r) => r.id),
    [2, 3, 1],
  );
  assert.equal(runs[0].id, 1, "input array must not be mutated");
});

test("sortRunsByStartedAt sinks missing/invalid dates to the end", () => {
  const sorted = sortRunsByStartedAt([
    { id: 1 },
    { id: 2, started_at: "not-a-date" },
    { id: 3, started_at: "2026-02-01T00:00:00Z" },
  ]);
  assert.equal(sorted[0].id, 3);
  assert.deepEqual(new Set(sorted.slice(1).map((r) => r.id)), new Set([1, 2]));
});

test("watchCountLabel pluralizes like legacy", () => {
  assert.equal(watchCountLabel(0), "0 watches");
  assert.equal(watchCountLabel(1), "1 watch");
  assert.equal(watchCountLabel(2), "2 watches");
});

test("watchUserLabel prefers email, then username, then user id", () => {
  assert.equal(
    watchUserLabel({ id: 1, user_email: "a@b.c", user_username: "u", user_id: "x" }),
    "a@b.c",
  );
  assert.equal(watchUserLabel({ id: 1, user_username: "u", user_id: "x" }), "u");
  assert.equal(watchUserLabel({ id: 1, user_id: "x" }), "x");
  assert.equal(watchUserLabel({ id: 1 }), "—");
});

test("truncateId matches legacy 50-char behavior", () => {
  const long = "a".repeat(60);
  assert.equal(truncateId(long, 50), `${"a".repeat(47)}...`);
  assert.equal(truncateId(long, 50).length, 50);
  assert.equal(truncateId("short", 50), "short");
  assert.equal(truncateId(null, 50), "");
  assert.equal(truncateId(undefined, 50), "");
});

test("parseErrorSummary parses JSON entry arrays", () => {
  const raw = JSON.stringify([
    { post_id: "urn:li:1", error: "boom" },
    { post_id: "urn:li:2", error: "kaput" },
  ]);
  const parsed = parseErrorSummary(raw);
  assert.deepEqual(parsed, {
    entries: [
      { post_id: "urn:li:1", error: "boom" },
      { post_id: "urn:li:2", error: "kaput" },
    ],
  });
});

test("parseErrorSummary falls back to raw text", () => {
  assert.deepEqual(parseErrorSummary("plain failure"), { raw: "plain failure" });
  assert.deepEqual(parseErrorSummary("[]"), { raw: "[]" });
  assert.deepEqual(parseErrorSummary('{"a":1}'), { raw: '{"a":1}' });
});

test("parseErrorSummary returns null for empty input", () => {
  assert.equal(parseErrorSummary(null), null);
  assert.equal(parseErrorSummary(undefined), null);
  assert.equal(parseErrorSummary(""), null);
});

test("parseErrorSummary tolerates malformed entries", () => {
  const parsed = parseErrorSummary(JSON.stringify([null, { error: 5 }]));
  assert.deepEqual(parsed, {
    entries: [
      { post_id: "", error: "" },
      { post_id: "", error: "" },
    ],
  });
});

test("formatWatchDate em-dashes missing or invalid dates", () => {
  assert.equal(formatWatchDate(null), "—");
  assert.equal(formatWatchDate(undefined), "—");
  assert.equal(formatWatchDate("garbage"), "—");
  assert.notEqual(formatWatchDate("2026-01-15T10:30:00Z"), "—");
});

test("formatCount keeps zero but em-dashes null", () => {
  assert.equal(formatCount(0), "0");
  assert.equal(formatCount(7), "7");
  assert.equal(formatCount(null), "—");
  assert.equal(formatCount(undefined), "—");
});

test.after(() => {
  rmSync(outDir, { recursive: true, force: true });
});
