/** Client-side fallback when API title still contains Facebook engagement blob. */

const BIDI = /[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g;
const ENGAGEMENT =
  /ویوز|views|ردعمل|reactions|plays|ကြည|react/i;

export function collapseLinkPreviewText(value: string): string {
  return value
    .replace(BIDI, "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function looksLikeEngagement(chunk: string): boolean {
  const c = chunk.trim();
  if (!c) return true;
  return ENGAGEMENT.test(c);
}

/** Headline for link card when backend already split engagement_summary. */
export function linkPreviewDisplayTitle(
  rawTitle: string | null | undefined,
  engagementSummary: string | null | undefined,
  domainFallback: string,
): string {
  const engagement = collapseLinkPreviewText(engagementSummary ?? "");
  let title = collapseLinkPreviewText(rawTitle ?? "");

  if (!title && !engagement) {
    return "";
  }

  if (!title) {
    return engagement && !looksLikeEngagement(engagement) ? engagement.slice(0, 240) : "";
  }

  if (looksLikeEngagement(title) && !engagement) {
    const parts = title
      .split(/[|·•]/)
      .map((p) => p.trim())
      .filter(Boolean);
    const headline = parts.find((p) => !looksLikeEngagement(p) && p.length <= 120);
    return headline ? headline.slice(0, 240) : "";
  }

  if (engagement && title.includes(engagement.slice(0, Math.min(engagement.length, 24)))) {
    title = title.replace(engagement, " ").trim();
  }

  if (engagement || title.length > 80 || looksLikeEngagement(title)) {
    const parts = title
      .split(/[|·•]/)
      .map((p) => p.trim())
      .filter(Boolean);
    const headline = parts.find((p) => !looksLikeEngagement(p) && p.length <= 120);
    if (headline) {
      return headline.slice(0, 240);
    }
    if (looksLikeEngagement(title)) {
      return "";
    }
  }

  return title.slice(0, 240) || domainFallback;
}
