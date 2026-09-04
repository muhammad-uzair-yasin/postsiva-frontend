import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

const outDir = mkdtempSync(join(tmpdir(), "postsiva-canva-return-dedupe-"));
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
  const source = readFileSync("lib/social/canvaReturnHandoff.ts", "utf8").replace(
    'from "@/lib/post-composer/composerAttachedMediaTypes"',
    'from "./composerAttachedMediaTypes"',
  );
  writeFileSync(join(outDir, "composerAttachedMediaTypes.js"), `"use strict";\n`);
  transpileTo("canvaReturnHandoff.js", source);

  const {
    canvaReturnConsumeKey,
    shouldApplyCanvaReturn,
  } = require(join(outDir, "canvaReturnHandoff.js"));

  const first = {
    type: "postsiva-canva-return",
    canva: "1",
    mediaUrl: "https://cdn.example/v1.png",
    mediaId: "m1",
    composerSessionId: "session-a",
  };
  const firstDup = { ...first };
  const secondEdit = {
    type: "postsiva-canva-return",
    canva: "1",
    mediaUrl: "https://cdn.example/v2.png",
    mediaId: "m2",
    composerSessionId: "session-b",
  };

  assert.equal(shouldApplyCanvaReturn(first, null), true);
  const key1 = canvaReturnConsumeKey(first);
  assert.equal(shouldApplyCanvaReturn(firstDup, key1), false);
  assert.equal(shouldApplyCanvaReturn(secondEdit, key1), true);

  console.log("canvaReturnDedupe.test.mjs: ok");
} finally {
  rmSync(outDir, { recursive: true, force: true });
}
