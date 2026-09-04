import type { UnifiedPostsApiResponse } from "@/lib/contentManager/unifiedPostsApi";

import type {
  ContentManagerChannelFilter,
  ContentManagerPost,
} from "../_types/contentManagerTypes";
import { mapUnifiedBlueskyToContentManagerPosts } from "./mapUnifiedBlueskyPosts";
import { mapUnifiedFacebookToContentManagerPosts } from "./mapUnifiedFacebookPosts";
import { mapUnifiedInstagramToContentManagerPosts } from "./mapUnifiedInstagramPosts";
import { mapUnifiedLinkedinToContentManagerPosts } from "./mapUnifiedLinkedinPosts";
import { mapUnifiedMastodonToContentManagerPosts } from "./mapUnifiedMastodonPosts";
import { mapUnifiedPinterestToContentManagerPosts } from "./mapUnifiedPinterestPosts";
import { mapUnifiedThreadsToContentManagerPosts } from "./mapUnifiedThreadsPosts";
import { mapUnifiedTiktokToContentManagerPosts } from "./mapUnifiedTiktokPosts";
import { mapUnifiedYoutubeToContentManagerPosts } from "./mapUnifiedYoutubePosts";

type LabelsByFilter = Partial<Record<ContentManagerChannelFilter, string>>;

function labelFor(
  labels: LabelsByFilter,
  channel: ContentManagerChannelFilter,
  fallback: string,
): string {
  return labels[channel] ?? fallback;
}

/**
 * Maps one GET /unified/posts/ response slice → Content Manager cards for the active channel
 * (same shapes as per-platform published hooks).
 */
export function unifiedPostsResponseToPublishedPostsForChannel(
  channel: ContentManagerChannelFilter,
  labels: LabelsByFilter,
  data: UnifiedPostsApiResponse,
): ContentManagerPost[] {
  if (channel === "all") {
    return [];
  }
  if (channel === "instagram") {
    return mapUnifiedInstagramToContentManagerPosts(
      data.instagram ?? null,
      labelFor(labels, "instagram", "Instagram"),
    );
  }
  if (channel === "linkedin" || channel.startsWith("linkedin:")) {
    const handle = labelFor(labels, channel, labelFor(labels, "linkedin", "LinkedIn"));
    return mapUnifiedLinkedinToContentManagerPosts(data.linkedin ?? null, handle);
  }
  if (channel === "facebook" || channel.startsWith("facebook:")) {
    return mapUnifiedFacebookToContentManagerPosts(
      data.facebook ?? null,
      labelFor(labels, "facebook", "Facebook"),
    );
  }
  if (channel === "youtube") {
    return mapUnifiedYoutubeToContentManagerPosts(
      data.youtube ?? null,
      labelFor(labels, "youtube", "YouTube"),
    );
  }
  if (channel === "tiktok") {
    return mapUnifiedTiktokToContentManagerPosts(
      data.tiktok ?? null,
      labelFor(labels, "tiktok", "TikTok"),
    );
  }
  if (channel === "threads") {
    return mapUnifiedThreadsToContentManagerPosts(
      data.threads ?? null,
      labelFor(labels, "threads", "Threads"),
    );
  }
  if (channel === "bluesky") {
    return mapUnifiedBlueskyToContentManagerPosts(
      data.bluesky ?? null,
      labelFor(labels, "bluesky", "Bluesky"),
    );
  }
  if (channel === "mastodon") {
    return mapUnifiedMastodonToContentManagerPosts(
      data.mastodon ?? null,
      labelFor(labels, "mastodon", "Mastodon"),
    );
  }
  if (channel === "pinterest") {
    return mapUnifiedPinterestToContentManagerPosts(
      data.pinterest ?? null,
      labelFor(labels, "pinterest", "Pinterest"),
    );
  }
  return [];
}
