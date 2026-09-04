import type { CalendarPost } from "../_types/calendarTypes";

function isLikelyVideoUrl(url: string): boolean {
  return /\.(mp4|webm|mov|m4v|mkv)(\?|$)/i.test(url.trim());
}

function stringValue(data: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

/** Resolve full-size image/video URLs for calendar media preview. */
export function calendarPostPreviewMedia(post: CalendarPost): {
  readonly imageUrl: string | null;
  readonly videoUrl: string | null;
} {
  const mediaUrl = post.mediaUrl?.trim() || null;
  if (!mediaUrl) {
    return { imageUrl: null, videoUrl: null };
  }

  if (post.mediaKind !== "video") {
    return { imageUrl: mediaUrl, videoUrl: null };
  }

  const sourceVideo =
    post.source?.post_data && typeof post.source.post_data === "object"
      ? stringValue(post.source.post_data as Record<string, unknown>, ["video_url"])
      : null;
  const playbackUrl =
    sourceVideo ?? (isLikelyVideoUrl(mediaUrl) ? mediaUrl : null);

  return {
    imageUrl: playbackUrl ? null : mediaUrl,
    videoUrl: playbackUrl ?? (isLikelyVideoUrl(mediaUrl) ? mediaUrl : null),
  };
}
