const SINGLE_MEDIA_KEYS = [
  "media_id",
  "image_id",
  "video_id",
  "document_id",
  "default_image_id",
  "thumbnail_media_id",
  "thumbnail_image_id",
  "linkedin_thumbnail_media_id",
  "youtube_thumbnail_media_id",
] as const;

const ARRAY_MEDIA_KEYS = ["media_ids", "image_ids"] as const;

/** Collect unified media UUIDs referenced in a scheduled post's post_data. */
export function collectMediaIdsFromScheduledPostData(
  postData: Record<string, unknown> | null | undefined,
): string[] {
  if (!postData) {
    return [];
  }
  const ids: string[] = [];
  for (const key of SINGLE_MEDIA_KEYS) {
    const value = postData[key];
    if (typeof value === "string" && value.trim()) {
      ids.push(value.trim());
    }
  }
  for (const key of ARRAY_MEDIA_KEYS) {
    const values = postData[key];
    if (!Array.isArray(values)) {
      continue;
    }
    for (const entry of values) {
      if (typeof entry === "string" && entry.trim()) {
        ids.push(entry.trim());
      }
    }
  }
  return ids;
}

export const SCHEDULED_MEDIA_BLOCK_MESSAGE =
  "Connected to a scheduled post";
