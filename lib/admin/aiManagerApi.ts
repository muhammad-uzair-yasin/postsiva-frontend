/**
 * Types + pure helpers for the admin AI Manager page (runtime model route
 * cascades). Kept import-free so unit tests can compile this file standalone.
 * API calls live in app/(admin)/admin/ai-manager/_hooks.
 */

export interface ProviderModelRef {
  provider: string;
  model: string;
}

export interface RouteConfigResponse {
  config_key: string;
  config: Record<string, unknown>;
  version: number;
  updated_at?: string | null;
  updated_by?: string | null;
  is_default: boolean;
}

export interface RoutesResponse {
  routes?: RouteConfigResponse[];
}

export interface ProviderHealthResult {
  provider_id: string;
  status: string; // up | down | skipped
  latency_ms?: number | null;
  detail?: string | null;
  checked?: boolean;
}

export interface CatalogModel {
  id: string;
  label: string;
  kind?: string | null;
  source?: string | null;
  supports_vision?: boolean | null;
  supports_video?: boolean | null;
}

export interface CatalogProvider {
  id: string;
  label: string;
  configured?: boolean;
  models?: CatalogModel[];
}

export interface ProviderCatalogResponse {
  providers?: CatalogProvider[];
}

/** Editable card state: primary + ordered fallbacks (+ summarizer for Piva). */
export interface RouteDraft {
  primary: ProviderModelRef;
  summarizer: ProviderModelRef | null;
  fallbacks: ProviderModelRef[];
}

export interface RouteMeta {
  key: string;
  title: string;
  blurb: string;
  hasSummarizer: boolean;
}

export interface PickerOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export const MAX_FALLBACKS = 5;

/** Legacy card order, titles and blurbs (script-ai-manager.js ROUTE_META). */
export const ROUTE_META: RouteMeta[] = [
  { key: "piva_agent", title: "Piva agent", blurb: "Main chat agent + background thread summarizer (WhatsApp, web, FB/Insta DM)", hasSummarizer: true },
  { key: "landing_assistant", title: "Landing assistant", blurb: "Public landing (no Anthropic)", hasSummarizer: false },
  { key: "image_analyze", title: "Image analysis", blurb: "Models used only for image understanding", hasSummarizer: false },
  { key: "video_analyze", title: "Video analysis", blurb: "Models used only for video understanding", hasSummarizer: false },
  { key: "media_to_content", title: "Media → content", blurb: "Pollinations gemini-large → OpenRouter Gemini Flash Lite (write only)", hasSummarizer: false },
  { key: "image_generation", title: "Image generation", blurb: "Pollinations gptimage-large → OpenRouter Nano Banana", hasSummarizer: false },
  { key: "image_edit", title: "Image edit", blurb: "Pollinations gptimage-large → OpenRouter Nano Banana", hasSummarizer: false },
  { key: "image_prompt", title: "Image prompt", blurb: "Content/edit → prompt text for image tools", hasSummarizer: false },
  {
    key: "workspace_saved_prompt",
    title: "Saved prompt (Settings)",
    blurb: "Generate workspace AI prompt templates from user intent",
    hasSummarizer: false,
  },
  {
    key: "main_writer",
    title: "Main writer",
    blurb: "All-mode idea / image analysis / video analysis → post (+ YouTube/Pinterest/TikTok titles)",
    hasSummarizer: false,
  },
  {
    key: "news_to_post",
    title: "News / RSS / Trending → post",
    blurb: "Explore Create post from news articles, RSS, and trending items",
    hasSummarizer: false,
  },
  {
    key: "demand_to_post",
    title: "Demand → post",
    blurb: "Explore Create post from rising searches, topic search, and culture pulse",
    hasSummarizer: false,
  },
  { key: "persona_generation", title: "Persona generation", blurb: "Persona Manager (all platforms): analyzers + system prompt", hasSummarizer: false },
  { key: "comment_reply", title: "Comment reply", blurb: "AI comment replies (incl. extension)", hasSummarizer: false },
  { key: "rephrase", title: "Rephrase / translate", blurb: "Short rephrase & translate (LinkedIn extension)", hasSummarizer: false },
  { key: "wordpress_article", title: "WordPress article", blurb: "Long-form WordPress blog article Deep Agent", hasSummarizer: false },
  { key: "wordpress_image_prompt", title: "WordPress image prompt", blurb: "Prompt writer for WordPress featured images", hasSummarizer: false },
  { key: "wordpress_image_generation", title: "WordPress image generation", blurb: "Featured image generation for WordPress articles", hasSummarizer: false },
];

export interface HealthProviderMeta {
  id: string;
  label: string;
  /** Anthropic is not probed; always shown as up. */
  alwaysUp?: boolean;
}

export const HEALTH_PROVIDERS: HealthProviderMeta[] = [
  { id: "openrouter", label: "OpenRouter" },
  { id: "digitalocean", label: "DigitalOcean" },
  { id: "pollinations", label: "Pollinations chat" },
  { id: "pollinations_image", label: "Pollinations image" },
  { id: "navy", label: "Navy" },
  { id: "openrouter_image", label: "OpenRouter image" },
  { id: "openrouter_gemini", label: "Gemini via OR" },
  { id: "anthropic", label: "Anthropic", alwaysUp: true },
];

/** Routes limited to Pollinations/OpenRouter providers (legacy parity). */
const RESTRICTED_PROVIDER_ROUTES = new Set([
  "image_analyze",
  "video_analyze",
  "media_to_content",
]);

const IMAGE_MODEL_ROUTES = new Set([
  "image_generation",
  "image_edit",
  "wordpress_image_generation",
]);

/** Meta for a config key; unknown keys get a humanized fallback so every
 *  route returned by GET /routes still renders. */
export function routeMetaFor(key: string): RouteMeta {
  const known = ROUTE_META.find((m) => m.key === key);
  if (known) return known;
  const title = key
    .split("_")
    .filter(Boolean)
    .map((w, i) => (i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
  return { key, title: title || key, blurb: "", hasSummarizer: false };
}

/** Legacy card order first, then any unknown keys in server order. */
export function orderRoutes(routes: RouteConfigResponse[]): RouteConfigResponse[] {
  const rank = new Map(ROUTE_META.map((m, i) => [m.key, i]));
  return [...routes].sort((a, b) => {
    const ra = rank.get(a.config_key) ?? ROUTE_META.length;
    const rb = rank.get(b.config_key) ?? ROUTE_META.length;
    return ra - rb;
  });
}

function toRef(value: unknown): ProviderModelRef {
  const rec = (value ?? {}) as Record<string, unknown>;
  return {
    provider: typeof rec.provider === "string" ? rec.provider : "",
    model: typeof rec.model === "string" ? rec.model : "",
  };
}

/** Normalize a remote config into an editable draft. Summarizer falls back to
 *  primary when absent (legacy parity for the Piva card). */
export function draftFromConfig(
  config: Record<string, unknown> | null | undefined,
  hasSummarizer: boolean,
): RouteDraft {
  const cfg = config ?? {};
  const primary = toRef(cfg.primary);
  const fallbacks = Array.isArray(cfg.fallbacks) ? cfg.fallbacks.map(toRef) : [];
  return {
    primary,
    summarizer: hasSummarizer ? toRef(cfg.summarizer ?? cfg.primary) : null,
    fallbacks,
  };
}

/** Serialize a draft into the PUT /routes/{key} body. */
export function buildPutBody(
  draft: RouteDraft,
  hasSummarizer: boolean,
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    primary: { provider: draft.primary.provider, model: draft.primary.model },
    fallbacks: draft.fallbacks.map((f) => ({ provider: f.provider, model: f.model })),
  };
  if (hasSummarizer) {
    const s = draft.summarizer ?? draft.primary;
    body.summarizer = { provider: s.provider, model: s.model };
  }
  return body;
}

/** Dirty when the draft would PUT something different from the saved config. */
export function isDraftDirty(
  draft: RouteDraft,
  config: Record<string, unknown> | null | undefined,
  hasSummarizer: boolean,
): boolean {
  const remote = draftFromConfig(config, hasSummarizer);
  return (
    JSON.stringify(buildPutBody(draft, hasSummarizer)) !==
    JSON.stringify(buildPutBody(remote, hasSummarizer))
  );
}

/** Provider picker options; restricted routes only offer Pollinations/OpenRouter. */
export function providerOptions(
  catalog: CatalogProvider[],
  routeKey: string,
): PickerOption[] {
  const restricted = RESTRICTED_PROVIDER_ROUTES.has(routeKey);
  const imageRoute = IMAGE_MODEL_ROUTES.has(routeKey);
  return catalog
    .filter((p) => !restricted || p.id === "pollinations" || p.id === "openrouter")
    .filter((p) => !imageRoute || (p.models ?? []).some((m) => m.kind === "image"))
    .map((p) => ({
      value: p.id,
      label: p.configured ? p.label : `${p.label} (not configured)`,
      disabled: !p.configured,
    }));
}

/** Model picker options for a provider, filtered per route (legacy parity):
 *  image_analyze → vision text models, video_analyze → video text models,
 *  image_generation/image_edit → image models,
 *  everything else → text models. */
export function modelOptions(
  catalog: CatalogProvider[],
  providerId: string,
  routeKey: string,
): PickerOption[] {
  const provider = catalog.find((p) => p.id === providerId);
  let models = provider?.models ?? [];
  if (routeKey === "image_analyze") {
    models = models.filter((m) => (m.kind || "text") === "text" && !!m.supports_vision);
  } else if (routeKey === "video_analyze") {
    models = models.filter((m) => (m.kind || "text") === "text" && !!m.supports_video);
  } else if (IMAGE_MODEL_ROUTES.has(routeKey)) {
    models = models.filter((m) => m.kind === "image");
  } else {
    models = models.filter((m) => (m.kind || "text") === "text");
  }
  // Match AI Providers page: show model IDs, not catalog title/label mapping.
  return models.map((m) => ({
    value: m.id,
    label: m.id,
  }));
}

/** Keep the current value when it is a listed option, else first option. */
export function ensureOption(options: PickerOption[], current: string): string {
  if (options.some((o) => o.value === current)) return current;
  const firstEnabled = options.find((o) => !o.disabled);
  return firstEnabled?.value ?? options[0]?.value ?? "";
}

/** Slot used for a newly added fallback: first configured provider allowed on
 *  the route, with its first eligible model. */
export function defaultSlot(
  catalog: CatalogProvider[],
  routeKey: string,
): ProviderModelRef {
  const options = providerOptions(catalog, routeKey);
  const provider =
    options.find((o) => !o.disabled)?.value ?? options[0]?.value ?? "";
  const model = modelOptions(catalog, provider, routeKey)[0]?.value ?? "";
  return { provider, model };
}

/** Date display; em dash for missing/invalid values. */
export function formatConfigDate(value: string | null | undefined): string {
  if (!value) return "—";
  const t = Date.parse(value);
  if (Number.isNaN(t)) return "—";
  return new Date(t).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Card meta line: defaults vs saved + version + updated timestamp. */
export function formatRouteStamp(route: RouteConfigResponse): string {
  if (route.is_default) {
    return `Using code defaults · version ${route.version}`;
  }
  return `Saved · version ${route.version} · updated ${formatConfigDate(route.updated_at)}`;
}

export type HealthTone = "up" | "down" | "muted";

/** Badge for a health probe result: "up · 123ms" green, "down" red,
 *  "skipped" muted. */
export function healthBadge(result: ProviderHealthResult): {
  label: string;
  tone: HealthTone;
} {
  const latency = result.latency_ms != null ? ` · ${result.latency_ms}ms` : "";
  const label = `${result.status}${latency}`;
  if (result.status === "up") return { label, tone: "up" };
  if (result.status === "down") return { label, tone: "down" };
  return { label, tone: "muted" };
}
