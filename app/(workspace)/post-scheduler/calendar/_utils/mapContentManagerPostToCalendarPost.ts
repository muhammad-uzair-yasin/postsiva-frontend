import type { ContentManagerPost } from "@/app/(workspace)/content-manager/_types/contentManagerTypes";
import { parseContentManagerScheduledAt } from "@/app/(workspace)/content-manager/_utils/groupContentManagerScheduledPostsByDay";
import { normalizePublishedAtIso } from "@/app/(workspace)/content-manager/_utils/publishedAtIsoFromUnifiedPost";

import type { CalendarPost } from "../_types/calendarTypes";

function parseIsoInstant(raw: string | null | undefined): Date | null {
  const normalized = normalizePublishedAtIso(raw);
  if (!normalized) {
    return null;
  }
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** Maps Content Manager published cache rows → calendar week cards. */
export function mapContentManagerPostToCalendarPost(
  post: ContentManagerPost,
): CalendarPost | null {
  if (post.status !== "published") {
    return null;
  }
  const publishedAt = parseIsoInstant(post.publishedAtIso);
  if (!publishedAt) {
    return null;
  }

  const caption = post.body?.trim() || post.title?.trim() || "Post";
  const videoUrl = post.videoUrl?.trim();
  const imageUrl = post.imageUrl?.trim();

  return {
    id: `published:${post.channel}:${post.id}`,
    scheduledAt: publishedAt,
    postKind: "published",
    caption,
    previewText: caption,
    mediaUrl: imageUrl ?? videoUrl ?? null,
    mediaKind: videoUrl ? "video" : imageUrl ? "image" : null,
    platform: post.channel,
    account: post.handle,
    platformUserId:
      post.pageId?.trim() ||
      post.organizationId?.trim() ||
      post.youtubeChannelId?.trim() ||
      undefined,
    status: "published",
    publishedPostUrl: post.publishedPostUrl,
    metrics: post.metrics
      ? {
          likes: post.metrics.likes,
          comments: post.metrics.comments,
          reach: post.metrics.reach,
        }
      : undefined,
  };
}

/** Maps Content Manager scheduled rows → calendar week grid cards. */
export function mapContentManagerScheduledPostToCalendarPost(
  post: ContentManagerPost,
): CalendarPost | null {
  if (post.status !== "scheduled") {
    return null;
  }
  const scheduledAt = parseContentManagerScheduledAt(post);
  if (!scheduledAt) {
    return null;
  }
  const caption = post.body?.trim() || post.title?.trim() || "Post";
  const videoUrl = post.videoUrl?.trim();
  const imageUrl = post.imageUrl?.trim();
  return {
    id: post.sourceScheduledPostId ?? post.id,
    scheduledAt,
    postKind: "scheduled",
    caption,
    previewText: caption,
    mediaUrl: imageUrl ?? videoUrl ?? null,
    mediaKind: videoUrl ? "video" : imageUrl ? "image" : null,
    platform: post.channel,
    account: post.handle,
    platformUserId:
      post.pageId?.trim() ||
      post.organizationId?.trim() ||
      post.scheduledPayload?.platform_user_id?.trim() ||
      undefined,
    status: "scheduled",
    source: post.scheduledPayload,
  };
}
