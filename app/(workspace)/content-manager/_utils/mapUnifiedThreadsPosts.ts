import type { UnifiedPostsApiInstagramPost } from "@/lib/contentManager/unifiedPostsApi";

import type { ContentManagerPost } from "../_types/contentManagerTypes";
import { publishedAtIsoFromUnifiedPost } from "./publishedAtIsoFromUnifiedPost";
import { publishedPostUrlFromUnifiedPost } from "./publishedPostUrlFromUnifiedPost";

function formatMetric(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return String(value);
}

function pickPreviewImageUrl(post: UnifiedPostsApiInstagramPost): string | undefined {
  if (post.videos?.thumbnailUrl) {
    return post.videos.thumbnailUrl;
  }
  const urls = (post.images ?? [])
    .map((img) => img.url)
    .filter((u): u is string => typeof u === "string" && u.length > 0);
  return urls[0];
}

export function mapUnifiedThreadsToContentManagerPosts(
  slice: {
    posts?: UnifiedPostsApiInstagramPost[] | null;
  } | null | undefined,
  handleLabel: string,
): ContentManagerPost[] {
  const raw = slice?.posts;
  if (!raw?.length) {
    return [];
  }

  return raw.map((post) => ({
    id: post.id,
    status: "published",
    channel: "threads",
    handle: handleLabel,
    body: post.commentary?.trim() ?? "",
    imageUrl: pickPreviewImageUrl(post),
    metrics: {
      reach: formatMetric(post.impression_count ?? 0),
      likes: formatMetric(post.like_count ?? 0),
      comments: formatMetric(post.comment_count ?? 0),
    },
    publishedPostUrl: publishedPostUrlFromUnifiedPost(post),
    publishedAtIso: publishedAtIsoFromUnifiedPost(post),
    aiWatcherEnabled: post.ai_watcher_enabled ?? false,
  }));
}
