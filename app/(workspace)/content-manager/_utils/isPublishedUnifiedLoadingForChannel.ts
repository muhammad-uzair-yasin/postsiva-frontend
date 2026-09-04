import type {
  ContentManagerChannelFilter,
  ContentManagerTab,
} from "../_types/contentManagerTypes";

interface UnifiedLoadingFlags {
  instagram: boolean;
  facebook: boolean;
  youtube: boolean;
  linkedin: boolean;
  pinterest: boolean;
  tiktok: boolean;
  threads: boolean;
  bluesky: boolean;
  mastodon: boolean;
  wordpress: boolean;
  /** Published + All: one GET /unified/posts/ for every platform. */
  allPlatformsBulk?: boolean;
}

/** True when the Published tab is waiting on GET /unified/posts for the current channel filter. */
export function isPublishedUnifiedLoadingForChannel(
  tab: ContentManagerTab,
  channel: ContentManagerChannelFilter,
  flags: UnifiedLoadingFlags,
): boolean {
  if (tab !== "published") {
    return false;
  }
  if (channel === "all") {
    if (flags.allPlatformsBulk !== undefined) {
      return flags.allPlatformsBulk;
    }
    return (
      flags.instagram ||
      flags.facebook ||
      flags.youtube ||
      flags.linkedin ||
      flags.pinterest ||
      flags.tiktok ||
      flags.threads ||
      flags.bluesky ||
      flags.mastodon ||
      flags.wordpress
    );
  }
  if (channel === "instagram") {
    return flags.instagram;
  }
  if (channel === "facebook" || channel.startsWith("facebook:")) {
    return flags.facebook;
  }
  if (channel === "youtube") {
    return flags.youtube;
  }
  if (channel === "tiktok") {
    return flags.tiktok;
  }
  if (channel === "linkedin" || channel.startsWith("linkedin:")) {
    return flags.linkedin;
  }
  if (channel === "pinterest") {
    return flags.pinterest;
  }
  if (channel === "threads") {
    return flags.threads;
  }
  if (channel === "bluesky") {
    return flags.bluesky;
  }
  if (channel === "mastodon") {
    return flags.mastodon;
  }
  if (channel === "wordpress") {
    return flags.wordpress;
  }
  return false;
}
