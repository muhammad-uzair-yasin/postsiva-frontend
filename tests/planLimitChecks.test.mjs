import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const outDir = mkdtempSync(join(tmpdir(), "postsiva-plan-limit-checks-"));
const require = createRequire(import.meta.url);

try {
  execFileSync(
    join(process.cwd(), "node_modules/.bin/tsc"),
    [
      "lib/billing/billingErrors.ts",
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

  const errors = require(join(outDir, "billingErrors.js"));

  assert.equal(
    errors.billingErrorToPlanLimitKind("connected_account_limit"),
    "connected_accounts",
  );
  assert.equal(errors.billingErrorToPlanLimitKind("workspace_limit"), "workspaces");
  assert.equal(
    errors.billingErrorToPlanLimitKind("team_member_limit"),
    "team_members",
  );
  assert.equal(errors.billingErrorToPlanLimitKind("plan_required"), null);

  console.log("planLimitChecks.test.mjs: ok");
} finally {
  rmSync(outDir, { recursive: true, force: true });
}
