import assert from "node:assert/strict";
import test from "node:test";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const outDir = mkdtempSync(join(tmpdir(), "postsiva-scheduled-posts-"));
const require = createRequire(import.meta.url);

execFileSync(
  join(process.cwd(), "node_modules/.bin/tsc"),
  [
    "lib/admin/scheduledPostsApi.ts",
    "lib/admin/workersApi.ts",
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

const { canCancelScheduledPost, canPublishNowScheduledPost } = require(
  join(outDir, "scheduledPostsApi.js"),
);
const { describeWorkerRunLog } = require(join(outDir, "workersApi.js"));

test("canCancelScheduledPost allows scheduled and failed", () => {
  assert.equal(canCancelScheduledPost("scheduled"), true);
  assert.equal(canCancelScheduledPost("failed"), true);
  assert.equal(canCancelScheduledPost("published"), false);
});

test("canPublishNowScheduledPost", () => {
  assert.equal(canPublishNowScheduledPost("scheduled"), true);
  assert.equal(canPublishNowScheduledPost("publishing"), false);
});

test("describeWorkerRunLog for process_due", () => {
  const d = describeWorkerRunLog({
    worker_id: "process_due_scheduled_posts",
    status: "SUCCESS",
    result_json: { due: 3, published_ok: 2, published_fail: 1 },
    duration_seconds: 4.2,
    triggered_by: "admin",
  });
  assert.match(d.headline, /Found 3 due/);
  assert.ok(d.lines.some((l) => l.includes("Published successfully: 2")));
});

rmSync(outDir, { recursive: true, force: true });
