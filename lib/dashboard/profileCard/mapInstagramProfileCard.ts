import type { DashboardProfileCardView } from "./dashboardProfileCardTypes";
import { formatStatCount } from "./formatStatCount";
import { isRecord, nonEmptyString } from "./profileCardGuards";

/**
 * Maps `unified.user-profiles` `instagram` block → dashboard profile card.
 * Expects `{ profile: { username, name, profile_picture_url, biography, … } }`.
 */
export function mapInstagramUnifiedToProfileCard(
  block: unknown,
): DashboardProfileCardView | null {
  if (!isRecord(block)) {
    return null;
  }
  const profile = block.profile;
  if (!isRecord(profile)) {
    return null;
  }

  const rawUsername = nonEmptyString(profile.username);
  const username = rawUsername?.replace(/^@/, "") ?? null;
  const name = nonEmptyString(profile.name);
  const avatarUrl = nonEmptyString(profile.profile_picture_url);
  const bio = nonEmptyString(profile.biography);

  const primaryLine = username ? `@${username}` : "@instagram";

  const visitUrl =
    username !== null
      ? `https://www.instagram.com/${encodeURIComponent(username)}/`
      : null;

  const mediaCount = profile.media_count;
  const followersCount = profile.followers_count;
  const followsCount = profile.follows_count;

  const showVerifiedBadge = profile.is_verified === true;

  return {
    platformLabel: "Instagram",
    primaryLine,
    secondaryLine: name ?? undefined,
    avatarUrl,
    stats: [
      { label: "posts", value: formatStatCount(mediaCount) },
      { label: "followers", value: formatStatCount(followersCount) },
      { label: "following", value: formatStatCount(followsCount) },
    ],
    bio,
    visitUrl,
    showVerifiedBadge,
  };
}
