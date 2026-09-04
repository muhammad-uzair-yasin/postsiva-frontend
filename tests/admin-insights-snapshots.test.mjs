import assert from "node:assert/strict";
import test from "node:test";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const outDir = mkdtempSync(join(tmpdir(), "postsiva-insights-snapshots-"));
const require = createRequire(import.meta.url);

execFileSync(
  join(process.cwd(), "node_modules/.bin/tsc"),
  [
    "lib/admin/insightsSnapshotsGrantUtils.ts",
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

const { buildGrantsFromWorkspaces } = require(join(outDir, "insightsSnapshotsGrantUtils.js"));

const INSIGHTS_SNAPSHOTS_USERS_PATH = "/admin/api/insights-snapshots/users";
function insightsSnapshotUserPath(userId) {
  return `${INSIGHTS_SNAPSHOTS_USERS_PATH}/${encodeURIComponent(userId)}`;
}

test("insightsSnapshotUserPath encodes user id", () => {
  assert.equal(
    insightsSnapshotUserPath("abc-123"),
    `${INSIGHTS_SNAPSHOTS_USERS_PATH}/abc-123`,
  );
});

test("buildGrantsFromWorkspaces emits platform and sub-account rows", () => {
  const grants = buildGrantsFromWorkspaces([
    {
      id: "ws1",
      name: "Main",
      selected: true,
      platforms: [
        {
          id: "instagram",
          label: "Instagram",
          connected: true,
          selected: true,
          sub_accounts: [],
        },
        {
          id: "linkedin",
          label: "LinkedIn",
          connected: true,
          selected: true,
          sub_accounts: [
            {
              id: "__linkedin_personal__",
              label: "Personal",
              account_type: "linkedin_personal",
              selected: true,
            },
          ],
        },
      ],
    },
  ]);
  assert.equal(grants.length, 2);
  assert.deepEqual(grants[0], {
    workspace_id: "ws1",
    platform: "instagram",
    enabled: true,
  });
  assert.equal(grants[1].account_id, "__linkedin_personal__");
});

rmSync(outDir, { recursive: true, force: true });
