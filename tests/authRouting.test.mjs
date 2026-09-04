import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const outDir = mkdtempSync(join(tmpdir(), "postsiva-auth-routing-"));
const require = createRequire(import.meta.url);
const ts = require("typescript");

function transpileTo(outFile, sourcePath) {
  const compiled = ts.transpileModule(readFileSync(sourcePath, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  });
  writeFileSync(join(outDir, outFile), compiled.outputText);
}

try {
  transpileTo("types.js", "lib/auth/types.ts");
  transpileTo("onboarding.js", "lib/auth/onboarding.ts");
  transpileTo("workspaceOnboarding.js", "lib/auth/workspaceOnboarding.ts");
  transpileTo("sessionFailure.js", "lib/auth/sessionFailure.ts");
  writeFileSync(
    join(outDir, "session.js"),
    `"use strict";
exports.getStoredWorkspaces = () => [];
exports.setStoredWorkspaces = () => {};
`,
  );
  writeFileSync(
    join(outDir, "ensureActiveWorkspace.js"),
    `"use strict";
exports.ensureActiveWorkspaceId = () => null;
`,
  );
  transpileTo("getPostAuthPath.js", "lib/auth/getPostAuthPath.ts");

  const routing = require(join(outDir, "getPostAuthPath.js"));
  const workspaceOnboarding = require(join(outDir, "workspaceOnboarding.js"));
  const failure = require(join(outDir, "sessionFailure.js"));
  const complete = { must_set_password: false, email_verified: true };
  const unverified = { must_set_password: false, email_verified: false };
  const passwordRequired = { must_set_password: true, email_verified: false };
  const resolve = workspaceOnboarding.resolvePostAuthWorkspacePath;

  assert.equal(routing.getSafeNextPath("/inbox?filter=open"), "/inbox?filter=open");
  assert.equal(routing.getSafeNextPath("//evil.example/steal"), null);
  assert.equal(routing.getSafeNextPath("https://evil.example/steal"), null);

  assert.equal(resolve(0, null, true), "/onboarding/workspace");
  assert.equal(resolve(1, null, false), "/onboarding/connect");
  assert.equal(resolve(2, null, true), "/dashboard");
  assert.equal(resolve(1, "/content-manager?tab=draft", false), "/content-manager?tab=draft");

  assert.equal(
    workspaceOnboarding.defaultSkippedWorkspaceName("jane", "Jane Doe"),
    "jane workspace",
  );
  assert.equal(
    workspaceOnboarding.defaultSkippedWorkspaceName(null, "Jane Doe"),
    "Jane Doe workspace",
  );
  assert.equal(
    workspaceOnboarding.defaultSkippedWorkspaceName(null, null),
    "My workspace",
  );

  assert.equal(routing.getPostAuthPath(complete, { activeWorkspaceId: "ws" }), "/onboarding/workspace");
  assert.equal(routing.getPostAuthPath(unverified, { activeWorkspaceId: "ws" }), "/verify-otp");
  assert.equal(routing.getPostAuthPath(passwordRequired, { activeWorkspaceId: "ws" }), "/setup-password");
  assert.equal(routing.getPostAuthPath(complete, {}), "/onboarding/workspace");
  assert.equal(
    routing.getPostAuthPath(complete, {
      nextPath: "/dashboard",
      activeWorkspaceId: null,
    }),
    "/dashboard",
  );
  assert.equal(
    routing.getPostAuthPath(complete, {
      nextPath: "/content-manager?tab=draft",
      activeWorkspaceId: "ws",
    }),
    "/content-manager?tab=draft",
  );
  assert.equal(
    routing.getPostAuthPath(complete, {
      nextPath: "/login?next=/inbox",
      activeWorkspaceId: "ws",
    }),
    "/onboarding/workspace",
  );
  assert.equal(
    routing.getPostAuthPath(complete, {
      nextPath: "/signup",
    }),
    "/onboarding/workspace",
  );
  assert.equal(failure.shouldRedirectToLogin(510, null), true);
  assert.equal(failure.shouldRedirectToLogin(401, "TOKEN_EXPIRED"), true);
  assert.equal(failure.shouldRedirectToLogin(401, null), false);
  assert.equal(failure.shouldRedirectToLogin(401, "PLATFORM_TOKEN_EXPIRED"), false);

  console.log("auth routing tests passed");
} finally {
  rmSync(outDir, { recursive: true, force: true });
}
