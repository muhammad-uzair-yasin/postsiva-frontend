import assert from "node:assert/strict";
import test from "node:test";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const outDir = mkdtempSync(join(tmpdir(), "postsiva-paid-users-"));
const require = createRequire(import.meta.url);

execFileSync(
  join(process.cwd(), "node_modules/.bin/tsc"),
  [
    "lib/admin/paidUsersApi.ts",
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
  billingSourceLabel,
  atRiskLabel,
  paidUserDisplayName,
  eventTypeLabel,
  PAID_USER_FILTERS,
} = require(join(outDir, "paidUsersApi.js"));

test("billingSourceLabel maps known sources", () => {
  assert.equal(billingSourceLabel("admin"), "Admin grant");
  assert.equal(billingSourceLabel("paddle"), "Paddle payment");
  assert.equal(billingSourceLabel("referral"), "Referral Pro");
});

test("atRiskLabel maps past_due", () => {
  assert.equal(atRiskLabel("past_due"), "Past due");
});

test("paidUserDisplayName prefers full_name", () => {
  assert.equal(
    paidUserDisplayName({
      full_name: "Jane Doe",
      username: "jane",
      email: "j@x.com",
    }),
    "Jane Doe",
  );
});

test("eventTypeLabel humanizes snake_case", () => {
  assert.match(eventTypeLabel("paddle_transaction_completed"), /Transaction Completed/i);
});

test("PAID_USER_FILTERS includes at_risk", () => {
  assert.ok(PAID_USER_FILTERS.some((f) => f.id === "at_risk"));
});

rmSync(outDir, { recursive: true, force: true });
