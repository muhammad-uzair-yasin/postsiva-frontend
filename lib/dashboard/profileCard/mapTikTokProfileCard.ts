import type { DashboardProfileCardView } from "./dashboardProfileCardTypes";
import { pickNumber, pickString } from "../profilePick";
import { formatStatCount } from "./formatStatCount";
import { isRecord, nonEmptyString } from "./profileCardGuards";

/**
 * Maps `unified.user-profiles` `tiktok` block → dashboard profile card.
 */
export function mapTikTokUnifiedToProfileCard(
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
  const displayName = nonEmptyString(profile.display_name);

  const primaryLine =
    username !== null
      ? `@${username}`
      : displayName ?? "@tiktok";

  const secondaryLine =
    username !== null && displayName && displayName !== primaryLine
      ? displayName
      : undefined;

  const avatarUrl = pickString(profile, [
    "profile_image",
    "avatar_large_url",
    "avatar_url",
    "avatar_url_100",
  ]);

  const bio = nonEmptyString(profile.bio_description);

  const deepLink = nonEmptyString(profile.profile_deep_link);
  const visitUrl =
    deepLink ??
    (username !== null
      ? `https://www.tiktok.com/@${encodeURIComponent(username)}`
      : null);

  const showVerifiedBadge = profile.is_verified === true;

  return {
    platformLabel: "TikTok",
    primaryLine,
    secondaryLine,
    avatarUrl,
    stats: [
      {
        label: "videos",
        value: formatStatCount(pickNumber(profile, ["videos_count", "video_count"])),
      },
      {
        label: "followers",
        value: formatStatCount(
          pickNumber(profile, ["followers_count", "follower_count"]),
        ),
      },
      {
        label: "likes",
        value: formatStatCount(pickNumber(profile, ["total_likes", "likes_count"])),
      },
    ],
    bio,
    visitUrl,
    showVerifiedBadge,
  };
}
