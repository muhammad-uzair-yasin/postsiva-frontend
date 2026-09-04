import { partsFromHtml } from "@/app/(workspace)/wordpress/blogs/_components/wordpressArticleParts";

/** Plain-text article body for the composer textarea (matches AI generation `content`). */
export function wordpressPlainTextFromHtml(html: string): string {
  const trimmed = html.trim();
  if (!trimmed) {
    return "";
  }
  return partsFromHtml(trimmed)
    .filter((part) => part.kind !== "image" && part.kind !== "video")
    .map((part) => part.value.trim())
    .filter(Boolean)
    .join("\n\n");
}
