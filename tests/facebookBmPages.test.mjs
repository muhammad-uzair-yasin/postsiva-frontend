import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const outDir = mkdtempSync(join(tmpdir(), "postsiva-facebook-bm-"));
const require = createRequire(import.meta.url);

try {
  const ts = require("typescript");
  const source = readFileSync(
    join(process.cwd(), "lib/workspace/linkedinFacebookHeaderAccountRows.ts"),
    "utf8",
  );
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  writeFileSync(join(outDir, "linkedinFacebookHeaderAccountRows.js"), compiled.outputText);
  const { buildFacebookHeaderAccountRows } = require(
    join(outDir, "linkedinFacebookHeaderAccountRows.js"),
  );
  const rows = buildFacebookHeaderAccountRows({
    profile: { name: "Facebook User" },
    pages: [
      { page_id: "supported", page_name: "Supported", support_status: "supported" },
      {
        page_id: "bm-1",
        page_name: "BM Page",
        support_status: "unsupported_bm",
        availability_message: "We can't manage Meta Business Suite pages yet. This is coming soon.",
      },
    ],
  });

  assert.equal(rows[1].disabled, false);
  assert.equal(rows[2].disabled, true);
  assert.equal(
    rows[2].disabledMessage,
    "We can't manage Meta Business Suite pages yet. This is coming soon.",
  );
  console.log("Facebook BM page tests passed");
} finally {
  rmSync(outDir, { recursive: true, force: true });
}
