import type { UnifiedScheduledPostItemJson } from "@/lib/social/unifiedScheduledPostsApi";
import {
  wordpressScheduledCardTitle,
  wordpressScheduledFeaturedImageUrl,
  wordpressScheduledPreviewText,
} from "@/lib/post-composer/parseWordPressScheduledPostData";

import type {
  ContentManagerChannel,
  ContentManagerPost,
} from "../_types/contentManagerTypes";

const CHANNELS: ReadonlySet<string> = new Set([
  "instagram",
  "linkedin",
  "facebook",
  "threads",
  "tiktok",
  "youtube",
  "pinterest",
  "bluesky",
  "mastodon",
  "x",
]);

function firstHttpUrl(values: readonly unknown[]): string | null {
  for (const v of values) {
    if (typeof v === "string") {
      const t = v.trim();
      if (/^https?:\/\//i.test(t)) {
        return t;
      }
    }
  }
  return null;
}

function firstLine(text: string): string {
  // Handle cases where text might be a stringified object (e.g., post_data dump)
  const raw = String(text ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .trim();
  
  if (!raw || raw.startsWith("{") || raw.startsWith("[")) {
    return "Scheduled post";
  }
  
  const line = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)[0];
  return (line ?? raw).slice(0, 120);
}

function platformToChannel(platform: string): ContentManagerChannel {
  const p = platform.trim().toLowerCase();
  if (p === "twitter") {
    return "x";
  }
  if (CHANNELS.has(p)) {
    return p as ContentManagerChannel;
  }
  return "instagram";
}

function scheduleBadgeLabel(item: UnifiedScheduledPostItemJson): string {
  if (item.scheduled_time_formatted?.trim()) {
    return item.scheduled_time_formatted.trim();
  }
  const raw =
    item.scheduled_time_local?.trim() ?? item.scheduled_time?.trim() ?? "";
  if (!raw) {
    return "Scheduled";
  }
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) {
    return "Scheduled";
  }
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function mapUnifiedScheduledPostToContentManagerPost(
  item: UnifiedScheduledPostItemJson,
): ContentManagerPost {
  const pd = item.post_data ?? {};
  const isWordPress = item.platform?.trim().toLowerCase() === "wordpress";
  const body = isWordPress
    ? wordpressScheduledPreviewText(pd)
    : (() => {
        const textRaw =
          pd.default_text ?? pd.text ?? pd.caption ?? pd.message;
        // Ensure we have a string, not an object
        const str = typeof textRaw === "string" ? textRaw.trim() : String(textRaw ?? "").trim();
        // Reject if it looks like a stringified object or empty
        if (!str || str.startsWith("{") || str.startsWith("[")) {
          return "";
        }
        return str;
      })();
  const defaultImage =
    typeof pd.default_image_url === "string" ? pd.default_image_url.trim() : "";
  const wpFeatured = isWordPress ? wordpressScheduledFeaturedImageUrl(pd) : null;
  const imageUrls = Array.isArray(pd.image_urls) ? pd.image_urls : [];
  const videoRaw = pd.video_url;
  const videoUrl =
    typeof videoRaw === "string" && videoRaw.trim() ? videoRaw.trim() : "";
  const thumbnailRaw = pd.video_thumbnail_url ?? pd.thumbnail_url;
  const videoThumbnailUrl =
    typeof thumbnailRaw === "string" && thumbnailRaw.trim()
      ? thumbnailRaw.trim()
      : "";

  const imageUrl =
    firstHttpUrl([wpFeatured ?? ""]) ??
    firstHttpUrl([defaultImage]) ??
    firstHttpUrl([videoThumbnailUrl]) ??
    firstHttpUrl(imageUrls as unknown[]) ??
    undefined;
  const videoPreviewUrl = firstHttpUrl([videoUrl]) ?? undefined;

  let draftMedia: ContentManagerPost["draftMedia"] = "empty";
  if (videoPreviewUrl) {
    draftMedia = "video";
  } else if (imageUrl) {
    draftMedia = "image";
  }

  const channel = platformToChannel(item.platform ?? "");
  const platformUserId = item.platform_user_id?.trim() ?? "";

  return {
    id: item.scheduled_post_id,
    status: item.status?.trim().toLowerCase() === "failed" ? "failed" : "scheduled",
    channel,
    handle: isWordPress ? "" : platformUserId,
    body: body || "—",
    title: isWordPress
      ? wordpressScheduledCardTitle(pd)
      : firstLine(body || "Scheduled post"),
    imageUrl,
    videoUrl: videoPreviewUrl,
    scheduleLabel: scheduleBadgeLabel(item),
    draftMedia,
    sourceScheduledPostId: item.scheduled_post_id,
    scheduledPayload: item,
    pageId: channel === "facebook" ? platformUserId || undefined : undefined,
    organizationId:
      channel === "linkedin" ? platformUserId || undefined : undefined,
  };
}
