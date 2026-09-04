import {
  SOCIAL_OAUTH_TOKEN_STATUS_PLATFORMS,
  type SocialOAuthTokenStatusMap,
} from "@/lib/social/unifiedOAuthApi";
import { asRecord, asRecordArray, pickString } from "@/lib/dashboard/profilePick";
import { mergeDashboardChannelsWithUnifiedResponse } from "@/lib/dashboard/unifiedProfileForChannel";

import type { DashboardConnectedChannel } from "./dashboardConnectedChannels";

const LINKEDIN_TITLE_PREFIX = "LinkedIn";
const FACEBOOK_TITLE_PREFIX = "Facebook";

function linkedinCardKeyFromOrg(org: Record<string, unknown>, index: number): string {
  const orgId =
    pickString(org, ["page_id", "organization_id", "id", "numeric_id"]) ?? "";
  const safeId = orgId || String(index + 1);
  return `linkedin:${safeId}`;
}

function linkedinTitleFromOrg(org: Record<string, unknown>, index: number): string {
  const orgName = pickString(org, ["page_name", "name", "localized_name"]) ?? "";
  const safeName = orgName || "Organization";
  return `${LINKEDIN_TITLE_PREFIX} · ${safeName} (${index + 1})`;
}

function linkedinAvatarFromOrg(org: Record<string, unknown>): string | null {
  return (
    pickString(org, ["picture", "logo_url", "logo_data", "profile_picture_url"]) ||
    null
  );
}

function linkedinOrgCardsFromSlice(slice: unknown): DashboardConnectedChannel[] {
  const r = asRecord(slice);
  if (!r) {
    return [];
  }
  const orgs = asRecordArray(r.organizations);
  if (orgs.length === 0) {
    return [];
  }

  return orgs.map((o, index) => {
    const org = o;
    return {
      key: linkedinCardKeyFromOrg(org, index),
      platform: "linkedin",
      title: linkedinTitleFromOrg(org, index),
      subtitle: LINKEDIN_TITLE_PREFIX,
      avatarUrl: linkedinAvatarFromOrg(org),
    };
  });
}

function facebookCardKeyFromPage(page: Record<string, unknown>, index: number): string {
  const pageId = pickString(page, ["page_id", "id", "numeric_id"]) ?? "";
  const safeId = pageId || String(index + 1);
  return `facebook:${safeId}`;
}

function facebookTitleFromPage(page: Record<string, unknown>, index: number): string {
  const pageName = pickString(page, ["page_name", "name"]) ?? "";
  const safeName = pageName || "Page";
  return `${FACEBOOK_TITLE_PREFIX} · ${safeName} (${index + 1})`;
}

function facebookAvatarFromPage(page: Record<string, unknown>): string | null {
  return (
    pickString(page, ["picture_url", "profile_picture_url", "picture", "image_url"]) ||
    null
  );
}

function facebookPagesCardsFromSlice(slice: unknown): DashboardConnectedChannel[] {
  const r = asRecord(slice);
  if (!r) {
    return [];
  }
  const pages = asRecordArray(r.pages);
  if (pages.length === 0) {
    return [];
  }

  return pages.map((pg, index) => {
    const page = pg;
    return {
      key: facebookCardKeyFromPage(page, index),
      platform: "facebook",
      title: facebookTitleFromPage(page, index),
      subtitle: FACEBOOK_TITLE_PREFIX,
      avatarUrl: facebookAvatarFromPage(page),
    };
  });
}

function facebookCardKeyFromSlice(slice: unknown): string {
  const r = asRecord(slice);
  if (!r) {
    return "facebook";
  }
  const pages = asRecordArray(r.pages);
  if (pages.length > 0) {
    return "facebook-pages";
  }
  const profile = asRecord(r.profile);
  if (
    profile &&
    (pickString(profile, ["name"]) ||
      pickString(profile, ["profile_picture_url"]))
  ) {
    return "facebook-profile";
  }
  return "facebook";
}

function baseRowForOauthPlatform(
  apiName: string,
  unified: Record<string, unknown> | null,
): DashboardConnectedChannel | null {
  const slice = unified ? unified[apiName] : undefined;
  switch (apiName) {
    case "linkedin":
      return {
        key: "linkedin",
        platform: "linkedin",
        title: "LinkedIn",
        subtitle: "LinkedIn",
        avatarUrl: null,
      };
    case "instagram":
      return {
        key: "instagram",
        platform: "instagram",
        title: "Instagram",
        subtitle: "Instagram",
        avatarUrl: null,
      };
    case "facebook":
      return {
        key: facebookCardKeyFromSlice(slice),
        platform: "facebook",
        title: "Facebook",
        subtitle: "Facebook",
        avatarUrl: null,
      };
    case "tiktok":
      return {
        key: "tiktok",
        platform: "tiktok",
        title: "TikTok",
        subtitle: "TikTok",
        avatarUrl: null,
      };
    case "youtube":
      return {
        key: "youtube",
        platform: "youtube",
        title: "YouTube",
        subtitle: "YouTube",
        avatarUrl: null,
      };
    case "pinterest":
      return {
        key: "pinterest",
        platform: "pinterest",
        title: "Pinterest",
        subtitle: "Pinterest",
        avatarUrl: null,
      };
    case "threads":
      return {
        key: "threads",
        platform: "threads",
        title: "Threads",
        subtitle: "Threads",
        avatarUrl: null,
      };
    case "bluesky":
      return {
        key: "bluesky",
        platform: "bluesky",
        title: "Bluesky",
        subtitle: "Bluesky",
        avatarUrl: null,
      };
    default:
      return null;
  }
}

/**
 * Dashboard channel cards from OAuth connection flags + unified profile payload.
 * Does not use login/workspace `*_connected` or embedded profiles.
 */
export function dashboardConnectedChannelsFromOauthAndUnified(
  oauthStatus: SocialOAuthTokenStatusMap | null,
  unified: Record<string, unknown> | null,
): DashboardConnectedChannel[] {
  if (!oauthStatus) {
    return [];
  }
  const rows: DashboardConnectedChannel[] = [];
  for (const apiName of SOCIAL_OAUTH_TOKEN_STATUS_PLATFORMS) {
    if (!oauthStatus[apiName]) {
      continue;
    }
    if (apiName === "linkedin") {
      const slice = unified ? unified[apiName] : undefined;
      const orgCards = linkedinOrgCardsFromSlice(slice);
      const row = baseRowForOauthPlatform(apiName, unified);
      if (row) rows.push(row);
      if (orgCards.length > 0) rows.push(...orgCards);
      continue;
    }

    if (apiName === "facebook") {
      const slice = unified ? unified[apiName] : undefined;
      const pageCards = facebookPagesCardsFromSlice(slice);
      if (pageCards.length > 0) {
        rows.push(...pageCards);
        continue;
      }
    }

    const row = baseRowForOauthPlatform(apiName, unified);
    if (row) rows.push(row);
  }
  return mergeDashboardChannelsWithUnifiedResponse(rows, unified);
}
