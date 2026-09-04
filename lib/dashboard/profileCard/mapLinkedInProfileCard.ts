import type { DashboardProfileCardView } from "./dashboardProfileCardTypes";
import { formatStatCount } from "./formatStatCount";
import { isRecord, nonEmptyString } from "./profileCardGuards";
import { linkedinOrganizationLogoUrl } from "@/lib/workspace/linkedinOrganizationLogoUrl";

/** Matches `linkedinFacebookHeaderAccountRows.orgStableId`. */
function linkedinOrgStableId(
  org: Record<string, unknown>,
  index: number,
): string {
  const pageId = org.page_id;
  if (typeof pageId === "string" && pageId.trim().length > 0) {
    return pageId.trim().replace(/:/g, "_");
  }
  if (typeof org.numeric_id === "number" && Number.isFinite(org.numeric_id)) {
    return String(org.numeric_id);
  }
  if (typeof org.numeric_id === "string" && org.numeric_id.trim().length > 0) {
    return org.numeric_id.trim().replace(/:/g, "_");
  }
  return `idx_${index}`;
}

function findLinkedInOrgByRowId(
  block: Record<string, unknown>,
  rowId: string,
): Record<string, unknown> | null {
  const prefix = "linkedin:org:";
  if (!rowId.startsWith(prefix)) {
    return null;
  }
  const suffix = rowId.slice(prefix.length);
  const orgsRaw = block.organizations;
  if (!Array.isArray(orgsRaw)) {
    return null;
  }
  const organizations = orgsRaw.filter(isRecord);
  for (let i = 0; i < organizations.length; i++) {
    const org = organizations[i];
    if (linkedinOrgStableId(org, i) === suffix) {
      return org;
    }
  }
  return null;
}

function linkedinPersonalName(profile: Record<string, unknown>): string {
  const parts = [
    nonEmptyString(profile.given_name),
    nonEmptyString(profile.family_name),
  ].filter((x): x is string => Boolean(x));
  const combined = parts.join(" ").trim();
  return (
    nonEmptyString(profile.name) ??
    (combined.length > 0 ? combined : null) ??
    nonEmptyString(profile.vanity_name) ??
    "LinkedIn"
  );
}

function formatLocationSnippet(org: Record<string, unknown>): string | null {
  const locsRaw = org.locations_data;
  if (!Array.isArray(locsRaw) || locsRaw.length === 0) {
    return null;
  }
  const first = locsRaw[0];
  if (!isRecord(first)) {
    return null;
  }
  const addr = first.address;
  if (!isRecord(addr)) {
    return null;
  }
  const city = nonEmptyString(addr.city);
  const country = nonEmptyString(addr.country);
  const area = nonEmptyString(addr.geographicArea);
  const bits = [city, area, country].filter(Boolean);
  return bits.length > 0 ? bits.join(", ") : null;
}

/**
 * LinkedIn member profile (`id === "linkedin"`).
 */
export function mapLinkedInPersonalToProfileCard(
  block: unknown,
): DashboardProfileCardView | null {
  if (!isRecord(block)) {
    return null;
  }
  const profile = block.profile;
  if (!isRecord(profile)) {
    return null;
  }

  const primaryLine = linkedinPersonalName(profile);
  const vanity = nonEmptyString(profile.vanity_name);
  const secondaryLine = vanity
    ? `in/${vanity}`
    : nonEmptyString(profile.profile_url)?.replace(/^https?:\/\/(www\.)?linkedin\.com\//i, "") ??
      undefined;

  const avatarUrl = nonEmptyString(profile.picture);
  const visitUrl = nonEmptyString(profile.profile_url);

  const orgsRaw = block.organizations;
  const orgCount = Array.isArray(orgsRaw) ? orgsRaw.length : 0;

  return {
    platformLabel: "LinkedIn · Personal",
    primaryLine,
    secondaryLine,
    avatarUrl,
    stats: [
      {
        label: "organizations",
        value: orgCount > 0 ? String(orgCount) : "—",
      },
      { label: "connections", value: "—" },
      { label: "following", value: "—" },
    ],
    bio: null,
    visitUrl,
    showVerifiedBadge: false,
  };
}

/**
 * LinkedIn organization (`linkedin:org:*`).
 */
export function mapLinkedInOrgRowToProfileCard(
  block: unknown,
  selectedRowId: string,
): DashboardProfileCardView | null {
  if (!isRecord(block)) {
    return null;
  }
  const org = findLinkedInOrgByRowId(block, selectedRowId);
  if (!org) {
    return null;
  }

  const pageName =
    nonEmptyString(org.page_name) ??
    nonEmptyString(org.localized_name) ??
    "Organization";

  const vanity = nonEmptyString(org.page_vanity_name);
  const website = nonEmptyString(org.website);
  const pageType = nonEmptyString(org.page_type);
  const secondaryLine = [pageType, website].filter(Boolean).join(" · ") || undefined;

  const prof = block.profile;
  const avatarUrl =
    linkedinOrganizationLogoUrl(org) ??
    (isRecord(prof) ? nonEmptyString(prof.picture) : null);

  const locationLine = formatLocationSnippet(org);

  const bioParts = [website, locationLine].filter(
    (x): x is string => Boolean(x),
  );
  const bio = bioParts.length > 0 ? bioParts.join("\n\n") : null;

  const visitUrl =
    vanity !== null
      ? `https://www.linkedin.com/company/${encodeURIComponent(vanity)}/`
      : null;

  return {
    platformLabel: "LinkedIn · Page",
    primaryLine: pageName,
    secondaryLine,
    avatarUrl,
    stats: [
      { label: "followers", value: formatStatCount(org.followers_count) },
      {
        label: "type",
        value: pageType ?? "—",
      },
      {
        label: "locations",
        value:
          Array.isArray(org.locations_data) && org.locations_data.length > 0
            ? String(org.locations_data.length)
            : "—",
      },
    ],
    bio,
    visitUrl,
    showVerifiedBadge: false,
  };
}
