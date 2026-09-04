import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const screen = readFileSync(
  join(
    process.cwd(),
    "app/(workspace)/content-manager/_components/ContentManagerScreen.tsx",
  ),
  "utf8",
);

assert.match(screen, /usePublishedPinterestUnifiedPosts\(pinterestLabel,/);
assert.match(screen, /refresh:\s*refreshPinterestPosts/);
assert.doesNotMatch(
  screen,
  /const pinterestPublishedPosts:\s*ContentManagerPost\[\]\s*=\s*\[\]/,
);
assert.doesNotMatch(
  screen,
  /const refreshPinterestPosts\s*=\s*async\s*\(\):\s*Promise<void>\s*=>\s*\{\}/,
);

console.log("Content Manager Pinterest wiring tests passed");
