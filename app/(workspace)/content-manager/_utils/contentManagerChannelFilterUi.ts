import type { ContentManagerChannelFilter } from "../_types/contentManagerTypes";
import type { SocialPlatformIconId } from "@/lib/social/socialPlatformIconSrc";

const LABELS: Record<ContentManagerChannelFilter, string> = {
  all: "All Channels",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  threads: "Threads",
  tiktok: "TikTok",
  youtube: "YouTube",
  pinterest: "Pinterest",
  bluesky: "Bluesky",
  mastodon: "Mastodon",
  wordpress: "WordPress",
  x: "X",
};

export function contentManagerChannelFilterLabel(
  c: ContentManagerChannelFilter,
): string {
  if (c === "all") {
    return LABELS.all;
  }
  if (c.startsWith("linkedin:")) {
    return "LinkedIn";
  }
  if (c.startsWith("facebook:")) {
    return "Facebook";
  }
  return LABELS[c as keyof typeof LABELS] ?? "Channel";
}

export function contentManagerFilterToPlatformId(
  c: ContentManagerChannelFilter,
): SocialPlatformIconId | null {
  if (c === "all") {
    return null;
  }
  if (c.startsWith("linkedin:")) {
    return "linkedin";
  }
  if (c.startsWith("facebook:")) {
    return "facebook";
  }
  return c as SocialPlatformIconId;
}
