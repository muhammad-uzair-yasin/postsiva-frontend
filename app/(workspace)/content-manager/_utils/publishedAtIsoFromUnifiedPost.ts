import type { UnifiedPostsApiInstagramPost } from "@/lib/contentManager/unifiedPostsApi";

/**
 * Normalize a published_at value to an ISO instant string.
 * TikTok (and some other APIs) may return unix seconds/ms as a digit string —
 * appending "Z" does not make those valid for `Date`, so convert explicitly.
 */
export function normalizePublishedAtIso(
  raw: string | null | undefined,
): string | undefined {
  const trimmed = raw?.trim();
  if (!trimmed) {
    return undefined;
  }
  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    const n = Number(trimmed);
    if (!Number.isFinite(n)) {
      return undefined;
    }
    const ms = n > 10_000_000_000 ? n : n * 1000;
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
  }
  const hasOffset = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(trimmed);
  return hasOffset ? trimmed : `${trimmed}Z`;
}

/** Normalized ISO instant from GET /unified/posts/ `published_at`. */
export function publishedAtIsoFromUnifiedPost(
  post: UnifiedPostsApiInstagramPost,
): string | undefined {
  return normalizePublishedAtIso(post.published_at);
}
