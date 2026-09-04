import { truncate } from "../profilePick";
import type { DashboardProfileCardView } from "./dashboardProfileCardTypes";
import { formatStatCount } from "./formatStatCount";
import { isRecord, nonEmptyString } from "./profileCardGuards";

/** Hero bio preview — full text lives on YouTube; keeps the dashboard card compact. */
const YOUTUBE_PROFILE_BIO_MAX_CHARS = 320;

function youtubeVisitUrl(ch: Record<string, unknown>): string | null {
  const custom = nonEmptyString(ch.custom_url);
  const channelId = nonEmptyString(ch.channel_id);
  if (custom) {
    const handle = custom.replace(/^@/, "");
    return `https://www.youtube.com/@${encodeURIComponent(handle)}`;
  }
  if (channelId) {
    return `https://www.youtube.com/channel/${encodeURIComponent(channelId)}`;
  }
  return null;
}

/**
 * Maps `unified.user-profiles` `youtube` block → dashboard profile card (`channel_info`).
 */
export function mapYouTubeUnifiedToProfileCard(
  block: unknown,
): DashboardProfileCardView | null {
  if (!isRecord(block)) {
    return null;
  }
  const ch = block.channel_info;
  if (!isRecord(ch)) {
    return null;
  }

  const title = nonEmptyString(ch.title) ?? "YouTube channel";
  const customUrl = nonEmptyString(ch.custom_url);
  const primaryLine = title;
  const secondaryLine = customUrl
    ? customUrl.startsWith("@")
      ? customUrl
      : `@${customUrl.replace(/^@/, "")}`
    : undefined;

  const avatarUrl = nonEmptyString(ch.thumbnail_url);
  const rawDescription = nonEmptyString(ch.description);
  const bio = rawDescription
    ? truncate(rawDescription, YOUTUBE_PROFILE_BIO_MAX_CHARS)
    : null;

  return {
    platformLabel: "YouTube",
    primaryLine,
    secondaryLine,
    avatarUrl,
    stats: [
      { label: "subscribers", value: formatStatCount(ch.subscriber_count) },
      { label: "videos", value: formatStatCount(ch.video_count) },
      { label: "views", value: formatStatCount(ch.view_count) },
    ],
    bio,
    visitUrl: youtubeVisitUrl(ch),
    showVerifiedBadge: false,
  };
}
