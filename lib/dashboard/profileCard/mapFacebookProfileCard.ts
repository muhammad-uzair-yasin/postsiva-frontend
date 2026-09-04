import type { DashboardProfileCardView } from "./dashboardProfileCardTypes";
import { formatStatCount } from "./formatStatCount";
import { isRecord, nonEmptyString } from "./profileCardGuards";

function findFacebookPageByRowId(
  block: Record<string, unknown>,
  rowId: string,
): Record<string, unknown> | null {
  const prefix = "facebook:page:";
  if (!rowId.startsWith(prefix)) {
    return null;
  }
  const suffix = rowId.slice(prefix.length);
  const pagesRaw = block.pages;
  if (!Array.isArray(pagesRaw)) {
    return null;
  }
  const pages = pagesRaw.filter(isRecord);
  for (const p of pages) {
    const pid = nonEmptyString(p.page_id);
    if (!pid) {
      continue;
    }
    const stable = pid.replace(/:/g, "_");
    if (stable === suffix || pid === suffix) {
      return p;
    }
  }
  return null;
}

/**
 * Facebook personal profile only (header row `id === "facebook"` when user has no pages).
 */
export function mapFacebookPersonalToProfileCard(
  block: unknown,
): DashboardProfileCardView | null {
  if (!isRecord(block)) {
    return null;
  }
  const profile = block.profile;
  if (!isRecord(profile)) {
    return null;
  }

  const name = nonEmptyString(profile.name) ?? "Facebook";
  const avatarUrl = nonEmptyString(profile.profile_picture_url);
  const locationWeb = [
    nonEmptyString(profile.location),
    nonEmptyString(profile.website),
  ]
    .filter((x): x is string => Boolean(x))
    .join(" · ");
  const bio =
    nonEmptyString(profile.about) ??
    (locationWeb.length > 0 ? locationWeb : null);

  const pagesRaw = block.pages;
  const pageCount = Array.isArray(pagesRaw) ? pagesRaw.length : 0;

  const visitUrl = nonEmptyString(profile.profile_link);

  return {
    platformLabel: "Facebook",
    primaryLine: name,
    secondaryLine: "Personal profile",
    avatarUrl,
    stats: [
      { label: "pages", value: pageCount > 0 ? String(pageCount) : "—" },
      { label: "followers", value: "—" },
      { label: "following", value: "—" },
    ],
    bio,
    visitUrl,
    showVerifiedBadge: profile.verified === true,
  };
}

/**
 * Facebook Page row (`facebook:page:*`).
 */
export function mapFacebookPageRowToProfileCard(
  block: unknown,
  selectedRowId: string,
): DashboardProfileCardView | null {
  if (!isRecord(block)) {
    return null;
  }
  const page = findFacebookPageByRowId(block, selectedRowId);
  if (!page) {
    return null;
  }

  const prof = block.profile;
  const parentProfile = isRecord(prof) ? prof : null;

  const pageName = nonEmptyString(page.page_name) ?? "Facebook Page";
  const category = nonEmptyString(page.page_category);
  const avatarUrl =
    nonEmptyString(page.picture_url) ??
    nonEmptyString(page.profile_picture_url) ??
    (parentProfile ? nonEmptyString(parentProfile.profile_picture_url) : null);

  const about = nonEmptyString(page.about);
  const website = nonEmptyString(page.website);
  const phone = nonEmptyString(page.phone);
  const bioParts = [about, website, phone].filter((x): x is string => Boolean(x));
  const bio = bioParts.length > 0 ? bioParts.join(" · ") : category;

  const pageId = nonEmptyString(page.page_id);
  // Always open the Facebook Page itself — never `website` (often a comma-joined
  // list of external sites from the Page about field).
  const link = nonEmptyString(page.link);
  const visitUrl =
    (link && /^https?:\/\/([^/]+\.)?facebook\.com\//i.test(link) ? link : null) ??
    (pageId !== null
      ? `https://www.facebook.com/${encodeURIComponent(pageId)}`
      : null);

  const verification = nonEmptyString(page.verification_status);
  const talkingAbout = page.talking_about_count;

  return {
    platformLabel: "Facebook · Page",
    primaryLine: pageName,
    secondaryLine: category ?? "Facebook Page",
    avatarUrl,
    stats: [
      { label: "followers", value: formatStatCount(page.followers_count) },
      { label: "fans", value: formatStatCount(page.fan_count) },
      {
        label: "talking about",
        value: formatStatCount(talkingAbout),
      },
    ],
    bio,
    visitUrl,
    showVerifiedBadge:
      verification === "blue_verified" || verification === "verified",
  };
}
