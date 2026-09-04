/**
 * Types + pure helpers for the admin AI Providers page (catalog + probes).
 *
 * Mirrors the legacy admin `script-ai-providers.js` / `script-ai-provider-tests.js`
 * request bodies and result formatting exactly. No fetch calls here — hooks own I/O.
 */

export interface ProviderModel {
  id: string;
  label: string;
  /** "text" | "image" — legacy defaults missing kind to "text". */
  kind?: string;
  /** "live" | "fallback" — legacy defaults missing source to "fallback". */
  source?: string;
  supports_vision?: boolean;
  supports_video?: boolean;
}

export interface ProviderCatalogItem {
  id: string;
  label: string;
  configured: boolean;
  models: ProviderModel[];
}

export interface ProviderCatalogResponse {
  providers?: ProviderCatalogItem[];
}

export interface AdminWorkspace {
  id: string;
  name?: string | null;
}

export interface GalleryMediaItem {
  media_id: string;
  original_filename?: string | null;
  filename?: string | null;
}

export interface PivaProbeResponse {
  success?: boolean;
  provider?: string;
  model?: string;
  workspace_id?: string;
  elapsed_ms?: number;
  agent_response_json?: string | null;
  parsed?: { response?: unknown } | null;
  error?: string | null;
}

export interface DirectProbeResponse {
  provider?: string;
  model?: string;
  elapsed_ms?: number;
  response?: string | null;
}

export interface ClearChatHistoryResponse {
  success?: boolean;
  workspace_id?: string;
  deleted_archived_turns?: number;
  message?: string;
}

/** Normalized outcome shown in the shared result panel. */
export interface ProbeOutcome {
  ok: boolean;
  statusText: string;
  resultText: string;
}

// ---------------------------------------------------------------------------
// Catalog helpers
// ---------------------------------------------------------------------------

export function textModels(provider: ProviderCatalogItem | undefined): ProviderModel[] {
  return (provider?.models ?? []).filter((m) => (m.kind ?? "text") === "text");
}

export function visionModels(provider: ProviderCatalogItem | undefined): ProviderModel[] {
  return textModels(provider).filter((m) => m.supports_vision === true);
}

export function imageModels(provider: ProviderCatalogItem | undefined): ProviderModel[] {
  return (provider?.models ?? []).filter((m) => m.kind === "image");
}

/** Keep visible model names identical to provider model IDs. */
export function modelOptionLabel(model: ProviderModel, tag?: string): string {
  void tag;
  return model.id;
}

export function providerOptionLabel(provider: ProviderCatalogItem): string {
  return provider.configured ? provider.label : `${provider.label} (not configured)`;
}

export function firstConfiguredProviderId(
  providers: ProviderCatalogItem[],
): string | null {
  return providers.find((p) => p.configured)?.id ?? null;
}

/** `Name (12345678…)` — matches the legacy workspace option text. */
export function workspaceOptionLabel(workspace: AdminWorkspace): string {
  return `${workspace.name || "Workspace"} (${String(workspace.id).slice(0, 8)}…)`;
}

export function galleryMediaLabel(item: GalleryMediaItem): string {
  return item.original_filename || item.filename || item.media_id;
}

// ---------------------------------------------------------------------------
// Probe request builders — return null when required inputs are missing.
// ---------------------------------------------------------------------------

export interface PivaProbeBody {
  workspace_id: string;
  provider: string;
  model: string;
  message: string;
}

export function buildPivaProbeBody(
  workspaceId: string,
  provider: string,
  model: string,
  message: string,
): PivaProbeBody | null {
  const trimmed = message.trim();
  if (!workspaceId || !provider || !model || !trimmed) return null;
  return { workspace_id: workspaceId, provider, model, message: trimmed };
}

export interface DirectTextProbeBody {
  provider: string;
  model: string;
  prompt: string;
}

export function buildDirectTextProbeBody(
  provider: string,
  model: string,
  prompt: string,
): DirectTextProbeBody | null {
  const trimmed = prompt.trim();
  if (!provider || !model || !trimmed) return null;
  return { provider, model, prompt: trimmed };
}

export interface MediaProbeBody {
  workspace_id: string;
  media_id: string;
  provider: "pollinations";
  model: string;
  prompt: string;
}

export function buildMediaProbeBody(
  workspaceId: string,
  mediaId: string,
  model: string,
  prompt: string,
): MediaProbeBody | null {
  const trimmed = prompt.trim();
  if (!workspaceId || !mediaId || !model || !trimmed) return null;
  // Legacy always probes vision via pollinations.
  return {
    workspace_id: workspaceId,
    media_id: mediaId,
    provider: "pollinations",
    model,
    prompt: trimmed,
  };
}

export interface ImageGenerationProbeBody {
  model: string;
  prompt: string;
}

export function buildImageGenerationProbeBody(
  model: string,
  prompt: string,
): ImageGenerationProbeBody | null {
  const trimmed = prompt.trim();
  if (!model || !trimmed) return null;
  return { model, prompt: trimmed };
}

// ---------------------------------------------------------------------------
// Result normalization — status lines match the legacy page verbatim.
// ---------------------------------------------------------------------------

function asText(value: unknown): string | null {
  if (typeof value === "string" && value) return value;
  if (value != null && typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }
  return null;
}

export function normalizePivaProbeResult(data: PivaProbeResponse): ProbeOutcome {
  const ok = Boolean(data.success);
  const elapsed = data.elapsed_ms ?? 0;
  if (!ok) {
    return {
      ok,
      statusText: `Failed · ${elapsed}ms`,
      resultText: data.error || "Probe failed",
    };
  }
  const resultText =
    asText(data.parsed?.response) ||
    data.agent_response_json ||
    JSON.stringify(data, null, 2);
  return {
    ok,
    statusText: `OK · ${data.provider}/${data.model} · ${elapsed}ms`,
    resultText,
  };
}

export function normalizeDirectTextResult(data: DirectProbeResponse): ProbeOutcome {
  return {
    ok: true,
    statusText: `Direct OK · ${data.provider}/${data.model} · ${data.elapsed_ms}ms`,
    resultText: data.response || JSON.stringify(data, null, 2),
  };
}

export function normalizeMediaProbeResult(data: DirectProbeResponse): ProbeOutcome {
  return {
    ok: true,
    statusText: `Analysis OK · ${data.model} · ${data.elapsed_ms}ms`,
    resultText: data.response || JSON.stringify(data, null, 2),
  };
}

export function normalizeClearHistoryResult(
  data: ClearChatHistoryResponse,
): ProbeOutcome {
  return {
    ok: true,
    statusText: `Cleared · ${data.deleted_archived_turns ?? 0} archived turn(s)`,
    resultText: data.message || "Chat history cleared.",
  };
}

export function imageGenerationOutcome(model: string): ProbeOutcome {
  return {
    ok: true,
    statusText: `Image OK · ${model}`,
    resultText: "Image generated — see the preview below.",
  };
}

export function clearHistoryConfirmMessage(workspaceLabel: string): string {
  return (
    `Clear all Piva chat history for:\n\n${workspaceLabel}\n\n` +
    "This deletes LangGraph memory and archived turns for WhatsApp, website, and mobile."
  );
}

export function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
