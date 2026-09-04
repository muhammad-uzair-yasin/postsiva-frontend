import assert from "node:assert/strict";
import test from "node:test";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const outDir = mkdtempSync(join(tmpdir(), "postsiva-admin-guard-"));
const require = createRequire(import.meta.url);

execFileSync(
  join(process.cwd(), "node_modules/.bin/tsc"),
  [
    "lib/admin/guard.ts",
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

const { resolveAdminAccess, safeAdminNext, adminLoginRedirect } = require(
  join(outDir, "guard.js"),
);

test("no token redirects to admin login with next", () => {
  const d = resolveAdminAccess(false, null, "/admin/users");
  assert.equal(d.kind, "login");
  assert.equal(d.redirect, "/admin/login?next=%2Fadmin%2Fusers");
});

test("token without resolved user is allowed pending /auth/me", () => {
  assert.equal(resolveAdminAccess(true, null, "/admin").kind, "allow");
});

test("non-admin user is forbidden, not redirected", () => {
  const d = resolveAdminAccess(true, { is_admin: false, is_active: true }, "/admin");
  assert.equal(d.kind, "forbidden");
});

test("inactive admin is forbidden", () => {
  const d = resolveAdminAccess(true, { is_admin: true, is_active: false }, "/admin");
  assert.equal(d.kind, "forbidden");
});

test("active admin is allowed", () => {
  const d = resolveAdminAccess(true, { is_admin: true, is_active: true }, "/admin/workers");
  assert.equal(d.kind, "allow");
});

test("login redirect never escapes /admin", () => {
  assert.equal(adminLoginRedirect("/evil"), "/admin/login?next=%2Fadmin");
});

test("safeAdminNext rejects external and non-admin paths", () => {
  assert.equal(safeAdminNext(null), "/admin");
  assert.equal(safeAdminNext("/dashboard"), "/admin");
  assert.equal(safeAdminNext("//evil.com/admin"), "/admin");
  assert.equal(safeAdminNext("/admin/ai-usage"), "/admin/ai-usage");
});

test.after(() => {
  rmSync(outDir, { recursive: true, force: true });
});
