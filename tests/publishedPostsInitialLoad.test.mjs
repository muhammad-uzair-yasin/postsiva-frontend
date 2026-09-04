import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const outDir = mkdtempSync(join(tmpdir(), "postsiva-published-posts-initial-load-"));
const require = createRequire(import.meta.url);

const FILES = [
  "app/(workspace)/content-manager/_utils/publishedPostsInitialLoad.ts",
  "app/(workspace)/content-manager/_types/contentManagerTypes.ts",
  "lib/contentManager/ensureSelectedAccountPostsHydrated.ts",
  "lib/contentManager/publishedPostsWorkspaceCache.ts",
  "lib/workspace/headerAccountSelection.ts",
  "lib/auth/session.ts",
  "lib/workspace/workspaceHeaderAllPlatforms.ts",
];

try {
  execFileSync(
    join(process.cwd(), "node_modules/.bin/tsc"),
    [
      ...FILES,
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

  const { resolvePublishedPostsInitialLoad } = require(
    join(outDir, "app/(workspace)/content-manager/_utils/publishedPostsInitialLoad.js"),
  );

  assert.equal(
    resolvePublishedPostsInitialLoad({
      skip: false,
      isLoadingProfiles: false,
      accountId: undefined,
      workspaceId: "ws-1",
      token: "tok",
    }),
    "skip",
  );

  assert.equal(
    resolvePublishedPostsInitialLoad({
      skip: false,
      isLoadingProfiles: true,
      accountId: undefined,
      workspaceId: "ws-1",
      token: "tok",
    }),
    "wait",
  );

  console.log("publishedPostsInitialLoad.test.mjs: ok");
} finally {
  rmSync(outDir, { recursive: true, force: true });
}
