import { useMemo } from "react";
import type {
  ContentManagerChannelFilter,
  ContentManagerPost,
  ContentManagerTab,
} from "../_types/contentManagerTypes";
import { mergeContentManagerPostsWithUnifiedApi } from "../_utils/mergeContentManagerPostsWithInstagramApi";

export function useContentManagerFilters(
  tab: ContentManagerTab,
  channel: ContentManagerChannelFilter,
  instagramPublishedPosts: ContentManagerPost[],
  facebookPublishedPosts: ContentManagerPost[],
  youtubePublishedPosts: ContentManagerPost[],
  linkedinPublishedPosts: ContentManagerPost[],
  pinterestPublishedPosts: ContentManagerPost[],
  tiktokPublishedPosts: ContentManagerPost[],
  threadsPublishedPosts: ContentManagerPost[],
  blueskyPublishedPosts: ContentManagerPost[],
  mastodonPublishedPosts: ContentManagerPost[],
  wordpressPublishedPosts: ContentManagerPost[],
  publishedAllCombined: ContentManagerPost[] | null,
  draftTabLoading: boolean,
  draftTabPosts: ContentManagerPost[],
  scheduledTabLoading: boolean,
  scheduledTabPosts: ContentManagerPost[],
): {
  filteredPosts: ContentManagerPost[];
} {
  const filteredPosts = useMemo(
    () =>
      mergeContentManagerPostsWithUnifiedApi(
        tab,
        channel,
        instagramPublishedPosts,
        facebookPublishedPosts,
        youtubePublishedPosts,
        linkedinPublishedPosts,
        pinterestPublishedPosts,
        tiktokPublishedPosts,
        threadsPublishedPosts,
        blueskyPublishedPosts,
        mastodonPublishedPosts,
        wordpressPublishedPosts,
        publishedAllCombined,
        draftTabLoading,
        draftTabPosts,
        scheduledTabLoading,
        scheduledTabPosts,
      ),
    [
      channel,
      blueskyPublishedPosts,
      draftTabLoading,
      draftTabPosts,
      facebookPublishedPosts,
      instagramPublishedPosts,
      linkedinPublishedPosts,
      mastodonPublishedPosts,
      wordpressPublishedPosts,
      pinterestPublishedPosts,
      publishedAllCombined,
      scheduledTabLoading,
      scheduledTabPosts,
      tab,
      threadsPublishedPosts,
      tiktokPublishedPosts,
      youtubePublishedPosts,
    ],
  );

  return { filteredPosts };
}
