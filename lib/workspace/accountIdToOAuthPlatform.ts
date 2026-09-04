const PLATFORM_SET = new Set<string>([
  "linkedin",
  "facebook",
  "instagram",
  "youtube",
  "threads",
  "tiktok",
  "bluesky",
  "mastodon",
  "wordpress",
]);

export type CommentsOAuthPlatform =
  | "linkedin"
  | "facebook"
  | "instagram"
  | "youtube"
  | "threads"
  | "tiktok"
  | "bluesky"
  | "mastodon"
  | "wordpress";

/** Map header account row id to platform key for GET /unified/comments/. */
export function accountIdToOAuthPlatform(
  id: string,
): CommentsOAuthPlatform | null {
  if (PLATFORM_SET.has(id)) {
    return id as CommentsOAuthPlatform;
  }
  if (id.startsWith("linkedin:")) {
    return "linkedin";
  }
  if (id.startsWith("facebook:")) {
    return "facebook";
  }
  if (id.startsWith("youtube:")) {
    return "youtube";
  }
  // WordPress header accounts are "wordpress:<connection_id>" — one row per site.
  if (id.startsWith("wordpress:")) {
    return "wordpress";
  }
  return null;
}
