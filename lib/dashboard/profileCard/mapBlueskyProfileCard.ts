import type { DashboardProfileCardView } from "./dashboardProfileCardTypes";
import { formatStatCount } from "./formatStatCount";
import { isRecord, nonEmptyString } from "./profileCardGuards";

/**
 * Maps `unified.user-profiles` `bluesky` block → dashboard profile card.
 */
export function mapBlueskyUnifiedToProfileCard(
  block: unknown,
): DashboardProfileCardView | null {
  if (!isRecord(block)) {
    return null;
  }
  const profile = block.profile;
  if (!isRecord(profile)) {
    return null;
  }

  const displayName = nonEmptyString(profile.display_name);
  const name = nonEmptyString(profile.name);
  const handleRaw = nonEmptyString(profile.handle);
  const handle = handleRaw?.replace(/^@/, "") ?? null;

  const title = displayName ?? name;
  const primaryLine =
    title ?? (handle !== null ? `@${handle}` : "Bluesky");
  const secondaryLine =
    handle !== null && title !== null ? `@${handle}` : undefined;

  const avatarUrl =
    nonEmptyString(profile.avatar) ??
    nonEmptyString(profile.profile_picture_url);

  const bio =
    nonEmptyString(profile.description) ?? nonEmptyString(profile.biography);

  const postsCount = profile.posts_count ?? profile.media_count;
  const followersCount = profile.followers_count ?? profile.follower_count;
  const followingCount = profile.follows_count ?? profile.following_count;

  const did = nonEmptyString(profile.did);
  const visitUrl =
    handle !== null
      ? `https://bsky.app/profile/${encodeURIComponent(handle)}`
      : did !== null
        ? `https://bsky.app/profile/${encodeURIComponent(did)}`
        : null;

  return {
    platformLabel: "Bluesky",
    primaryLine,
    secondaryLine,
    avatarUrl,
    stats: [
      { label: "posts", value: formatStatCount(postsCount) },
      { label: "followers", value: formatStatCount(followersCount) },
      { label: "following", value: formatStatCount(followingCount) },
    ],
    bio,
    visitUrl,
    showVerifiedBadge: false,
  };
}
