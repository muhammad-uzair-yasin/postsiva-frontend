import type { SocialPlatformIconId } from "@/lib/social/socialPlatformIconSrc";

/** Platform slug expected by POST /unified/post/{text|image|video|carousel|document} (matches backend). */
export type UnifiedApiPlatform =
  | "linkedin"
  | "facebook"
  | "instagram"
  | "threads"
  | "tiktok"
  | "youtube"
  | "pinterest"
  | "bluesky"
  | "mastodon"
  | "wordpress";

export const UNIFIED_TEXT_PLATFORMS = new Set<UnifiedApiPlatform>([
  "linkedin",
  "threads",
  "facebook",
  "bluesky",
  "mastodon",
  // A blog post is a text post; the composer body is the article.
  "wordpress",
]);

export const UNIFIED_IMAGE_PLATFORMS = new Set<UnifiedApiPlatform>([
  "linkedin",
  "facebook",
  "instagram",
  "threads",
  "tiktok",
  "pinterest",
  "bluesky",
  "mastodon",
  // Media is uploaded into the WP library and embedded in the article.
  "wordpress",
]);

export const UNIFIED_VIDEO_PLATFORMS = new Set<UnifiedApiPlatform>([
  "linkedin",
  "facebook",
  "instagram",
  "threads",
  "tiktok",
  "youtube",
  "pinterest",
  "bluesky",
  "mastodon",
  // Media is uploaded into the WP library and embedded in the article.
  "wordpress",
]);

export const UNIFIED_DOCUMENT_PLATFORMS = new Set<UnifiedApiPlatform>(["linkedin"]);

export const UNIFIED_REEL_PLATFORMS = new Set<UnifiedApiPlatform>([
  "facebook",
  "instagram",
]);

export const UNIFIED_STORY_PLATFORMS = new Set<UnifiedApiPlatform>([
  "facebook",
  "instagram",
]);

export const UNIFIED_LINK_PLATFORMS = new Set<UnifiedApiPlatform>(["facebook"]);

export function iconPlatformToUnifiedApiPlatform(
  icon: SocialPlatformIconId,
): UnifiedApiPlatform | null {
  switch (icon) {
    case "linkedin":
      return "linkedin";
    case "facebook":
      return "facebook";
    case "instagram":
      return "instagram";
    case "threads":
    case "x":
      return "threads";
    case "tiktok":
      return "tiktok";
    case "youtube":
      return "youtube";
    case "pinterest":
      return "pinterest";
    case "bluesky":
      return "bluesky";
    case "mastodon":
      return "mastodon";
    case "wordpress":
      return "wordpress";
    case "whatsapp":
      return null;
    default:
      return null;
  }
}

export function filterPlatformsForComposerKind(
  platforms: readonly UnifiedApiPlatform[],
  postKind: "text" | "image" | "video" | "carousel" | "document" | "reel" | "story" | "link",
): { readonly allowed: UnifiedApiPlatform[]; readonly skipped: UnifiedApiPlatform[] } {
  const set =
    postKind === "text"
      ? UNIFIED_TEXT_PLATFORMS
      : postKind === "video"
        ? UNIFIED_VIDEO_PLATFORMS
        : postKind === "document"
          ? UNIFIED_DOCUMENT_PLATFORMS
          : postKind === "reel"
            ? UNIFIED_REEL_PLATFORMS
            : postKind === "story"
              ? UNIFIED_STORY_PLATFORMS
              : postKind === "link"
                ? UNIFIED_LINK_PLATFORMS
                : UNIFIED_IMAGE_PLATFORMS;
  const allowed: UnifiedApiPlatform[] = [];
  const skipped: UnifiedApiPlatform[] = [];
  for (const p of platforms) {
    if (set.has(p)) {
      allowed.push(p);
    } else {
      skipped.push(p);
    }
  }
  return { allowed, skipped };
}
