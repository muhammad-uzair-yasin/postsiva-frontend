import assert from "node:assert/strict";
import test from "node:test";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const outDir = mkdtempSync(join(tmpdir(), "postsiva-admin-ai-manager-"));
const require = createRequire(import.meta.url);

execFileSync(
  join(process.cwd(), "node_modules/.bin/tsc"),
  [
    "lib/admin/aiManagerApi.ts",
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

const {
  ROUTE_META,
  HEALTH_PROVIDERS,
  MAX_FALLBACKS,
  routeMetaFor,
  orderRoutes,
  draftFromConfig,
  buildPutBody,
  isDraftDirty,
  providerOptions,
  modelOptions,
  ensureOption,
  defaultSlot,
  formatRouteStamp,
  healthBadge,
} = require(join(outDir, "aiManagerApi.js"));

const CATALOG = [
  {
    id: "openrouter",
    label: "OpenRouter",
    configured: true,
    models: [
      { id: "or-text", label: "OR Text", kind: "text" },
      {
        id: "or-vision",
        label: "OR Vision",
        kind: "text",
        supports_vision: true,
      },
      {
        id: "or-gemini",
        label: "OR Gemini",
        kind: "text",
        supports_vision: true,
        supports_video: true,
      },
      { id: "or-image", label: "OR Image", kind: "image" },
    ],
  },
  {
    id: "pollinations",
    label: "Pollinations",
    configured: true,
    models: [{ id: "polli-text", label: "Polli Text", kind: "text" }],
  },
  {
    id: "navy",
    label: "Navy",
    configured: false,
    models: [{ id: "navy-text", label: "Navy Text", kind: "text" }],
  },
];

test("legacy route meta parity", () => {
  assert.equal(ROUTE_META.length, 15);
  assert.equal(ROUTE_META[0].key, "piva_agent");
  assert.equal(ROUTE_META[0].hasSummarizer, true);
  assert.ok(ROUTE_META.every((m) => m.key === "piva_agent" || !m.hasSummarizer));
  assert.equal(ROUTE_META.at(-3)?.key, "wordpress_article");
  assert.equal(ROUTE_META.at(-2)?.key, "wordpress_image_prompt");
  assert.equal(ROUTE_META.at(-1)?.key, "wordpress_image_generation");
  assert.equal(HEALTH_PROVIDERS.length, 8);
  assert.equal(
    HEALTH_PROVIDERS.find((p) => p.id === "anthropic")?.alwaysUp,
    true,
  );
  assert.equal(MAX_FALLBACKS, 5);
});

test("routeMetaFor humanizes unknown keys", () => {
  assert.equal(routeMetaFor("rephrase").title, "Rephrase / translate");
  const unknown = routeMetaFor("media_analyze");
  assert.equal(unknown.title, "Media analyze");
  assert.equal(unknown.hasSummarizer, false);
});

test("orderRoutes follows legacy card order, unknowns last", () => {
  const routes = [
    { config_key: "rephrase", config: {}, version: 0, is_default: true },
    { config_key: "mystery_route", config: {}, version: 0, is_default: true },
    { config_key: "piva_agent", config: {}, version: 1, is_default: false },
  ];
  assert.deepEqual(
    orderRoutes(routes).map((r) => r.config_key),
    ["piva_agent", "rephrase", "mystery_route"],
  );
});

test("draftFromConfig normalizes refs and defaults summarizer to primary", () => {
  const draft = draftFromConfig(
    {
      primary: { provider: "openrouter", model: "or-text" },
      fallbacks: [{ provider: "pollinations", model: "polli-text", extra: 1 }],
    },
    true,
  );
  assert.deepEqual(draft.primary, { provider: "openrouter", model: "or-text" });
  assert.deepEqual(draft.summarizer, { provider: "openrouter", model: "or-text" });
  assert.deepEqual(draft.fallbacks, [
    { provider: "pollinations", model: "polli-text" },
  ]);
  const empty = draftFromConfig(undefined, false);
  assert.deepEqual(empty, {
    primary: { provider: "", model: "" },
    summarizer: null,
    fallbacks: [],
  });
});

test("buildPutBody includes summarizer only for summarizer routes", () => {
  const draft = {
    primary: { provider: "openrouter", model: "or-text" },
    summarizer: { provider: "pollinations", model: "polli-text" },
    fallbacks: [{ provider: "navy", model: "navy-text" }],
  };
  const withSum = buildPutBody(draft, true);
  assert.deepEqual(withSum.summarizer, {
    provider: "pollinations",
    model: "polli-text",
  });
  const withoutSum = buildPutBody(draft, false);
  assert.equal("summarizer" in withoutSum, false);
  assert.deepEqual(withoutSum.fallbacks, [{ provider: "navy", model: "navy-text" }]);
  // Missing summarizer falls back to primary (legacy PUT parity).
  const fromPrimary = buildPutBody({ ...draft, summarizer: null }, true);
  assert.deepEqual(fromPrimary.summarizer, draft.primary);
});

test("isDraftDirty detects edits and ignores no-ops", () => {
  const config = {
    primary: { provider: "openrouter", model: "or-text" },
    fallbacks: [{ provider: "pollinations", model: "polli-text" }],
  };
  const clean = draftFromConfig(config, false);
  assert.equal(isDraftDirty(clean, config, false), false);
  assert.equal(
    isDraftDirty(
      { ...clean, primary: { provider: "openrouter", model: "or-vision" } },
      config,
      false,
    ),
    true,
  );
  assert.equal(isDraftDirty({ ...clean, fallbacks: [] }, config, false), true);
  // Fallback order matters (ordered cascade).
  const twoFb = {
    ...config,
    fallbacks: [
      { provider: "pollinations", model: "polli-text" },
      { provider: "openrouter", model: "or-text" },
    ],
  };
  const reversed = {
    ...draftFromConfig(twoFb, false),
    fallbacks: [
      { provider: "openrouter", model: "or-text" },
      { provider: "pollinations", model: "polli-text" },
    ],
  };
  assert.equal(isDraftDirty(reversed, twoFb, false), true);
});

test("providerOptions marks unconfigured and restricts analyze routes", () => {
  const all = providerOptions(CATALOG, "piva_agent");
  assert.deepEqual(
    all.map((o) => o.value),
    ["openrouter", "pollinations", "navy"],
  );
  assert.equal(all[2].label, "Navy (not configured)");
  assert.equal(all[2].disabled, true);
  for (const key of ["image_analyze", "video_analyze", "media_to_content"]) {
    assert.deepEqual(
      providerOptions(CATALOG, key).map((o) => o.value),
      ["openrouter", "pollinations"],
    );
  }
});

test("modelOptions filters by route kind/capability", () => {
  assert.deepEqual(
    modelOptions(CATALOG, "openrouter", "comment_reply").map((o) => o.value),
    ["or-text", "or-vision", "or-gemini"],
  );
  assert.deepEqual(
    modelOptions(CATALOG, "openrouter", "image_analyze").map((o) => o.value),
    ["or-vision", "or-gemini"],
  );
  assert.deepEqual(
    modelOptions(CATALOG, "openrouter", "video_analyze").map((o) => o.value),
    ["or-gemini"],
  );
  assert.deepEqual(modelOptions(CATALOG, "missing", "rephrase"), []);
  assert.deepEqual(
    modelOptions(CATALOG, "openrouter", "wordpress_image_generation").map((o) => o.value),
    ["or-image"],
  );
  const livePollinations = modelOptions(
    [
      {
        id: "pollinations",
        label: "Pollinations",
        configured: true,
        models: [
          {
            id: "gemini-large",
            label: "Gemini Large (live title)",
            kind: "text",
            source: "live",
          },
        ],
      },
    ],
    "pollinations",
    "piva_agent",
  );
  assert.deepEqual(livePollinations, [{ value: "gemini-large", label: "gemini-large" }]);
});

test("ensureOption keeps valid values, falls back to first enabled", () => {
  const options = [
    { value: "a", label: "A", disabled: true },
    { value: "b", label: "B" },
  ];
  assert.equal(ensureOption(options, "b"), "b");
  assert.equal(ensureOption(options, "zzz"), "b");
  assert.equal(ensureOption([], "zzz"), "");
});

test("defaultSlot picks first configured provider with first eligible model", () => {
  assert.deepEqual(defaultSlot(CATALOG, "comment_reply"), {
    provider: "openrouter",
    model: "or-text",
  });
  assert.deepEqual(defaultSlot(CATALOG, "video_analyze"), {
    provider: "openrouter",
    model: "or-gemini",
  });
  assert.deepEqual(defaultSlot([], "rephrase"), { provider: "", model: "" });
});

test("formatRouteStamp mirrors legacy meta line", () => {
  assert.equal(
    formatRouteStamp({ config_key: "rephrase", config: {}, version: 0, is_default: true }),
    "Using code defaults · version 0",
  );
  const saved = formatRouteStamp({
    config_key: "rephrase",
    config: {},
    version: 3,
    is_default: false,
    updated_at: "2026-01-05T10:00:00Z",
  });
  assert.match(saved, /^Saved · version 3 · updated /);
  assert.doesNotMatch(saved, /—/);
  const noDate = formatRouteStamp({
    config_key: "rephrase",
    config: {},
    version: 2,
    is_default: false,
  });
  assert.equal(noDate, "Saved · version 2 · updated —");
});

test("healthBadge shows status with latency and tone", () => {
  assert.deepEqual(healthBadge({ provider_id: "x", status: "up", latency_ms: 123 }), {
    label: "up · 123ms",
    tone: "up",
  });
  assert.deepEqual(healthBadge({ provider_id: "x", status: "down" }), {
    label: "down",
    tone: "down",
  });
  assert.deepEqual(
    healthBadge({ provider_id: "x", status: "skipped", latency_ms: null }),
    { label: "skipped", tone: "muted" },
  );
});

test.after(() => {
  rmSync(outDir, { recursive: true, force: true });
});
