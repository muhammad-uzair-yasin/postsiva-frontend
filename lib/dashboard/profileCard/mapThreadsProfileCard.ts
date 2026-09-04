import type { DashboardProfileCardView } from "./dashboardProfileCardTypes";
import { formatStatCount } from "./formatStatCount";
import { isRecord, nonEmptyString } from "./profileCardGuards";

/**
 * Maps `unified.user-profiles` `threads` block → dashboard profile card.
 */
export function mapThreadsUnifiedToProfileCard(
  block: unknown,
): DashboardProfileCardView | null {
  if (!isRecord(block)) {
    return null;
  }
  const profile = block.profile;
  if (!isRecord(profile)) {
    return null;
  }

  const rawUser = nonEmptyString(profile.username);
  const username = rawUser?.replace(/^@/, "") ?? null;
  const fullName = nonEmptyString(profile.full_name);

  const primaryLine =
    username !== null
      ? `@${username}`
      : fullName ?? "@threads";

  const secondaryLine =
    username !== null && fullName && `@${username}` !== fullName
      ? fullName
      : undefined;

  const avatarUrl = nonEmptyString(profile.profile_picture_url);
  const bio = nonEmptyString(profile.biography);

  const visitUrl =
    username !== null
      ? `https://www.threads.net/@${encodeURIComponent(username)}`
      : null;

  const showVerifiedBadge = profile.is_verified === true;

  return {
    platformLabel: "Threads",
    primaryLine,
    secondaryLine,
    avatarUrl,
    stats: [
      { label: "posts", value: formatStatCount(profile.posts_count) },
      { label: "followers", value: formatStatCount(profile.followers_count) },
      { label: "following", value: formatStatCount(profile.following_count) },
    ],
    bio,
    visitUrl,
    showVerifiedBadge,
  };
}
