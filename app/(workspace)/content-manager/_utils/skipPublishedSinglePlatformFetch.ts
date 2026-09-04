import type {
  ContentManagerChannelFilter,
  ContentManagerTab,
} from "../_types/contentManagerTypes";

/** Platforms backed by GET /unified/posts/ per-channel hooks. */
export type PublishedUnifiedPlatform =
  | "instagram"
  | "facebook"
  | "youtube"
  | "linkedin"
  | "pinterest"
  | "tiktok"
  | "threads"
  | "bluesky"
  | "mastodon"
  | "wordpress";

function channelMatchesPublishedPlatform(
  channel: ContentManagerChannelFilter,
  platform: PublishedUnifiedPlatform,
): boolean {
  switch (platform) {
    case "instagram":
      return channel === "instagram";
    case "facebook":
      return channel === "facebook" || channel.startsWith("facebook:");
    case "youtube":
      return channel === "youtube";
    case "linkedin":
      return channel === "linkedin" || channel.startsWith("linkedin:");
    case "pinterest":
      return channel === "pinterest";
    case "tiktok":
      return channel === "tiktok";
    case "threads":
      return channel === "threads";
    case "bluesky":
      return channel === "bluesky";
    case "mastodon":
      return channel === "mastodon";
    case "wordpress":
      return channel === "wordpress";
    default: {
      const _exhaustive: never = platform;
      return _exhaustive;
    }
  }
}

/**
 * Skip a single-platform published hook when not on Published, when “All channels”
 * (bulk request), or when the URL channel filter targets another platform.
 */
export function skipPublishedSinglePlatformFetch(
  tab: ContentManagerTab,
  channel: ContentManagerChannelFilter,
  platform: PublishedUnifiedPlatform,
): boolean {
  if (tab !== "published") {
    return true;
  }
  if (channel === "all") {
    return true;
  }
  return !channelMatchesPublishedPlatform(channel, platform);
}
