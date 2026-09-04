import assert from "node:assert/strict";
import test from "node:test";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const outDir = mkdtempSync(join(tmpdir(), "postsiva-admin-workers-"));
const require = createRequire(import.meta.url);

execFileSync(
  join(process.cwd(), "node_modules/.bin/tsc"),
  [
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

const {
  applyWorkerPatch,
  configFileName,
  formatDateTime,
  normalizePendingTasks,
  normalizeProcessDueResult,
  normalizeScheduledTasks,
  normalizeWorker,
  normalizeWorkersStatus,
  parseIntervalMinutes,
  scheduledStatusTone,
  scheduledTasksPath,
  summarizeProcessDue,
  summarizeRunResult,
  truncateText,
  workerConfigPatchPath,
} = require(join(outDir, "workersApi.js"));

test("workerConfigPatchPath encodes worker ids", () => {
  assert.equal(
    workerConfigPatchPath("process_due_scheduled_posts"),
    "/admin/api/workers/config/process_due_scheduled_posts",
  );
  assert.equal(
    workerConfigPatchPath("weird id/x"),
    "/admin/api/workers/config/weird%20id%2Fx",
  );
});

test("scheduledTasksPath clamps invalid limits to 100", () => {
  assert.equal(
    scheduledTasksPath(100),
    "/admin/api/workers/scheduled-tasks?limit=100",
  );
  assert.equal(
    scheduledTasksPath(0),
    "/admin/api/workers/scheduled-tasks?limit=100",
  );
  assert.equal(
    scheduledTasksPath(Number.NaN),
    "/admin/api/workers/scheduled-tasks?limit=100",
  );
  assert.equal(
    scheduledTasksPath(25.7),
    "/admin/api/workers/scheduled-tasks?limit=25",
  );
});

test("normalizeWorker applies legacy defaults", () => {
  const w = normalizeWorker({ id: "job_a" });
  assert.equal(w.name, "job_a");
  assert.equal(w.enabled, true);
  assert.equal(w.interval_minutes, 30);
  assert.equal(w.last_run_at, null);
  assert.equal(w.last_run_error, null);
});

test("normalizeWorker keeps explicit fields and floors interval", () => {
  const w = normalizeWorker({
    id: "job_b",
    name: "Job B",
    description: "desc",
    enabled: false,
    interval_minutes: 15.9,
    last_run_at: "2026-07-20T10:00:00Z",
    last_run_result: { due: 2 },
    last_run_error: "boom",
  });
  assert.equal(w.name, "Job B");
  assert.equal(w.enabled, false);
  assert.equal(w.interval_minutes, 15);
  assert.deepEqual(w.last_run_result, { due: 2 });
  assert.equal(w.last_run_error, "boom");
});

test("normalizeWorkersStatus maps status payload and tolerates junk", () => {
  const s = normalizeWorkersStatus({
    workers: [{ id: "a" }, { id: "b", enabled: false }],
    queues: {},
    broker_connected: false,
    error: null,
    config_path: "/srv/app/workers_config.json",
    scheduling_note: "note",
  });
  assert.equal(s.workers.length, 2);
  assert.equal(s.workers[1].enabled, false);
  assert.equal(s.broker_connected, false);
  assert.equal(s.config_path, "/srv/app/workers_config.json");
  assert.equal(s.scheduling_note, "note");

  const junk = normalizeWorkersStatus(null);
  assert.deepEqual(junk.workers, []);
  assert.equal(junk.config_path, null);
});

test("normalizeScheduledTasks maps rows and rejects non-arrays", () => {
  assert.deepEqual(normalizeScheduledTasks({ nope: true }), []);
  const [t] = normalizeScheduledTasks([
    {
      scheduled_post_id: "sp1",
      user_id: "u1",
      user_email: "a@b.c",
      user_name: "Ana",
      platform: "linkedin",
      post_type: "text",
      scheduled_time: "2026-07-22T09:00:00Z",
      status: "scheduled",
      created_at: null,
    },
  ]);
  assert.equal(t.scheduled_post_id, "sp1");
  assert.equal(t.user_name, "Ana");
  assert.equal(t.platform, "linkedin");
  assert.equal(t.created_at, null);
});

test("normalizePendingTasks defaults kind to reserved", () => {
  assert.deepEqual(normalizePendingTasks("nope"), []);
  const [t] = normalizePendingTasks([{ task_name: "publish", eta: null }]);
  assert.equal(t.kind, "reserved");
  assert.equal(t.task_name, "publish");
  assert.equal(t.eta, null);
});

test("normalizeProcessDueResult maps job result", () => {
  const r = normalizeProcessDueResult({
    ok: true,
    skipped: false,
    due: 3,
    published_ok: 2,
    published_fail: 1,
    error: null,
  });
  assert.deepEqual(r, {
    ok: true,
    skipped: false,
    due: 3,
    published_ok: 2,
    published_fail: 1,
    error: null,
  });
  const empty = normalizeProcessDueResult(undefined);
  assert.equal(empty.ok, false);
  assert.equal(empty.due, 0);
});

test("applyWorkerPatch updates only the target worker immutably", () => {
  const list = [
    { id: "a", enabled: true, interval_minutes: 5 },
    { id: "b", enabled: true, interval_minutes: 10 },
  ];
  const next = applyWorkerPatch(list, "b", { enabled: false });
  assert.equal(next[0].enabled, true);
  assert.equal(next[1].enabled, false);
  assert.equal(list[1].enabled, true, "input list must not be mutated");
  const interval = applyWorkerPatch(list, "a", { interval_minutes: 60 });
  assert.equal(interval[0].interval_minutes, 60);
});

test("parseIntervalMinutes validates inline input", () => {
  assert.equal(parseIntervalMinutes("30"), 30);
  assert.equal(parseIntervalMinutes(" 5 "), 5);
  assert.equal(parseIntervalMinutes("0"), null);
  assert.equal(parseIntervalMinutes("-3"), null);
  assert.equal(parseIntervalMinutes("2.5"), null);
  assert.equal(parseIntervalMinutes("abc"), null);
  assert.equal(parseIntervalMinutes(""), null);
});

test("formatDateTime handles null and invalid dates", () => {
  assert.equal(formatDateTime(null), "—");
  assert.equal(formatDateTime(undefined), "—");
  assert.equal(formatDateTime("not-a-date"), "not-a-date");
  assert.notEqual(formatDateTime("2026-07-20T10:00:00Z"), "—");
});

test("configFileName strips both separators (legacy parity)", () => {
  assert.equal(configFileName("/srv/app/workers_config.json"), "workers_config.json");
  assert.equal(configFileName("C:\\srv\\workers_config.json"), "workers_config.json");
  assert.equal(configFileName(null), "workers_config.json");
});

test("summarizeRunResult matches legacy key=value summary", () => {
  assert.equal(summarizeRunResult(null), "—");
  assert.equal(summarizeRunResult("done"), "done");
  assert.equal(
    summarizeRunResult({ due: 3, published_ok: 2, published_fail: 1 }),
    "due=3 ok=2 fail=1",
  );
  assert.equal(
    summarizeRunResult({ run_id: "r1", videos_ok: 4, total_replies_posted: 7 }),
    "run_id=r1 videos_ok=4 replies=7",
  );
  assert.equal(summarizeRunResult({ unrelated: 1 }), "—");
});

test("truncateText appends ellipsis only when needed", () => {
  assert.equal(truncateText("short", 10), "short");
  assert.equal(truncateText("abcdef", 3), "abc…");
});

test("scheduledStatusTone maps status badges", () => {
  assert.equal(scheduledStatusTone("Scheduled"), "scheduled");
  assert.equal(scheduledStatusTone("publishing"), "publishing");
  assert.equal(scheduledStatusTone("failed"), "other");
  assert.equal(scheduledStatusTone(""), "other");
});

test("summarizeProcessDue covers skipped, error, and success", () => {
  assert.match(
    summarizeProcessDue({ ok: false, skipped: true, due: 0, published_ok: 0, published_fail: 0, error: null }),
    /Skipped/,
  );
  assert.match(
    summarizeProcessDue({ ok: false, skipped: false, due: 0, published_ok: 0, published_fail: 0, error: "db down" }),
    /Failed: db down/,
  );
  assert.equal(
    summarizeProcessDue({ ok: true, skipped: false, due: 3, published_ok: 2, published_fail: 1, error: null }),
    "Done — 3 due, 2 published, 1 failed.",
  );
});

test.after(() => {
  rmSync(outDir, { recursive: true, force: true });
});
