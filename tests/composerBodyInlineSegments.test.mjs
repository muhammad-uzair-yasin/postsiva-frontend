import assert from "node:assert/strict";
import test from "node:test";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const outDir = mkdtempSync(join(tmpdir(), "postsiva-composer-body-"));
const require = createRequire(import.meta.url);

execFileSync(
  join(process.cwd(), "node_modules/.bin/tsc"),
  [
    "lib/post-composer/composerBodyInlineSegments.ts",
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

const segments = require(join(outDir, "composerBodyInlineSegments.js"));

test.after(() => {
  rmSync(outDir, { recursive: true, force: true });
});

test("splitComposerInlineSegments parses bold without asterisks in values", () => {
  const parts = segments.splitComposerInlineSegments(
    "**I'm diving headfirst** into Python",
  );
  assert.equal(parts.length, 2);
  assert.equal(parts[0].kind, "bold");
  assert.equal(parts[0].value, "I'm diving headfirst");
  assert.equal(parts[1].kind, "text");
  assert.equal(parts[1].value, " into Python");
});

test("splitComposerInlineSegments keeps hashtags highlighted separately", () => {
  const parts = segments.splitComposerInlineSegments("Ship it #BuildInPublic");
  assert.equal(parts[1].kind, "highlight");
  assert.equal(parts[1].value, "#BuildInPublic");
});

test("composerBodyHasBoldMarkup detects ** syntax", () => {
  assert.equal(segments.composerBodyHasBoldMarkup("plain"), false);
  assert.equal(segments.composerBodyHasBoldMarkup("**bold**"), true);
});
