/**
 * Admin Main Writer playground — request body builder + response types.
 */

export interface MainWriterPlaygroundRequest {
  user_idea: string;
  brand_persona?: string;
  user_requirements?: string;
  target_platforms?: string[];
}

export interface RecommendedImageKeyword {
  query?: string;
  reason?: string;
}

export interface MainWriterPlaygroundResponse {
  success: boolean;
  elapsed_ms: number;
  content: string;
  youtube_title?: string | null;
  pinterest_title?: string | null;
  tiktok_title?: string | null;
  recommended_image_keywords?: RecommendedImageKeyword[];
  provider?: string | null;
  model?: string | null;
  attempt?: number | null;
  route_slot?: string | null;
  error?: string | null;
}

export const MAIN_WRITER_PLAYGROUND_PATH = "/admin/api/ai/main-writer/playground";

/** Human-readable duration for the response header. */
export function formatGenerationTime(elapsedMs: number): string {
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0) return "—";
  if (elapsedMs < 1000) return `${Math.round(elapsedMs)} ms`;
  const seconds = elapsedMs / 1000;
  return seconds < 10 ? `${seconds.toFixed(2)} s` : `${seconds.toFixed(1)} s`;
}

export interface MainWriterPlaygroundViewModel {
  success: boolean;
  elapsedMs: number;
  elapsedLabel: string;
  content: string;
  youtubeTitle: string | null;
  pinterestTitle: string | null;
  tiktokTitle: string | null;
  keywords: RecommendedImageKeyword[];
  provider: string | null;
  model: string | null;
  attempt: number | null;
  routeSlot: string | null;
  modelLabel: string | null;
  error: string | null;
}

export function formatRouteSlotLabel(routeSlot: string | null | undefined): string | null {
  if (!routeSlot?.trim()) return null;
  if (routeSlot === "primary") return "primary";
  const match = /^fallback_(\d+)$/.exec(routeSlot);
  if (match) return `fallback ${match[1]}`;
  return routeSlot;
}

export function formatModelUsedLabel(input: {
  provider?: string | null;
  model?: string | null;
  routeSlot?: string | null;
}): string | null {
  const provider = input.provider?.trim();
  const model = input.model?.trim();
  if (!provider && !model) return null;
  const slot = formatRouteSlotLabel(input.routeSlot);
  const base = [provider, model].filter(Boolean).join(" / ");
  return slot ? `${base} (${slot})` : base;
}

/** Strip markdown heading markers (legacy). Prefer {@link prepareMainWriterContentForPlatformPreview}. */
export function stripMarkdownHeadingMarkers(text: string): string {
  return text
    .split("\n")
    .map((line) => line.replace(/^\s{0,3}#{1,3}\s+/, ""))
    .join("\n");
}

function unwrapBold(text: string): string {
  const t = text.trim();
  const match = /^\*\*(.+)\*\*$/.exec(t);
  return match ? match[1].trim() : t;
}

function wrapBoldLine(text: string): string {
  const t = text.trim();
  if (!t) return text;
  if (/^\*\*.+\*\*$/.test(t)) return t;
  return `**${t}**`;
}

function isHashtagLine(line: string): boolean {
  const t = line.trim();
  if (!t.startsWith("#")) return false;
  return /^#[\p{L}\p{N}_]+(\s+#[\p{L}\p{N}_]+)*$/u.test(t);
}

/**
 * Platform mockups use markdown `**bold**` (LinkedIn-style), not `#` headings.
 * Converts main-writer structure into bold punch lines + section emphasis.
 */
export function prepareMainWriterContentForPlatformPreview(text: string): string {
  let sawPunchLine = false;

  return text
    .split("\n")
    .map((line) => {
      if (!line.trim()) return line;
      if (isHashtagLine(line)) return line;

      const headingMatch = line.match(/^\s{0,3}#{1,3}\s+(.*)$/);
      if (headingMatch) {
        return wrapBoldLine(headingMatch[1]);
      }

      const emojiHeading = line.match(EMOJI_SECTION_LINE);
      if (emojiHeading && !line.trim().startsWith("•")) {
        return wrapBoldLine(`${emojiHeading[2]} ${emojiHeading[3]}`);
      }

      if (!sawPunchLine) {
        sawPunchLine = true;
        return wrapBoldLine(line);
      }

      return line;
    })
    .join("\n");
}

const MARKDOWN_HEADING = /^\s{0,3}(#{1,3})\s+/;
const EMOJI_SECTION_LINE =
  /^(\s*)([\p{Extended_Pictographic}\u2600-\u27BF]+)\s+(.+)$/u;

function isSubheadingCandidate(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (MARKDOWN_HEADING.test(line)) return false;
  if (/^[•\-*]\s/.test(trimmed)) return false;
  if (/^#\w/.test(trimmed)) return false;
  return trimmed.length <= 90;
}

/** Normalize social post text for markdown preview (punch line, headings, bullets). */
export function postContentToMarkdown(text: string): string {
  const lines = text.split("\n");
  const out: string[] = [];
  let expectSubheading = false;
  let h2Count = 0;
  let sawPunchLine = false;

  for (const line of lines) {
    if (!line.trim()) {
      out.push(line);
      continue;
    }

    if (isHashtagLine(line)) {
      out.push(line);
      continue;
    }

    if (!sawPunchLine) {
      sawPunchLine = true;
      out.push(`# ${unwrapBold(line)}`);
      continue;
    }

    if (MARKDOWN_HEADING.test(line)) {
      out.push(line);
      const level = line.match(MARKDOWN_HEADING)?.[1]?.length ?? 0;
      if (level === 2) {
        h2Count += 1;
        expectSubheading = h2Count === 1;
      } else {
        expectSubheading = false;
      }
      continue;
    }

    const emojiHeading = line.match(EMOJI_SECTION_LINE);
    if (emojiHeading && !line.trim().startsWith("•")) {
      out.push(`${emojiHeading[1]}## ${emojiHeading[2]} ${emojiHeading[3]}`);
      h2Count += 1;
      expectSubheading = h2Count === 1;
      continue;
    }

    if (expectSubheading && isSubheadingCandidate(line)) {
      out.push(`### ${unwrapBold(line)}`);
      expectSubheading = false;
      continue;
    }

    expectSubheading = false;

    const bullet = line.match(/^(\s*)•\s?(.*)$/);
    if (bullet) {
      out.push(`${bullet[1]}- ${bullet[2]}`);
      continue;
    }

    const boldOnly = /^\*\*(.+)\*\*$/.exec(line.trim());
    if (boldOnly) {
      out.push(`**${boldOnly[1]}**`);
      continue;
    }

    out.push(line);
  }

  return out.join("\n").replace(/\n/g, "  \n");
}

export function buildMainWriterPlaygroundView(
  response: MainWriterPlaygroundResponse,
): MainWriterPlaygroundViewModel {
  const elapsedLabel = formatGenerationTime(response.elapsed_ms);
  return {
    success: response.success,
    elapsedMs: response.elapsed_ms,
    elapsedLabel,
    content: response.content ?? "",
    youtubeTitle: response.youtube_title ?? null,
    pinterestTitle: response.pinterest_title ?? null,
    tiktokTitle: response.tiktok_title ?? null,
    keywords: response.recommended_image_keywords ?? [],
    provider: response.provider ?? null,
    model: response.model ?? null,
    attempt: response.attempt ?? null,
    routeSlot: response.route_slot ?? null,
    modelLabel: formatModelUsedLabel({
      provider: response.provider,
      model: response.model,
      routeSlot: response.route_slot,
    }),
    error: response.success ? null : response.error?.trim() || "Main writer returned success=false.",
  };
}

export function buildMainWriterPlaygroundBody(input: {
  userIdea: string;
  brandPersona: string;
  userRequirements: string;
  targetPlatforms: string[];
}): MainWriterPlaygroundRequest {
  const user_idea = input.userIdea.trim();
  const brand_persona = input.brandPersona.trim();
  const user_requirements = input.userRequirements.trim();
  const target_platforms = input.targetPlatforms
    .map((platform) => platform.trim().toLowerCase())
    .filter(Boolean);

  const body: MainWriterPlaygroundRequest = { user_idea };
  if (brand_persona) body.brand_persona = brand_persona;
  if (user_requirements) body.user_requirements = user_requirements;
  if (target_platforms.length > 0) body.target_platforms = target_platforms;
  return body;
}

export function formatMainWriterPlaygroundResult(
  response: MainWriterPlaygroundResponse,
): {
  statusText: string;
  isError: boolean;
  elapsedMs: number;
  elapsedLabel: string;
  view: MainWriterPlaygroundViewModel;
} {
  const view = buildMainWriterPlaygroundView(response);

  if (!response.success) {
    return {
      statusText: `Failed · ${view.elapsedLabel}`,
      isError: true,
      elapsedMs: view.elapsedMs,
      elapsedLabel: view.elapsedLabel,
      view,
    };
  }

  return {
    statusText: `OK · ${view.elapsedLabel}`,
    isError: false,
    elapsedMs: view.elapsedMs,
    elapsedLabel: view.elapsedLabel,
    view,
  };
}
