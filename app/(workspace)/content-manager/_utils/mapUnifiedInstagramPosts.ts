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
  const nonMp4 = urls.find((u) => !/\.mp4(\?|$)/i.test(u));
  return nonMp4 ?? urls[0];
}

function readInsightsById(
  platformMeta: unknown,
): Record<string, { reach?: number; saved?: number }> {
  if (!platformMeta || typeof platformMeta !== "object") {
    return {};
  }
  const raw = (platformMeta as { insights_by_id?: unknown }).insights_by_id;
  if (!raw || typeof raw !== "object") {
    return {};
  }
  return raw as Record<string, { reach?: number; saved?: number }>;
}

export function mapUnifiedInstagramToContentManagerPosts(
  slice: {
    posts?: UnifiedPostsApiInstagramPost[] | null;
    platform_meta?: unknown;
  } | null | undefined,
  handleLabel: string,
): ContentManagerPost[] {
  const raw = slice?.posts;
  if (!raw?.length) {
    return [];
  }
  const insights = readInsightsById(slice?.platform_meta);

  return raw.map((post) => {
    const reach = insights[post.id]?.reach ?? post.impression_count ?? 0;
    return {
      id: post.id,
      status: "published",
      channel: "instagram",
      handle: handleLabel,
      body: post.commentary?.trim() ?? "",
      imageUrl: pickPreviewImageUrl(post),
      metrics: {
        reach: formatMetric(reach),
        likes: formatMetric(post.like_count ?? 0),
        comments: formatMetric(post.comment_count ?? 0),
      },
      publishedPostUrl: publishedPostUrlFromUnifiedPost(post),
      publishedAtIso: publishedAtIsoFromUnifiedPost(post),
    aiWatcherEnabled: post.ai_watcher_enabled ?? false,
    };
  });
}
