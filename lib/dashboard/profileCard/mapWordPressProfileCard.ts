import type { DashboardProfileCardView } from "./dashboardProfileCardTypes";
import { isRecord, nonEmptyString } from "./profileCardGuards";

function avatarUrl(profile: Record<string, unknown>): string | null {
  const avatars = profile.avatar_urls;
  if (!isRecord(avatars)) {
    return null;
  }
  return (
    nonEmptyString(avatars["96"]) ??
    nonEmptyString(avatars["48"]) ??
    nonEmptyString(avatars["24"])
  );
}

export function mapWordPressConnectionToProfileCard(
  block: unknown,
  selectedId: string,
): DashboardProfileCardView | null {
  if (!isRecord(block) || !Array.isArray(block.accounts)) {
    return null;
  }
  const connectionId = selectedId.startsWith("wordpress:")
    ? selectedId.slice("wordpress:".length)
    : selectedId;
  const account = block.accounts.find(
    (value) => isRecord(value) && value.id === connectionId,
  );
  if (!isRecord(account)) {
    return null;
  }
  const profile = isRecord(account.profile) ? account.profile : {};
  const siteName = nonEmptyString(account.site_name) ?? "WordPress";
  const displayName =
    nonEmptyString(profile.display_name) ??
    nonEmptyString(account.username) ??
    siteName;
  const slug = nonEmptyString(profile.slug);
  const authorUrl = nonEmptyString(profile.author_url);
  const websiteUrl =
    nonEmptyString(profile.website_url) ??
    nonEmptyString(account.site_url);
  const description = nonEmptyString(profile.description);

  return {
    platformLabel: "WordPress",
    primaryLine: siteName,
    secondaryLine: `WordPress · ${displayName}`,
    avatarUrl: avatarUrl(profile),
    stats: [
      { label: "author", value: displayName },
      { label: "slug", value: slug ?? "—" },
      { label: "status", value: nonEmptyString(account.status) ?? "—" },
    ],
    bio:
      description ??
      (slug ? `Author profile: ${slug}` : "Connected WordPress author profile."),
    visitUrl: authorUrl ?? websiteUrl,
    showVerifiedBadge: false,
  };
}
