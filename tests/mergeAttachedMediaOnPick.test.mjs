import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

const outDir = mkdtempSync(join(tmpdir(), "postsiva-media-pick-"));
const require = createRequire(import.meta.url);
const ts = require("typescript");

function transpileTo(relOut, sourceText) {
  const compiled = ts.transpileModule(sourceText, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  });
  const outPath = join(outDir, relOut);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, compiled.outputText);
}

try {
  const source = readFileSync(
    "app/(workspace)/post-scheduler/_utils/postSchedulerComposerMediaPick.ts",
    "utf8",
  ).replace(
    'from "../_types/composerDraftTypes"',
    'from "./composerDraftTypes"',
  );
  writeFileSync(
    join(outDir, "composerDraftTypes.js"),
    `"use strict";\n`,
  );
  transpileTo("postSchedulerComposerMediaPick.js", source);

  const { mergeAttachedMediaOnPick, replaceOrMergeAttachedMedia } = require(
    join(outDir, "postSchedulerComposerMediaPick.js"),
  );

  const existing = {
    mediaId: "old-media",
    publicUrl: "https://cdn.example/old.png",
    mediaType: "image",
    filename: "old.png",
    source: "canva",
    canvaDesignId: "DAF123",
  };
  const returned = {
    mediaId: "new-media",
    publicUrl: "https://cdn.example/edited.png",
    mediaType: "image",
    filename: "edited.png",
    source: "canva",
    canvaDesignId: "DAF123",
  };

  const merged = mergeAttachedMediaOnPick([existing], returned);
  assert.equal(merged.length, 1);
  assert.equal(merged[0].publicUrl, "https://cdn.example/edited.png");
  assert.equal(merged[0].mediaId, "new-media");

  const nonCanva = {
    mediaId: "upload-1",
    publicUrl: "https://cdn.example/upload.png",
    mediaType: "image",
    filename: "upload.png",
  };
  const afterOpenFromMedia = {
    mediaId: "exported-2",
    publicUrl: "https://cdn.example/from-canva.png",
    mediaType: "image",
    filename: "from-canva.png",
    source: "canva",
    canvaDesignId: "DAF999",
  };
  const replaced = replaceOrMergeAttachedMedia([nonCanva], afterOpenFromMedia, "upload-1");
  assert.equal(replaced.length, 1);
  assert.equal(replaced[0].publicUrl, "https://cdn.example/from-canva.png");
  assert.equal(replaced[0].canvaDesignId, "DAF999");

  console.log("mergeAttachedMediaOnPick.test.mjs: ok");
} finally {
  rmSync(outDir, { recursive: true, force: true });
}
