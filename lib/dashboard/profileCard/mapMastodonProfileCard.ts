import type { DashboardProfileCardView } from "./dashboardProfileCardTypes";
import { formatStatCount } from "./formatStatCount";
import { isRecord, nonEmptyString } from "./profileCardGuards";

function stripHtml(value: string): string {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

/**
 * Maps `unified.user-profiles` `mastodon` block -> dashboard profile card.
 */
export function mapMastodonUnifiedToProfileCard(
  block: unknown,
): DashboardProfileCardView | null {
  if (!isRecord(block)) {
    return null;
  }
  const profile = block.profile;
  if (!isRecord(profile)) {
    return null;
  }

  const acctRaw = nonEmptyString(profile.acct) ?? nonEmptyString(profile.username);
  const acct = acctRaw?.replace(/^@/, "") ?? null;
  const displayName = nonEmptyString(profile.display_name);
  const primaryLine = displayName ?? (acct !== null ? `@${acct}` : "Mastodon");
  const secondaryLine =
    acct !== null && displayName !== null ? `@${acct}` : undefined;
  const avatarUrl =
    nonEmptyString(profile.avatar) ??
    nonEmptyString(profile.avatar_static) ??
    nonEmptyString(profile.profile_picture_url);
  const notePlain = nonEmptyString(profile.note_plain);
  const noteHtml = nonEmptyString(profile.note);
  const bio = notePlain ?? (noteHtml !== null ? stripHtml(noteHtml) : null);
  const visitUrl =
    nonEmptyString(profile.url) ??
    (acct !== null
      ? `${nonEmptyString(profile.instance_base) ?? "https://mastodon.social"}/@${encodeURIComponent(acct)}`
      : null);

  return {
    platformLabel: "Mastodon",
    primaryLine,
    secondaryLine,
    avatarUrl,
    stats: [
      { label: "posts", value: formatStatCount(profile.statuses_count) },
      { label: "followers", value: formatStatCount(profile.followers_count) },
      { label: "following", value: formatStatCount(profile.following_count) },
    ],
    bio,
    visitUrl,
    showVerifiedBadge: false,
  };
}
