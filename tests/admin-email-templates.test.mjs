import assert from "node:assert/strict";
import test from "node:test";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const outDir = mkdtempSync(join(tmpdir(), "postsiva-email-templates-"));
const require = createRequire(import.meta.url);

execFileSync(
  join(process.cwd(), "node_modules/.bin/tsc"),
  [
    "lib/admin/emailTemplates.ts",
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
  ADMIN_EMAIL_TEMPLATES,
  filterEmailTemplates,
  getEmailTemplateById,
} = require(join(outDir, "emailTemplates.js"));

test("has at least 50 email templates", () => {
  assert.ok(ADMIN_EMAIL_TEMPLATES.length >= 50);
});

test("every template has id, subject, and body", () => {
  const ids = new Set();
  for (const t of ADMIN_EMAIL_TEMPLATES) {
    assert.ok(t.id);
    assert.ok(t.subject.trim());
    assert.ok(t.body.trim());
    assert.ok(!ids.has(t.id));
    ids.add(t.id);
  }
});

test("filterEmailTemplates by category and query", () => {
  const payment = filterEmailTemplates("payment", "");
  assert.ok(payment.length >= 8);
  assert.ok(payment.every((t) => t.category === "payment"));

  const trial = filterEmailTemplates("all", "trial");
  assert.ok(trial.some((t) => t.id.includes("trial")));
});

test("getEmailTemplateById returns a template", () => {
  assert.equal(getEmailTemplateById("welcome-day1")?.name, "Welcome — day 1");
  assert.equal(getEmailTemplateById("missing"), undefined);
});

test.after(() => {
  rmSync(outDir, { recursive: true, force: true });
});
