import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

const util = readFileSync(join(root, "lib/workspace/linkedInScheduledPlatformUserId.ts"), "utf8");
assert.match(util, /export function normalizeLinkedInScheduledPlatformUserId/);
assert.match(util, /export function linkedInMemberPlatformUserId/);

const queryMap = readFileSync(
  join(
    root,
    "app/(workspace)/content-manager/_utils/headerAccountRowToUnifiedScheduledPostsQuery.ts",
  ),
  "utf8",
);
assert.match(queryMap, /linkedInMemberPlatformUserId/);
assert.match(queryMap, /normalizeLinkedInScheduledPlatformUserId/);
assert.match(queryMap, /row\.id\.trim\(\) === "linkedin"/);

const filter = readFileSync(
  join(
    root,
    "app/(workspace)/content-manager/_utils/contentManagerScheduledPostMatchesChannelFilter.ts",
  ),
  "utf8",
);
assert.match(filter, /linkedInScheduledPostIsPersonal/);
assert.match(filter, /channelFilter === "linkedin"/);

const refresh = readFileSync(
  join(root, "lib/contentManager/contentManagerScheduledRefresh.ts"),
  "utf8",
);
assert.match(refresh, /invalidateAccountIds/);

console.log("LinkedIn scheduled calendar filter wiring tests passed");
