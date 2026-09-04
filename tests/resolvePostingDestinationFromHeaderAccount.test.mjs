import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

const resolver = readFileSync(
  join(root, "lib/workspace/resolvePostingDestinationFromHeaderAccount.ts"),
  "utf8",
);
assert.match(resolver, /export function resolvePostingDestinationFromHeaderAccount/);
assert.match(resolver, /facebook_page_ids/);
assert.match(resolver, /post_to_personal/);
assert.match(resolver, /linkedin_page_ids/);

const summary = readFileSync(
  join(
    root,
    "app/(workspace)/content-manager/draft/[id]/_components/DraftEditorDraftSummary.tsx",
  ),
  "utf8",
);
assert.match(summary, /onEditAccount/);
assert.match(summary, /editAccountAria/);

const picker = readFileSync(
  join(
    root,
    "app/(workspace)/content-manager/draft/[id]/_components/DraftEditorAccountPickerModal.tsx",
  ),
  "utf8",
);
assert.match(picker, /resolvePostingDestinationFromHeaderAccount/);
assert.match(picker, /platformUserIdsMatch/);

const scheduled = readFileSync(
  join(
    root,
    "app/(workspace)/content-manager/draft/[id]/_components/ScheduledPostEditorLoaded.tsx",
  ),
  "utf8",
);
assert.match(scheduled, /onEditAccount=\{\(\) => setAccountPickerOpen\(true\)\}/);
assert.match(scheduled, /changeAccount/);

const draftLoaded = readFileSync(
  join(
    root,
    "app/(workspace)/content-manager/draft/[id]/_components/DraftEditorLoaded.tsx",
  ),
  "utf8",
);
assert.match(draftLoaded, /onChangeAccount/);
assert.match(draftLoaded, /DraftEditorAccountPickerModal/);

console.log("resolvePostingDestinationFromHeaderAccount wiring tests passed");
