import assert from "node:assert/strict";
import test from "node:test";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const outDir = mkdtempSync(join(tmpdir(), "postsiva-plan-grant-"));
const require = createRequire(import.meta.url);

execFileSync(
  join(process.cwd(), "node_modules/.bin/tsc"),
  [
    "lib/admin/planGrantApi.ts",
    "lib/admin/usersApi.ts",
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

const { planDisplayLabel, buildPlanGrantPath, formatGrantExpiry } = require(
  join(outDir, "planGrantApi.js"),
);

test("buildPlanGrantPath encodes user id", () => {
  assert.equal(buildPlanGrantPath("abc/def"), "/admin/api/users/abc%2Fdef/plan-grant");
});

test("planDisplayLabel shows admin suffix", () => {
  assert.equal(
    planDisplayLabel({ effective_plan_id: "pro", admin_grant_active: true }),
    "Pro (admin)",
  );
  assert.equal(
    planDisplayLabel({ effective_plan_id: "starter", admin_grant_active: false }),
    "Starter",
  );
});

test("formatGrantExpiry formats ISO dates", () => {
  assert.equal(formatGrantExpiry("2026-03-01T00:00:00Z"), "Mar 1, 2026");
  assert.equal(formatGrantExpiry(null), "—");
});

test.after(() => {
  rmSync(outDir, { recursive: true, force: true });
});
