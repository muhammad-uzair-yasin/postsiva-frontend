export type ArticlePartKind = "heading" | "subheading" | "paragraph" | "image" | "video";
export interface ArticlePart { id: string; kind: ArticlePartKind; value: string }

export function textFromHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 10)),
    )
    .replace(/&#8217;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&hellip;/g, "...")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function mediaFromHtml(html: string): { url: string; type: "image" | "video" } | null {
  const image = html.match(/<img[^>]*src=["']([^"']+)["']/i)?.[1];
  if (image) return { url: image, type: "image" };
  const video = html.match(/<video[^>]*src=["']([^"']+)["']/i)?.[1];
  if (video) return { url: video, type: "video" };
  return null;
}

export function partsFromHtml(html: string): ArticlePart[] {
  const matches = html.match(/<(h[1-3]|p|figure|video)[\s\S]*?<\/\1>|<img[^>]*>/gi) ?? [];
  const parts = matches
    .map((part, index): ArticlePart | null => {
      const src = part.match(/src=["']([^"']+)["']/i)?.[1] ?? "";
      if (/^<img|^<figure/i.test(part) && src) return { id: `${index}`, kind: "image", value: src };
      if (/^<video/i.test(part) && src) return { id: `${index}`, kind: "video", value: src };
      const value = textFromHtml(part);
      if (!value) return null;
      if (/^<h3/i.test(part)) return { id: `${index}`, kind: "subheading", value };
      return { id: `${index}`, kind: /^<h/i.test(part) ? "heading" : "paragraph", value };
    })
    .filter((part): part is ArticlePart => part !== null);
  if (parts.length > 0) return parts;
  return [{ id: "0", kind: "paragraph", value: textFromHtml(html) }];
}

export function htmlFromParts(parts: ArticlePart[]): string {
  return parts
    .map((part) => {
      const value = part.value.trim();
      if (!value) return "";
      if (part.kind === "image") return `<figure><img src="${value}" alt="" /></figure>`;
      if (part.kind === "video") return `<video controls src="${value}"></video>`;
      if (part.kind === "heading") return `<h2>${value}</h2>`;
      if (part.kind === "subheading") return `<h3>${value}</h3>`;
      return `<p>${value}</p>`;
    })
    .filter(Boolean)
    .join("\n");
}

export function hasInlineMedia(html: string): boolean {
  return /<(img|figure|video)\b/i.test(html);
}

export function insertImageAt(parts: ArticlePart[], index: number, url: string): ArticlePart[] {
  const trimmed = url.trim();
  if (!trimmed) return parts;
  const safeIndex = Math.max(0, Math.min(index, parts.length));
  return [
    ...parts.slice(0, safeIndex),
    { id: crypto.randomUUID(), kind: "image", value: trimmed },
    ...parts.slice(safeIndex),
  ];
}

export function removePartAt(parts: ArticlePart[], index: number): ArticlePart[] {
  if (index < 0 || index >= parts.length) return parts;
  return [...parts.slice(0, index), ...parts.slice(index + 1)];
}

/** Remove inline body image when the same URL is shown as the featured hero. */
export function stripFeaturedImageFromHtml(html: string, featuredUrl: string): string {
  const url = featuredUrl.trim();
  if (!url || !html.trim()) {
    return html;
  }
  const escaped = url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return html
    .replace(
      new RegExp(`<figure>\\s*<img[^>]*src=["']${escaped}["'][^>]*/?>\\s*</figure>`, "gi"),
      "",
    )
    .replace(new RegExp(`<img[^>]*src=["']${escaped}["'][^>]*/?>`, "gi"), "")
    .trim();
}

/** Place the first recommended stock image after the first heading when the article has none yet. */
export function insertRecommendedAfterFirstHeading(html: string, imageUrl: string): string {
  const url = imageUrl.trim();
  if (!url || hasInlineMedia(html)) return html;
  const parts = partsFromHtml(html);
  const firstHeading = parts.findIndex((part) => part.kind === "heading");
  const insertAt = firstHeading >= 0 ? firstHeading + 1 : parts.length;
  return htmlFromParts(insertImageAt(parts, insertAt, url));
}

function pickRandomInsertIndices(slotCount: number, imageCount: number): number[] {
  if (slotCount <= 0 || imageCount <= 0) return [];
  const slots = Array.from({ length: slotCount }, (_, index) => index);
  for (let i = slots.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [slots[i], slots[j]] = [slots[j], slots[i]];
  }
  return slots.slice(0, imageCount).sort((a, b) => b - a);
}

/** Insert up to `maxImages` stock URLs at random positions in the article body. */
export function insertRecommendedImagesAtRandomPlaces(
  html: string,
  imageUrls: string[],
  maxImages = 3,
): string {
  const urls = imageUrls.map((url) => url.trim()).filter(Boolean).slice(0, maxImages);
  if (!urls.length || !html.trim()) return html;

  let parts = partsFromHtml(html);
  const slotCount = parts.length + 1;
  const insertIndices = pickRandomInsertIndices(slotCount, urls.length);
  if (!insertIndices.length) return html;

  for (let i = 0; i < insertIndices.length; i += 1) {
    parts = insertImageAt(parts, insertIndices[i] ?? parts.length, urls[i] ?? "");
  }
  return htmlFromParts(parts);
}

export function readMinutes(parts: ArticlePart[]): number {
  const words = parts
    .filter((part) => part.kind === "heading" || part.kind === "subheading" || part.kind === "paragraph")
    .map((part) => part.value)
    .join(" ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
