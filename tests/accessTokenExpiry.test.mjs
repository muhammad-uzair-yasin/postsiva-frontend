import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const outDir = mkdtempSync(join(tmpdir(), "postsiva-access-token-expiry-"));
const require = createRequire(import.meta.url);

function b64url(obj) {
  return Buffer.from(JSON.stringify(obj))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

try {
  execFileSync(
    join(process.cwd(), "node_modules/.bin/tsc"),
    [
      "lib/auth/accessTokenExpiry.ts",
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

  const expiry = require(join(outDir, "accessTokenExpiry.js"));

  const past = Math.floor(Date.now() / 1000) - 60;
  const future = Math.floor(Date.now() / 1000) + 3600;
  const expiredToken = `hdr.${b64url({ exp: past })}.sig`;
  const validToken = `hdr.${b64url({ exp: future })}.sig`;

  assert.equal(expiry.isAccessTokenExpired(expiredToken), true);
  assert.equal(expiry.isAccessTokenExpired(validToken), false);
  assert.equal(expiry.isAccessTokenExpired("not-a-jwt"), false);

  console.log("access token expiry tests passed");
} finally {
  rmSync(outDir, { recursive: true, force: true });
}
