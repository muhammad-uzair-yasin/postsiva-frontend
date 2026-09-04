import type { UnifiedPostsApiInstagramPost } from "@/lib/contentManager/unifiedPostsApi";

/** Maps unified post `permalink` to a browser-openable URL when present. */
export function publishedPostUrlFromUnifiedPost(
  post: UnifiedPostsApiInstagramPost,
): string | undefined {
  const raw = post.permalink;
  if (typeof raw !== "string") {
    return undefined;
  }
  const t = raw.trim();
  return t.length > 0 ? t : undefined;
}
