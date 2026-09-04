export type ComposerInlineSegmentKind = "text" | "bold" | "highlight";

export interface ComposerInlineSegment {
  readonly kind: ComposerInlineSegmentKind;
  readonly value: string;
}

const INLINE_TOKEN =
  /\*\*([^*]+)\*\*|(https?:\/\/[^\s<>"{}|\\^`[\]]+)|(@[\w.]+)|(#[\p{L}\p{N}_]+)/giu;

/** Split one line into plain text, **bold**, URLs, @mentions, and #hashtags. */
export function splitComposerInlineSegments(source: string): readonly ComposerInlineSegment[] {
  const matches = [...source.matchAll(INLINE_TOKEN)];
  if (matches.length === 0) {
    return [{ kind: "text", value: source }];
  }

  const out: ComposerInlineSegment[] = [];
  let last = 0;

  for (const match of matches) {
    const index = match.index ?? 0;
    if (index > last) {
      out.push({ kind: "text", value: source.slice(last, index) });
    }
    if (match[1] !== undefined) {
      out.push({ kind: "bold", value: match[1] });
    } else {
      out.push({ kind: "highlight", value: match[0] });
    }
    last = index + match[0].length;
  }

  if (last < source.length) {
    out.push({ kind: "text", value: source.slice(last) });
  }

  return out;
}

/** True when post body uses **bold** (composer WYSIWYG + preview segment path). */
export function composerBodyHasBoldMarkup(text: string): boolean {
  return /\*\*[^*]+\*\*/.test(text);
}

/** True when body needs full markdown renderer (headings, lists, etc.). */
export function composerBodyNeedsFullMarkdown(text: string): boolean {
  return /(^|\n)\s*#{1,6}\s|(^|\n)\s*[-*+]\s|(^|\n)\s*\d+\.\s|(^|\n)\s*>/.test(text);
}
