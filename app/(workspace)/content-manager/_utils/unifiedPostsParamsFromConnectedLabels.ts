import type { ContentManagerChannelFilter } from "../_types/contentManagerTypes";
import type { UnifiedPublishedLabels } from "./mapFullUnifiedPostsResponseToPublishedPosts";

const UNIFIED_POSTS_API_PLATFORMS = new Set<string>([
  "instagram",
  "linkedin",
  "facebook",
  "threads",
  "tiktok",
  "youtube",
  "pinterest",
  "bluesky",
  "mastodon",
]);

export interface UnifiedPostsQueryFromLabels {
  platforms: string[];
  linkedinOrganizationIds: string[];
  facebookPageIds: string[];
}

/**
 * Builds GET /unified/posts/ query fields from connected channel label keys so every
 * request includes explicit `platforms` (and org/page ids when needed).
 */
export function unifiedPostsParamsFromConnectedLabels(
  labels: UnifiedPublishedLabels,
): UnifiedPostsQueryFromLabels {
  const platformSet = new Set<string>();
  const linkedinIds = new Set<string>();
  const facebookIds = new Set<string>();

  for (const key of Object.keys(labels) as ContentManagerChannelFilter[]) {
    if (key === "all") {
      continue;
    }
    if (key === "x") {
      continue;
    }
    if (key.startsWith("linkedin:")) {
      platformSet.add("linkedin");
      const id = key.slice("linkedin:".length).trim();
      if (id) {
        linkedinIds.add(id);
      }
      continue;
    }
    if (key.startsWith("facebook:")) {
      platformSet.add("facebook");
      const id = key.slice("facebook:".length).trim();
      if (id) {
        facebookIds.add(id);
      }
      continue;
    }
    if (UNIFIED_POSTS_API_PLATFORMS.has(key)) {
      platformSet.add(key);
    }
  }

  const platforms = [...platformSet].sort();

  return {
    platforms,
    linkedinOrganizationIds: [...linkedinIds],
    facebookPageIds: [...facebookIds],
  };
}
