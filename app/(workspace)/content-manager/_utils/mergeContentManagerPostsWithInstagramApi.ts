import { CONTENT_MANAGER_POSTS } from "../_data/contentManagerSeed";
import type {
  ContentManagerChannel,
  ContentManagerChannelFilter,
  ContentManagerPost,
  ContentManagerTab,
} from "../_types/contentManagerTypes";
import { contentManagerScheduledPostMatchesChannelFilter } from "./contentManagerScheduledPostMatchesChannelFilter";

function mapFilterToDemoChannel(
  channel: ContentManagerChannelFilter,
): ContentManagerChannel | "all" {
  if (channel === "all") {
    return "all";
  }
  if (channel.startsWith("linkedin:")) {
    return "linkedin";
  }
  if (channel.startsWith("facebook:")) {
    return "facebook";
  }
  return channel as ContentManagerChannel;
}

function normalizeHandleCompare(a: string, b: string): boolean {
  const x = a.trim().replace(/_/g, ":").toLowerCase();
  const y = b.trim().replace(/_/g, ":").toLowerCase();
  return x === y;
}

/** Filter GET /unified/drafts rows by the manager channel dropdown (mobile feed parity). */
export function filterDraftApiPostsByChannel(
  posts: ContentManagerPost[],
  channelFilter: ContentManagerChannelFilter,
): ContentManagerPost[] {
  if (channelFilter === "all") {
    return posts;
  }
  if (channelFilter.startsWith("linkedin:")) {
    const want = channelFilter.slice("linkedin:".length).trim();
    return posts.filter(
      (p) =>
        p.channel === "linkedin" &&
        (want.length === 0 || normalizeHandleCompare(p.handle, want)),
    );
  }
  if (channelFilter.startsWith("facebook:")) {
    const want = channelFilter.slice("facebook:".length).trim();
    return posts.filter(
      (p) =>
        p.channel === "facebook" &&
        (want.length === 0 || normalizeHandleCompare(p.handle, want)),
    );
  }
  return posts.filter((p) => p.channel === channelFilter);
}

/**
 * Published tab: merge live Instagram + Facebook + YouTube + LinkedIn + Pinterest + TikTok + Threads + Bluesky from GET /unified/posts.
 * Draft tab: GET /unified/drafts for the workspace header account (see mobile `useFeedUnifiedDrafts`).
 * Scheduled tab: GET /unified/scheduled-posts (see mobile `useFeedUnifiedScheduledSections`).
 */
export function mergeContentManagerPostsWithUnifiedApi(
  tab: ContentManagerTab,
  channelFilter: ContentManagerChannelFilter,
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
  /** Published + All: single GET /unified/posts/ with no platform filters. */
  publishedAllCombined: ContentManagerPost[] | null,
  /** Draft tab: loading unified profiles or GET /unified/drafts in flight. */
  draftTabLoading: boolean,
  /** Draft tab: mapped drafts for the selected header platform. */
  draftTabPosts: ContentManagerPost[],
  /** Scheduled tab: loading GET /unified/scheduled-posts. */
  scheduledTabLoading: boolean,
  /** Scheduled tab: mapped scheduled posts for the workspace. */
  scheduledTabPosts: ContentManagerPost[],
): ContentManagerPost[] {
  const demoChannel = mapFilterToDemoChannel(channelFilter);

  if (tab === "draft") {
    if (draftTabLoading) {
      return [];
    }
    return filterDraftApiPostsByChannel(draftTabPosts, channelFilter);
  }

  if (tab === "scheduled") {
    if (scheduledTabLoading) {
      return [];
    }
    return scheduledTabPosts.filter((post) =>
      contentManagerScheduledPostMatchesChannelFilter(post, channelFilter),
    );
  }

  if (tab === "published" && demoChannel === "instagram") {
    return instagramPublishedPosts;
  }
  if (tab === "published" && demoChannel === "youtube") {
    return youtubePublishedPosts;
  }
  if (tab === "published" && demoChannel === "linkedin") {
    return linkedinPublishedPosts;
  }
  if (tab === "published" && demoChannel === "facebook") {
    return facebookPublishedPosts;
  }
  if (tab === "published" && demoChannel === "pinterest") {
    return pinterestPublishedPosts;
  }
  if (tab === "published" && demoChannel === "tiktok") {
    return tiktokPublishedPosts;
  }
  if (tab === "published" && demoChannel === "threads") {
    return threadsPublishedPosts;
  }
  if (tab === "published" && demoChannel === "bluesky") {
    return blueskyPublishedPosts;
  }
  if (tab === "published" && demoChannel === "mastodon") {
    return mastodonPublishedPosts;
  }
  if (tab === "published" && demoChannel === "wordpress") {
    return wordpressPublishedPosts;
  }

  if (tab === "published" && demoChannel === "all") {
    const seedPublishedOther = CONTENT_MANAGER_POSTS.filter(
      (p) =>
        p.status === "published" &&
        p.channel !== "instagram" &&
        p.channel !== "facebook" &&
        p.channel !== "youtube" &&
        p.channel !== "linkedin" &&
        p.channel !== "pinterest" &&
        p.channel !== "tiktok" &&
        p.channel !== "threads" &&
        p.channel !== "bluesky" &&
        p.channel !== "mastodon" &&
        p.channel !== "wordpress",
    );
    const unifiedLive =
      publishedAllCombined !== null
        ? publishedAllCombined
        : [
            ...instagramPublishedPosts,
            ...facebookPublishedPosts,
            ...youtubePublishedPosts,
            ...linkedinPublishedPosts,
            ...pinterestPublishedPosts,
            ...tiktokPublishedPosts,
            ...threadsPublishedPosts,
            ...blueskyPublishedPosts,
            ...mastodonPublishedPosts,
            ...wordpressPublishedPosts,
          ];
    return [...unifiedLive, ...seedPublishedOther];
  }

  /* Published tab without a matching branch above: fall through to seed (legacy). */
  return CONTENT_MANAGER_POSTS.filter((p) => {
    if (p.status !== tab) {
      return false;
    }
    if (demoChannel === "all") {
      return true;
    }
    return p.channel === demoChannel;
  });
}
