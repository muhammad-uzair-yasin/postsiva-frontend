import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = process.cwd();
const card = readFileSync(
  join(root, "app/(workspace)/post-scheduler/calendar/_components/CalendarWeekPostCard.tsx"),
  "utf8",
);
const grid = readFileSync(
  join(root, "app/(workspace)/post-scheduler/calendar/_components/PostSchedulerWeekGrid.tsx"),
  "utf8",
);

assert.match(card, /SocialPlatformIcon/);
assert.match(card, /hasRichContent/);
assert.match(card, /line-clamp-2/);

assert.doesNotMatch(grid, /totalRowCount/);
assert.doesNotMatch(grid, /flex-wrap/);
assert.doesNotMatch(grid, /w-\[15\.5rem\]/);
assert.match(grid, /grid-cols-\[3\.25rem_repeat\(7,minmax\(0,1fr\)\)\]/);
assert.match(grid, /buildCalendarWeekTimeGrid/);
assert.doesNotMatch(grid, /grid\.hours\.flatMap/);
assert.match(grid, /grid\.hours\.map/);
assert.match(grid, /formatHourLabel/);
assert.match(grid, /cell\.kind === "posts"/);
assert.match(grid, /cell\.kind === "empty"/);
assert.match(grid, /overflow-y-auto/);

const outDir = mkdtempSync(join(tmpdir(), "postsiva-calendar-week-"));
const require = createRequire(import.meta.url);

try {
  const ts = require("typescript");
  const compile = (name, source) => {
    const compiled = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
      },
    });
    writeFileSync(join(outDir, name), compiled.outputText);
  };

  compile(
    "weekUtils.js",
    readFileSync(
      join(
        root,
        "app/(workspace)/post-scheduler/calendar/_utils/postSchedulerCalendarWeekUtils.ts",
      ),
      "utf8",
    ),
  );

  let rowsSource = readFileSync(
    join(
      root,
      "app/(workspace)/post-scheduler/calendar/_utils/buildCalendarWeekDayRows.ts",
    ),
    "utf8",
  );
  rowsSource = rowsSource
    .replace('import type { CalendarPost } from "../_types/calendarTypes";\n', "")
    .replace(
      'import { localDayKey } from "./calendarData";',
      `function localDayKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return \`\${y}-\${m}-\${d}\`;
}`,
    )
    .replace(
      `import {
  addDays,
  startOfDay,
} from "./postSchedulerCalendarWeekUtils";`,
      'const { addDays, startOfDay } = require("./weekUtils");',
    );
  compile("dayRows.js", rowsSource);

  let accountSource = readFileSync(
    join(
      root,
      "app/(workspace)/post-scheduler/calendar/_utils/resolveCalendarPostAccount.ts",
    ),
    "utf8",
  );
  accountSource = accountSource
    .replace(
      'import type { WorkspaceHeaderAccountRow } from "@/lib/workspace/headerAccountsTypes";\n',
      "",
    )
    .replace(
      'import { isWorkspaceHeaderAllPlatformsId } from "@/lib/workspace/workspaceHeaderAllPlatforms";',
      'function isWorkspaceHeaderAllPlatformsId(id) { return id === "__all_platforms__"; }',
    );
  compile("account.js", accountSource);

  const { buildCalendarWeekTimeGrid, calendarPostOffsetInTwoHourSlot } = require(join(outDir, "dayRows.js"));
  const { resolveCalendarPostAccountDisplay } = require(join(outDir, "account.js"));
  const weekStart = new Date(2026, 8, 28, 0, 0, 0, 0);
  const now = new Date(2026, 8, 27, 9, 0, 0, 0);
  const sameDay = (hour, id) => ({
    id,
    scheduledAt: new Date(2026, 8, 28, hour, 0, 0, 0),
    postKind: "scheduled",
    caption: id,
    previewText: id,
    mediaUrl: null,
    mediaKind: null,
    platform: "instagram",
    account: "LuxePop",
    status: "scheduled",
  });
  const otherDay = {
    ...sameDay(10, "tue-only"),
    scheduledAt: new Date(2026, 8, 29, 10, 0, 0, 0),
  };

  const gridData = buildCalendarWeekTimeGrid(weekStart, now, [
    sameDay(16, "later"),
    sameDay(9, "earlier"),
    sameDay(13, "mid"),
    sameDay(9, "earlier-b"),
    otherDay,
  ]);

  assert.equal(gridData.days.length, 7);
  assert.ok(gridData.hours.includes(8));
  assert.ok(gridData.hours.includes(12));
  assert.ok(gridData.hours.includes(16));
  const hourIndex = (hour) => gridData.hours.indexOf(hour);
  const mondayMorning = gridData.cells[0][hourIndex(8)];
  const mondayMid = gridData.cells[0][hourIndex(12)];
  const mondayLate = gridData.cells[0][hourIndex(16)];
  const tuesdayMid = gridData.cells[1][hourIndex(10)];
  const tuesdayMorning = gridData.cells[1][hourIndex(8)];

  assert.equal(mondayMorning.kind, "posts");
  assert.deepEqual(
    mondayMorning.posts.map((post) => post.id),
    ["earlier", "earlier-b"],
  );
  assert.equal(mondayMid.kind, "posts");
  assert.equal(mondayMid.posts[0].id, "mid");
  assert.equal(mondayLate.kind, "posts");
  assert.equal(mondayLate.posts[0].id, "later");
  assert.equal(tuesdayMid.kind, "posts");
  assert.equal(tuesdayMid.posts[0].id, "tue-only");
  assert.equal(tuesdayMorning.kind, "empty");

  assert.equal(calendarPostOffsetInTwoHourSlot(new Date(2026, 8, 28, 14, 0, 0, 0), 14), 0);
  assert.equal(calendarPostOffsetInTwoHourSlot(new Date(2026, 8, 28, 14, 15, 0, 0), 14), 0.125);
  assert.equal(calendarPostOffsetInTwoHourSlot(new Date(2026, 8, 28, 15, 0, 0, 0), 14), 0.5);

  const facebookPage = {
    id: "facebook:page:123456789",
    iconId: "facebook",
    label: "LuxePop",
    avatarUrl: "https://cdn.example/luxe.jpg",
    targetResourceId: "123456789",
  };
  const named = resolveCalendarPostAccountDisplay(
    {
      platform: "facebook",
      account: "123456789",
      platformUserId: "123456789",
    },
    [facebookPage],
  );
  assert.equal(named.name, "LuxePop");
  assert.equal(named.avatarUrl, "https://cdn.example/luxe.jpg");

  const unknownId = resolveCalendarPostAccountDisplay(
    { platform: "facebook", account: "999", platformUserId: "999" },
    [facebookPage],
  );
  assert.equal(unknownId.name, "facebook");
  assert.equal(unknownId.avatarUrl, null);
} finally {
  rmSync(outDir, { recursive: true, force: true });
}

console.log("Calendar week multi-post card tests passed");
