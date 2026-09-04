import type { WordPressBlogPost } from "@/lib/social/wordpressPostsApi";
import type { WordPressMediaItem } from "@/lib/social/wordpressMediaApi";

export function normalizeWordPressMediaUrl(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || null;
  }
  if (Array.isArray(value)) {
    const first = value[0];
    if (typeof first === "string") {
      const trimmed = first.trim();
      return trimmed || null;
    }
  }
  return null;
}

export function enrichBlogImageUrl(url: string): string {
  if (!url.includes("images.unsplash.com")) return url;
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("auto", "format");
    parsed.searchParams.set("fit", "crop");
    parsed.searchParams.set("w", "1400");
    parsed.searchParams.set("q", "80");
    parsed.searchParams.delete("h");
    return parsed.toString();
  } catch {
    return url;
  }
}

export function buildWordPressMediaMap(media: WordPressMediaItem[]): Map<number, string> {
  const map = new Map<number, string>();
  for (const item of media) {
    const url = normalizeWordPressMediaUrl(item.source_url);
    if (item.id && url) map.set(item.id, enrichBlogImageUrl(url));
  }
  return map;
}

export function featuredMediaUrlForPost(
  post: WordPressBlogPost,
  mediaById: Map<number, string>,
): string | null {
  const direct = normalizeWordPressMediaUrl(post.featured_media_url);
  if (direct) return enrichBlogImageUrl(direct);
  if (!post.featured_media) return null;
  return mediaById.get(post.featured_media) ?? null;
}

export function featuredMediaUrlsForPosts(
  posts: WordPressBlogPost[],
  media: WordPressMediaItem[],
  connectionId?: string,
): string[] {
  const mediaById = buildWordPressMediaMap(media);
  return posts
    .filter((post) => !connectionId || post.connection_id === connectionId)
    .map((post) => featuredMediaUrlForPost(post, mediaById))
    .filter((url): url is string => Boolean(url));
}
