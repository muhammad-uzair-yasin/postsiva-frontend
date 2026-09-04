import assert from "node:assert/strict";
import test from "node:test";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const outDir = mkdtempSync(join(tmpdir(), "postsiva-admin-main-writer-"));
const require = createRequire(import.meta.url);

execFileSync(
  join(process.cwd(), "node_modules/.bin/tsc"),
  [
    "lib/admin/mainWriterPlaygroundApi.ts",
    "lib/admin/mainWriterPlatformPreview.ts",
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

const api = require(join(outDir, "mainWriterPlaygroundApi.js"));
const preview = require(join(outDir, "mainWriterPlatformPreview.js"));

test.after(() => {
  rmSync(outDir, { recursive: true, force: true });
});

test("buildMainWriterPlaygroundBody keeps required idea and omits empty optionals", () => {
  const body = api.buildMainWriterPlaygroundBody({
    userIdea: "  Launch post  ",
    brandPersona: "  ",
    userRequirements: "",
    targetPlatforms: [],
  });
  assert.deepEqual(body, { user_idea: "Launch post" });
});

test("buildMainWriterPlaygroundBody normalizes optional fields", () => {
  const body = api.buildMainWriterPlaygroundBody({
    userIdea: "Tip",
    brandPersona: "Founder voice",
    userRequirements: "Short CTA",
    targetPlatforms: [" LinkedIn ", "YOUTUBE", ""],
  });
  assert.deepEqual(body, {
    user_idea: "Tip",
    brand_persona: "Founder voice",
    user_requirements: "Short CTA",
    target_platforms: ["linkedin", "youtube"],
  });
});

test("formatGenerationTime renders ms and seconds", () => {
  assert.equal(api.formatGenerationTime(842), "842 ms");
  assert.equal(api.formatGenerationTime(1500), "1.50 s");
  assert.equal(api.formatGenerationTime(12345), "12.3 s");
});

test("postContentToMarkdown converts bullets and preserves line breaks", () => {
  const md = api.postContentToMarkdown("Hook line\n\n• First item\n→ Highlight");
  assert.match(md, /- First item/);
  assert.match(md, /  \n/);
});

test("postContentToMarkdown upgrades plain emoji headings to markdown", () => {
  const md = api.postContentToMarkdown(
    "Punch line here\n\nStory line\n\n🎯 AI scheduling drafts\n\nFrom one idea to a week of posts\n\n• First bullet",
  );
  assert.match(md, /^# Punch line here/m);
  assert.match(md, /## 🎯 AI scheduling drafts/);
  assert.match(md, /### From one idea to a week of posts/);
});

test("postContentToMarkdown keeps bold punch hook as top heading", () => {
  const md = api.postContentToMarkdown("**We just shaved 6 hours off our week.**\n\nStory.");
  assert.match(md, /^# We just shaved 6 hours off our week\./m);
});

test("prepareMainWriterContentForPlatformPreview bolds hook and headings", () => {
  const plain = api.prepareMainWriterContentForPlatformPreview(
    "We just shaved 6 hours off our week.\n\nStory.\n\n## 🎯 The setup\n\n### From inbox to queue\n\n#TagOne #TagTwo",
  );
  assert.match(plain, /^\*\*We just shaved 6 hours off our week\.\*\*/m);
  assert.match(plain, /\*\*🎯 The setup\*\*/);
  assert.match(plain, /\*\*From inbox to queue\*\*/);
  assert.match(plain, /#TagOne #TagTwo/);
});

test("stripMarkdownHeadingMarkers removes hash prefixes for platform preview", () => {
  const plain = api.stripMarkdownHeadingMarkers(
    "## 🎯 AI scheduling drafts\n### From one idea\n\n• Item",
  );
  assert.match(plain, /🎯 AI scheduling drafts/);
  assert.doesNotMatch(plain, /^## /m);
});

test("buildMainWriterPlaygroundView maps response fields", () => {
  const view = api.buildMainWriterPlaygroundView({
    success: true,
    elapsed_ms: 1200,
    content: "Post body",
    youtube_title: "YT",
    recommended_image_keywords: [{ query: "desk", reason: "fits" }],
  });
  assert.equal(view.content, "Post body");
  assert.equal(view.youtubeTitle, "YT");
  assert.equal(view.keywords.length, 1);
  assert.equal(view.elapsedLabel, "1.20 s");
});

test("formatModelUsedLabel includes provider model and slot", () => {
  assert.equal(
    api.formatModelUsedLabel({
      provider: "openrouter",
      model: "gpt-5-mini",
      routeSlot: "fallback_1",
    }),
    "openrouter / gpt-5-mini (fallback 1)",
  );
});

test("buildMainWriterPlaygroundView maps model metadata", () => {
  const view = api.buildMainWriterPlaygroundView({
    success: true,
    elapsed_ms: 900,
    content: "Post",
    provider: "openrouter",
    model: "gpt-5-mini",
    attempt: 2,
    route_slot: "fallback_1",
  });
  assert.equal(view.modelLabel, "openrouter / gpt-5-mini (fallback 1)");
  assert.equal(view.attempt, 2);
});

test("formatMainWriterPlaygroundResult returns structured view", () => {
  const formatted = api.formatMainWriterPlaygroundResult({
    success: true,
    elapsed_ms: 1200,
    content: "Post body",
    youtube_title: "YT",
    recommended_image_keywords: [{ query: "desk", reason: "fits" }],
  });
  assert.equal(formatted.isError, false);
  assert.equal(formatted.view.content, "Post body");
  assert.match(formatted.statusText, /OK · 1\.20 s/);
});

test("formatMainWriterPlaygroundResult surfaces agent errors", () => {
  const formatted = api.formatMainWriterPlaygroundResult({
    success: false,
    elapsed_ms: 42,
    content: "",
    error: "No models available",
  });
  assert.equal(formatted.isError, true);
  assert.equal(formatted.view.error, "No models available");
});

test("resolveMainWriterPreviewPlatforms returns all when none selected", () => {
  const platforms = preview.resolveMainWriterPreviewPlatforms([]);
  assert.equal(platforms.length, 9);
  assert.equal(platforms[0], "linkedin");
});

test("resolveMainWriterPreviewPlatforms filters and normalizes selection", () => {
  const platforms = preview.resolveMainWriterPreviewPlatforms([
    " YOUTUBE ",
    "linkedin",
    "invalid",
  ]);
  assert.deepEqual(platforms, ["linkedin", "youtube"]);
});
