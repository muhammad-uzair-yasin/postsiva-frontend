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
import { mapUnifiedWordpressToContentManagerPosts } from "./mapUnifiedWordpressPosts";
import { mapUnifiedYoutubeToContentManagerPosts } from "./mapUnifiedYoutubePosts";

export type UnifiedPublishedLabels = Partial<
  Record<ContentManagerChannelFilter, string>
>;

/** Same platform order as mergeContentManagerPostsWithUnifiedApi for “All”. */
export function mapFullUnifiedPostsResponseToPublishedPosts(
  data: UnifiedPostsApiResponse,
  labels: UnifiedPublishedLabels,
): ContentManagerPost[] {
  const instagramLabel = labels.instagram ?? "Instagram";
  const facebookLabel = labels.facebook ?? "Facebook";
  const youtubeLabel = labels.youtube ?? "YouTube";
  const linkedinLabel = labels.linkedin ?? "LinkedIn";
  const pinterestLabel = labels.pinterest ?? "Pinterest";
  const tiktokLabel = labels.tiktok ?? "TikTok";
  const threadsLabel = labels.threads ?? "Threads";
  const blueskyLabel = labels.bluesky ?? "Bluesky";
  const mastodonLabel = labels.mastodon ?? "Mastodon";
  const wordpressLabel = labels.wordpress ?? "WordPress";

  return [
    ...mapUnifiedInstagramToContentManagerPosts(
      data.instagram ?? null,
      instagramLabel,
    ),
    ...mapUnifiedFacebookToContentManagerPosts(
      data.facebook ?? null,
      facebookLabel,
    ),
    ...mapUnifiedYoutubeToContentManagerPosts(
      data.youtube ?? null,
      youtubeLabel,
    ),
    ...mapUnifiedLinkedinToContentManagerPosts(
      data.linkedin ?? null,
      linkedinLabel,
    ),
    ...mapUnifiedPinterestToContentManagerPosts(
      data.pinterest ?? null,
      pinterestLabel,
    ),
    ...mapUnifiedTiktokToContentManagerPosts(data.tiktok ?? null, tiktokLabel),
    ...mapUnifiedThreadsToContentManagerPosts(
      data.threads ?? null,
      threadsLabel,
    ),
    ...mapUnifiedBlueskyToContentManagerPosts(
      data.bluesky ?? null,
      blueskyLabel,
    ),
    ...mapUnifiedMastodonToContentManagerPosts(
      data.mastodon ?? null,
      mastodonLabel,
    ),
    ...mapUnifiedWordpressToContentManagerPosts(
      data.wordpress ?? null,
      wordpressLabel,
    ),
  ];
}
