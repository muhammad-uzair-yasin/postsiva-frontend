import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const hook = readFileSync(
  join(
    process.cwd(),
    "app/(workspace)/inbox/_hooks/useWorkspaceInboxComments.ts",
  ),
  "utf8",
);
const screen = readFileSync(
  join(
    process.cwd(),
    "app/(workspace)/inbox/_components/SocialInboxScreen.tsx",
  ),
  "utf8",
);

assert.match(hook, /const requestGenerationRef = useRef\(0\)/);
assert.match(hook, /requestGeneration === requestGenerationRef\.current/);
assert.match(hook, /requestGenerationRef\.current \+= 1;\s*setAllMessages\(\[\]\)/);
assert.match(hook, /\[selectedAccountId\]/);
assert.match(
  screen,
  /<SocialInboxScreenContent key=\{selectedAccountId \?\? "no-selected-account"\}/,
);

console.log("Inbox account-scope race regression tests passed");
