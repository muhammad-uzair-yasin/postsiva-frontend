import type { WebsiteAgentChatParsed } from "@/lib/userAgentChat/userAgentChatApi";

function isHttpUrl(s: string): boolean {
  return /^https?:\/\//i.test(s.trim());
}

function textIncludesUrl(text: string, url: string): boolean {
  const u = url.trim();
  return u.length > 0 && text.includes(u);
}

/**
 * Appends typed media from the agent's structured JSON
 * so {@link AiPipelineMarkdownContent} can render `<img>` and links.
 *
 * Skips URLs already present in the response body (e.g. model inlined `![](...)`).
 */
export function appendAgentStructuredMediaToMarkdown(
  responseText: string,
  parsed: Pick<WebsiteAgentChatParsed, "media"> | null | undefined,
): string {
  const base = (responseText ?? "").trimEnd();
  const media = Array.isArray(parsed?.media)
    ? parsed.media.filter(
        (item): item is { type: "image" | "video"; url: string } =>
          typeof item === "object" &&
          item !== null &&
          (item.type === "image" || item.type === "video") &&
          typeof item.url === "string" &&
          isHttpUrl(item.url),
      )
    : [];

  const chunks: string[] = base.length > 0 ? [base] : [];
  let accumulated = base;

  for (const item of media) {
    const u = item.url.trim();
    if (textIncludesUrl(accumulated, u)) {
      continue;
    }
    const block =
      item.type === "image" ? `\n\n![Generated image](${u})` : `\n\n[Video](${u})`;
    chunks.push(block);
    accumulated += block;
  }

  return chunks.join("").trim();
}

/**
 * Builds full assistant Markdown for the website channel: response, typed media, and table.
 */
export function buildWebsiteAgentAssistantMarkdown(
  responseText: string,
  parsed: WebsiteAgentChatParsed | null | undefined,
): string {
  let body = appendAgentStructuredMediaToMarkdown(responseText, parsed);
  const sections: string[] = [];

  const table = typeof parsed?.table === "string" ? parsed.table.trim() : "";
  if (table.length > 0) {
    sections.push(`\n\n---\n\n${table}`);
  }

  body = (body + sections.join("")).trim();
  return body;
}

type ParsedFromRaw = Pick<WebsiteAgentChatParsed, "media" | "table">;

/**
 * Parses archived `assistant.raw` (full agent JSON string) for structured website fields.
 */
export function parseAssistantRawForStructured(raw: string | undefined): ParsedFromRaw {
  if (raw === undefined || !raw.trim()) {
    return {};
  }
  try {
    const o = JSON.parse(raw) as Record<string, unknown>;
    const out: ParsedFromRaw = {};

    const media = Array.isArray(o.media)
      ? o.media.filter(
          (item): item is { type: "image" | "video"; url: string } => {
            if (typeof item !== "object" || item === null) return false;
            const candidate = item as Record<string, unknown>;
            return (
              (candidate.type === "image" || candidate.type === "video") &&
              typeof candidate.url === "string"
            );
          },
        )
      : undefined;
    if (media !== undefined && media.length > 0) {
      out.media = media;
    }

    if (typeof o.table === "string" && o.table.trim()) {
      out.table = o.table;
    }

    return out;
  } catch {
    return {};
  }
}

/**
 * Parses archived `assistant.raw` (full agent JSON string) for typed media.
 */
export function parseAssistantRawForMedia(
  raw: string | undefined,
): Pick<WebsiteAgentChatParsed, "media"> {
  const s = parseAssistantRawForStructured(raw);
  return s.media !== undefined ? { media: s.media } : {};
}
