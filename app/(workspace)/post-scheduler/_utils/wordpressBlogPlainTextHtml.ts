import {
  htmlFromParts,
  partsFromHtml,
  textFromHtml,
  type ArticlePart,
} from "../../wordpress/blogs/_components/wordpressArticleParts";

/** Plain text for the blog body editor (prefer HTML parts when present). */
export function wordPressBodyPlainForEditor(html: string, fallbackPlain: string): string {
  const fromHtml = textFromHtml(html);
  if (fromHtml.trim()) {
    return partsFromHtml(html)
      .filter((p) => p.kind === "heading" || p.kind === "subheading" || p.kind === "paragraph")
      .map((p) => p.value)
      .join("\n\n");
  }
  return fallbackPlain;
}

/** Simple paragraph HTML from plain text (composer typing). Preserves existing images if re-syncing empty. */
export function plainTextToWordPressHtml(plain: string): string {
  const trimmed = plain.trim();
  if (!trimmed) {
    return "";
  }
  const blocks = trimmed.split(/\n\n+/).map((block) => block.trim()).filter(Boolean);
  const parts: ArticlePart[] = blocks.map((value, index) => ({
    id: `p-${index}`,
    kind: value.length < 80 && !value.includes(".") ? "heading" : "paragraph",
    value,
  }));
  return htmlFromParts(parts);
}
