import type { UnifiedPostsApiInstagramPost } from "@/lib/contentManager/unifiedPostsApi";
import type { UnifiedScheduledPostItemJson } from "@/lib/social/unifiedScheduledPostsApi";
import {
  parseWordPressFromScheduledPostData,
  wordpressScheduledCardTitle,
  wordpressScheduledFeaturedImageUrl,
  wordpressScheduledPreviewText,
} from "@/lib/post-composer/parseWordPressScheduledPostData";
import { normalizePublishedAtIso } from "@/app/(workspace)/content-manager/_utils/publishedAtIsoFromUnifiedPost";

import type { CalendarPost } from "../_types/calendarTypes";
import { addDays, startOfDay } from "./postSchedulerCalendarWeekUtils";
import { formatStatCount } from "@/lib/dashboard/profileCard/formatStatCount";

function formatMetric(value: number): string {
  return formatStatCount(value);
}

function stringValue(data: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function firstArrayString(
  data: Record<string, unknown>,
  key: string,
): string | null {
  const value = data[key];
  if (!Array.isArray(value)) return null;
  const match = value.find(
    (item): item is string => typeof item === "string" && item.trim() !== "",
  );
  return match?.trim() ?? null;
}

function parseIsoInstant(raw: string | null | undefined): Date | null {
  const normalized = normalizePublishedAtIso(raw);
  if (!normalized) return null;
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseScheduledInstant(item: UnifiedScheduledPostItemJson): Date | null {
  const localWithOffset = item.scheduled_time_local?.trim();
  const utcRaw = item.scheduled_time?.trim();
  const raw = localWithOffset || utcRaw;
  if (!raw) return null;

  // Backend stores UTC but MySQL may serialize it without `Z`. Without this
  // suffix browsers interpret it as local time and can wrongly filter it as past.
  const hasOffset = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(raw);
  const normalized = !localWithOffset && !hasOffset ? `${raw}Z` : raw;
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function pickPreviewImageUrl(post: UnifiedPostsApiInstagramPost): string | null {
  if (post.videos?.thumbnailUrl?.trim()) {
    return post.videos.thumbnailUrl.trim();
  }
  const urls = (post.images ?? [])
    .map((img) => img.url)
    .filter((u): u is string => typeof u === "string" && u.length > 0);
  const nonMp4 = urls.find((u) => !/\.mp4(\?|$)/i.test(u));
  return nonMp4 ?? urls[0] ?? null;
}

function pickVideoUrl(post: UnifiedPostsApiInstagramPost): string | null {
  const url = post.videos?.videoUrl?.trim();
  return url && url.length > 0 ? url : null;
}

export function mapPublishedUnifiedPostToCalendarPost(
  post: UnifiedPostsApiInstagramPost,
  platform: string,
  accountLabel: string,
): CalendarPost | null {
  const publishedAt = parseIsoInstant(post.published_at ?? null);
  if (!publishedAt) return null;

  const postId = (post.post_id || post.id || "").trim();
  if (!postId) return null;

  const videoUrl = pickVideoUrl(post);
  const imageUrl = pickPreviewImageUrl(post);
  const caption =
    post.commentary?.trim() ||
    (platform === "wordpress" ? "WordPress post" : "Post");

  return {
    id: `published:${platform}:${postId}`,
    scheduledAt: publishedAt,
    postKind: "published",
    caption,
    previewText: caption,
    mediaUrl: imageUrl ?? videoUrl,
    mediaKind: videoUrl ? "video" : imageUrl ? "image" : null,
    platform,
    account: accountLabel,
    platformUserId: post.source_page_id?.trim() || undefined,
    status: "published",
    publishedPostUrl: post.permalink?.trim() || undefined,
    metrics: {
      likes: formatMetric(post.like_count ?? 0),
      comments: formatMetric(post.comment_count ?? 0),
      reach: formatMetric(post.impression_count ?? 0),
    },
  };
}

export function filterPostsInWeek(posts: CalendarPost[], weekStart: Date): CalendarPost[] {
  const start = startOfDay(weekStart);
  const end = addDays(start, 7);
  return posts.filter((post) => {
    const t = post.scheduledAt.getTime();
    return t >= start.getTime() && t < end.getTime();
  });
}

export function normalizeScheduledPost(item: UnifiedScheduledPostItemJson): CalendarPost | null {
  const scheduledAt = parseScheduledInstant(item);
  if (!scheduledAt) return null;
  const data = item.post_data ?? {};
  const isWordPress = item.platform?.trim().toLowerCase() === "wordpress";
  const videoUrl = stringValue(data, ["video_url"]);
  const wpFeatured = isWordPress ? wordpressScheduledFeaturedImageUrl(data) : null;
  const imageUrl =
    wpFeatured ??
    stringValue(data, [
      "default_image_url",
      "image_url",
      "media_url",
      "video_thumbnail_url",
      "thumbnail_url",
    ]) ??
    firstArrayString(data, "image_urls");
  const caption =
    isWordPress
      ? wordpressScheduledCardTitle(data)
      : (stringValue(data, ["default_text", "text", "caption", "message"]) ?? "");
  const previewText = isWordPress ? wordpressScheduledPreviewText(data) : caption;
  const wpFields = isWordPress ? parseWordPressFromScheduledPostData(data) : null;
  const isFailed = item.status?.trim().toLowerCase() === "failed";
  return {
    // The API exposes no composer/batch identity. Keep each row independent:
    // grouping by timestamp/content could merge unrelated posts scheduled together.
    id: item.scheduled_post_id,
    scheduledAt,
    postKind: isFailed ? "failed" : "scheduled",
    caption,
    previewText,
    mediaUrl: imageUrl ?? videoUrl,
    mediaKind:
      videoUrl || (isWordPress && item.post_type.toLowerCase().includes("video"))
        ? "video"
        : imageUrl
          ? "image"
          : null,
    platform: item.platform,
    account:
      stringValue(data, ["account_name", "page_name", "display_name", "username"]) ??
      item.platform_user_id,
    platformUserId: item.platform_user_id?.trim() || undefined,
    status: item.status,
    errorMessage: item.error_message?.trim() || undefined,
    source: item,
    ...(isWordPress
      ? {
          wordpressTitle: wpFields?.wordpress_title?.trim() || caption,
          wordpressExcerpt: wpFields?.wordpress_excerpt?.trim(),
          wordpressContent: wpFields?.wordpress_content?.trim(),
        }
      : {}),
  };
}

export function localDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function postsByDay(posts: CalendarPost[]): Map<string, CalendarPost[]> {
  const result = new Map<string, CalendarPost[]>();
  posts.forEach((post) => {
    const key = localDayKey(post.scheduledAt);
    result.set(key, [...(result.get(key) ?? []), post]);
  });
  result.forEach((items) =>
    items.sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime() || a.id.localeCompare(b.id)),
  );
  return result;
}
