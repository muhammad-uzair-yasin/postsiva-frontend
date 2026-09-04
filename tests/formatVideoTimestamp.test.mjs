import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

const player = readFileSync(
  join(root, "app/(workspace)/_components/WorkspaceVideoWithControls.tsx"),
  "utf8",
);

assert.match(player, /type="range"/);
assert.match(player, /formatVideoTimestamp/);
assert.match(player, /volume_off/);
assert.match(player, /fullscreen/);

const cardFiles = [
  "app/(workspace)/content-manager/_components/ContentManagerCard.tsx",
  "app/(workspace)/content-manager/_components/ContentManagerScheduledPipelineCard.tsx",
  "app/(workspace)/content-manager/_components/ContentManagerScheduledColumnPostCell.tsx",
  "app/(workspace)/post-scheduler/calendar/_components/CalendarPostCard.tsx",
  "app/(workspace)/post-scheduler/calendar/_components/CalendarWeekPostCard.tsx",
  "app/(workspace)/post-scheduler/calendar/_components/CalendarPostHoverPreview.tsx",
];

for (const relativePath of cardFiles) {
  const source = readFileSync(join(root, relativePath), "utf8");
  assert.match(
    source,
    /WorkspaceVideoWithControls/,
    `${relativePath} should use WorkspaceVideoWithControls`,
  );
}

const timestampUtil = readFileSync(join(root, "lib/ui/formatVideoTimestamp.ts"), "utf8");
assert.match(timestampUtil, /export function formatVideoTimestamp/);

console.log("formatVideoTimestamp + video card wiring tests passed");
