import assert from "node:assert/strict";
import test from "node:test";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const outDir = mkdtempSync(join(tmpdir(), "postsiva-admin-ai-providers-"));
const require = createRequire(import.meta.url);

execFileSync(
  join(process.cwd(), "node_modules/.bin/tsc"),
  [
    "lib/admin/aiProvidersApi.ts",
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

const api = require(join(outDir, "aiProvidersApi.js"));

const pollinations = {
  id: "pollinations",
  label: "Pollinations",
  configured: true,
  models: [
    { id: "openai", label: "OpenAI GPT", kind: "text", source: "live", supports_vision: true },
    { id: "mistral", label: "Mistral", source: "fallback" },
    { id: "flux", label: "Flux", kind: "image", source: "live" },
  ],
};

test("textModels defaults missing kind to text and excludes image models", () => {
  const ids = api.textModels(pollinations).map((m) => m.id);
  assert.deepEqual(ids, ["openai", "mistral"]);
  assert.deepEqual(api.textModels(undefined), []);
});

test("visionModels keeps only vision-capable text models", () => {
  assert.deepEqual(api.visionModels(pollinations).map((m) => m.id), ["openai"]);
});

test("imageModels keeps only image-kind models", () => {
  assert.deepEqual(api.imageModels(pollinations).map((m) => m.id), ["flux"]);
});

test("modelOptionLabel matches legacy format with defaults and tag override", () => {
  assert.equal(
    api.modelOptionLabel({ id: "m", label: "Mistral" }),
    "[text · fallback] Mistral",
  );
  assert.equal(
    api.modelOptionLabel(
      { id: "o", label: "OpenAI GPT", kind: "text", source: "live" },
      "text+image input",
    ),
    "[text+image input · live] OpenAI GPT",
  );
});

test("providerOptionLabel marks unconfigured providers", () => {
  assert.equal(api.providerOptionLabel(pollinations), "Pollinations");
  assert.equal(
    api.providerOptionLabel({ id: "x", label: "X", configured: false, models: [] }),
    "X (not configured)",
  );
});

test("firstConfiguredProviderId skips unconfigured providers", () => {
  const providers = [
    { id: "a", label: "A", configured: false, models: [] },
    { id: "b", label: "B", configured: true, models: [] },
  ];
  assert.equal(api.firstConfiguredProviderId(providers), "b");
  assert.equal(api.firstConfiguredProviderId([providers[0]]), null);
});

test("workspaceOptionLabel truncates the id like legacy", () => {
  assert.equal(
    api.workspaceOptionLabel({ id: "0123456789abcdef", name: "Acme" }),
    "Acme (01234567…)",
  );
  assert.equal(
    api.workspaceOptionLabel({ id: "0123456789abcdef", name: "" }),
    "Workspace (01234567…)",
  );
});

test("galleryMediaLabel falls back filename then media_id", () => {
  assert.equal(api.galleryMediaLabel({ media_id: "id1", original_filename: "a.png" }), "a.png");
  assert.equal(api.galleryMediaLabel({ media_id: "id1", filename: "b.png" }), "b.png");
  assert.equal(api.galleryMediaLabel({ media_id: "id1" }), "id1");
});

test("buildPivaProbeBody trims message and requires all fields", () => {
  assert.deepEqual(api.buildPivaProbeBody("ws", "prov", "mod", "  hi  "), {
    workspace_id: "ws",
    provider: "prov",
    model: "mod",
    message: "hi",
  });
  assert.equal(api.buildPivaProbeBody("", "prov", "mod", "hi"), null);
  assert.equal(api.buildPivaProbeBody("ws", "prov", "mod", "   "), null);
});

test("buildDirectTextProbeBody requires provider, model, prompt", () => {
  assert.deepEqual(api.buildDirectTextProbeBody("openrouter", "m", " p "), {
    provider: "openrouter",
    model: "m",
    prompt: "p",
  });
  assert.equal(api.buildDirectTextProbeBody("openrouter", "", "p"), null);
});

test("buildMediaProbeBody pins provider to pollinations", () => {
  assert.deepEqual(api.buildMediaProbeBody("ws", "media", "m", "look"), {
    workspace_id: "ws",
    media_id: "media",
    provider: "pollinations",
    model: "m",
    prompt: "look",
  });
  assert.equal(api.buildMediaProbeBody("ws", "", "m", "look"), null);
});

test("buildImageGenerationProbeBody leaves dimensions to Pollinations", () => {
  assert.deepEqual(api.buildImageGenerationProbeBody("flux", "a flower"), {
    model: "flux",
    prompt: "a flower",
  });
  assert.equal(api.buildImageGenerationProbeBody("flux", "  "), null);
});

test("normalizePivaProbeResult success prefers parsed.response", () => {
  const out = api.normalizePivaProbeResult({
    success: true,
    provider: "pollinations",
    model: "openai",
    elapsed_ms: 812,
    parsed: { response: "Hello!" },
    agent_response_json: "{\"raw\":1}",
  });
  assert.deepEqual(out, {
    ok: true,
    statusText: "OK · pollinations/openai · 812ms",
    resultText: "Hello!",
  });
});

test("normalizePivaProbeResult falls back to agent_response_json then full JSON", () => {
  const withRaw = api.normalizePivaProbeResult({
    success: true,
    provider: "p",
    model: "m",
    elapsed_ms: 5,
    agent_response_json: "{\"raw\":1}",
  });
  assert.equal(withRaw.resultText, "{\"raw\":1}");

  const bare = { success: true, provider: "p", model: "m", elapsed_ms: 5 };
  const asJson = api.normalizePivaProbeResult(bare);
  assert.equal(asJson.resultText, JSON.stringify(bare, null, 2));
});

test("normalizePivaProbeResult failure surfaces error verbatim", () => {
  const out = api.normalizePivaProbeResult({
    success: false,
    elapsed_ms: 44,
    error: "boom from provider",
  });
  assert.deepEqual(out, {
    ok: false,
    statusText: "Failed · 44ms",
    resultText: "boom from provider",
  });
  assert.equal(
    api.normalizePivaProbeResult({ success: false }).resultText,
    "Probe failed",
  );
});

test("normalizeDirectTextResult formats legacy status line", () => {
  const out = api.normalizeDirectTextResult({
    provider: "pollinations",
    model: "openai",
    elapsed_ms: 120,
    response: "Pollinations text API is active.",
  });
  assert.deepEqual(out, {
    ok: true,
    statusText: "Direct OK · pollinations/openai · 120ms",
    resultText: "Pollinations text API is active.",
  });
});

test("normalizeMediaProbeResult formats analysis status and JSON fallback", () => {
  const data = { model: "openai", elapsed_ms: 300 };
  const out = api.normalizeMediaProbeResult(data);
  assert.equal(out.statusText, "Analysis OK · openai · 300ms");
  assert.equal(out.resultText, JSON.stringify(data, null, 2));
});

test("normalizeClearHistoryResult defaults counts and message", () => {
  assert.deepEqual(api.normalizeClearHistoryResult({}), {
    ok: true,
    statusText: "Cleared · 0 archived turn(s)",
    resultText: "Chat history cleared.",
  });
  const out = api.normalizeClearHistoryResult({
    deleted_archived_turns: 3,
    message: "Cleared agent memory and 3 archived chat turn(s) for workspace ws",
  });
  assert.equal(out.statusText, "Cleared · 3 archived turn(s)");
});

test("imageGenerationOutcome mentions the model", () => {
  const out = api.imageGenerationOutcome("flux");
  assert.equal(out.ok, true);
  assert.equal(out.statusText, "Image OK · flux");
});

test("clearHistoryConfirmMessage includes the workspace label and warning", () => {
  const msg = api.clearHistoryConfirmMessage("Acme (01234567…)");
  assert.ok(msg.includes("Acme (01234567…)"));
  assert.ok(msg.includes("LangGraph memory"));
});

test("errorText unwraps Error instances", () => {
  assert.equal(api.errorText(new Error("nope")), "nope");
  assert.equal(api.errorText("raw"), "raw");
});

test.after(() => {
  rmSync(outDir, { recursive: true, force: true });
});
