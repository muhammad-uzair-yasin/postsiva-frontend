import type { UnifiedPostsApiResponse } from "@/lib/contentManager/unifiedPostsApi";

import type { ContentManagerPost } from "../_types/contentManagerTypes";
import { mapUnifiedBlueskyToContentManagerPosts } from "./mapUnifiedBlueskyPosts";
import { mapUnifiedFacebookToContentManagerPosts } from "./mapUnifiedFacebookPosts";
import { mapUnifiedInstagramToContentManagerPosts } from "./mapUnifiedInstagramPosts";
import { mapUnifiedLinkedinToContentManagerPosts } from "./mapUnifiedLinkedinPosts";
import { mapUnifiedMastodonToContentManagerPosts } from "./mapUnifiedMastodonPosts";
import { mapUnifiedPinterestToContentManagerPosts } from "./mapUnifiedPinterestPosts";
import { mapUnifiedThreadsToContentManagerPosts } from "./mapUnifiedThreadsPosts";
import { mapUnifiedTiktokToContentManagerPosts } from "./mapUnifiedTiktokPosts";
import { mapUnifiedWordpressToContentManagerPosts } from "./mapUnifiedWordpressPosts";
import { mapUnifiedYoutubeToContentManagerPosts } from "./mapUnifiedYoutubePosts";

/**
 * Map GET /unified/posts/{postId}?refresh=true response → Content Manager cards.
 */
export function mapUnifiedSinglePostRefreshResponse(
  data: UnifiedPostsApiResponse,
  platform: string,
  handleLabel: string,
): ContentManagerPost[] {
  const p = platform.trim().toLowerCase();
  if (p === "instagram") {
    return mapUnifiedInstagramToContentManagerPosts(data.instagram ?? null, handleLabel);
  }
  if (p === "linkedin") {
    return mapUnifiedLinkedinToContentManagerPosts(data.linkedin ?? null, handleLabel);
  }
  if (p === "facebook") {
    return mapUnifiedFacebookToContentManagerPosts(data.facebook ?? null, handleLabel);
  }
  if (p === "youtube") {
    return mapUnifiedYoutubeToContentManagerPosts(data.youtube ?? null, handleLabel);
  }
  if (p === "tiktok") {
    return mapUnifiedTiktokToContentManagerPosts(data.tiktok ?? null, handleLabel);
  }
  if (p === "threads") {
    return mapUnifiedThreadsToContentManagerPosts(data.threads ?? null, handleLabel);
  }
  if (p === "bluesky") {
    return mapUnifiedBlueskyToContentManagerPosts(data.bluesky ?? null, handleLabel);
  }
  if (p === "mastodon") {
    return mapUnifiedMastodonToContentManagerPosts(data.mastodon ?? null, handleLabel);
  }
  if (p === "pinterest") {
    return mapUnifiedPinterestToContentManagerPosts(data.pinterest ?? null, handleLabel);
  }
  if (p === "wordpress") {
    return mapUnifiedWordpressToContentManagerPosts(data.wordpress ?? null, handleLabel);
  }
  return [];
}
