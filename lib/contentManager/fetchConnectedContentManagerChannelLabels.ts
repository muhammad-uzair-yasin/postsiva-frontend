import type { DashboardConnectedChannel } from "@/lib/workspaces/dashboardConnectedChannels";
import { mergeConnectedChannelWithUnifiedSlice } from "@/lib/dashboard/connectedAccountDisplayFromUnified";

import { asRecordArray, pickString } from "@/lib/dashboard/profilePick";
import {
  fetchSocialOAuthTokenStatus,
  peekSocialOAuthTokenStatusCache,
  type SocialOAuthTokenStatusMap,
} from "@/lib/social/unifiedOAuthApi";
import {
  peekUnifiedUserProfilesCache,
  fetchUnifiedUserProfiles,
} from "@/lib/dashboard/channelProfileApi";

export type ConnectedContentManagerChannelLabels = Partial<
  Record<string, string>
>;

const CONTENT_LABELS: Record<string, string> = {
  instagram: "Instagram",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  threads: "Threads",
  tiktok: "TikTok",
  youtube: "YouTube",
  pinterest: "Pinterest",
  bluesky: "Bluesky",
  mastodon: "Mastodon",
};

const BASE_CHANNELS: Record<string, DashboardConnectedChannel> = {
  instagram: {
    key: "instagram",
    platform: "instagram",
    title: "Instagram account",
    subtitle: "Instagram",
    avatarUrl: null,
  },
  linkedin: {
    key: "linkedin",
    platform: "linkedin",
    title: "LinkedIn account",
    subtitle: "LinkedIn",
    avatarUrl: null,
  },
  facebook: {
    key: "facebook",
    platform: "facebook",
    title: "Facebook account",
    subtitle: "Facebook",
    avatarUrl: null,
  },
  threads: {
    key: "threads",
    platform: "threads",
    title: "Threads account",
    subtitle: "Threads",
    avatarUrl: null,
  },
  tiktok: {
    key: "tiktok",
    platform: "tiktok",
    title: "TikTok account",
    subtitle: "TikTok",
    avatarUrl: null,
  },
  youtube: {
    key: "youtube",
    platform: "youtube",
    title: "YouTube channel",
    subtitle: "YouTube",
    avatarUrl: null,
  },
  pinterest: {
    key: "pinterest",
    platform: "pinterest",
    title: "Pinterest account",
    subtitle: "Pinterest",
    avatarUrl: null,
  },
  bluesky: {
    key: "bluesky",
    platform: "bluesky",
    title: "Bluesky account",
    subtitle: "Bluesky",
    avatarUrl: null,
  },
  mastodon: {
    key: "mastodon",
    platform: "mastodon",
    title: "Mastodon account",
    subtitle: "Mastodon",
    avatarUrl: null,
  },
};

const UNIFIED_PLATFORM_KEYS = [
  "instagram",
  "linkedin",
  "facebook",
  "threads",
  "tiktok",
  "youtube",
  "pinterest",
  "bluesky",
  "mastodon",
] as const;

function connectedPlatformsFromOAuth(
  oauth: SocialOAuthTokenStatusMap | null,
): string[] {
  if (!oauth) {
    return [];
  }
  const connectedPlatforms: string[] = [];
  if (oauth.instagram) connectedPlatforms.push("instagram");
  if (oauth.linkedin) connectedPlatforms.push("linkedin");
  if (oauth.facebook) connectedPlatforms.push("facebook");
  if (oauth.threads) connectedPlatforms.push("threads");
  if (oauth.tiktok) connectedPlatforms.push("tiktok");
  if (oauth.youtube) connectedPlatforms.push("youtube");
  if (oauth.pinterest) connectedPlatforms.push("pinterest");
  if (oauth.bluesky) connectedPlatforms.push("bluesky");
  if (oauth.mastodon) connectedPlatforms.push("mastodon");
  return connectedPlatforms;
}

function inferPlatformsFromUnified(
  unified: Record<string, unknown> | null,
): string[] {
  if (!unified) {
    return [];
  }
  return UNIFIED_PLATFORM_KEYS.filter((k) => unified[k] != null);
}

function buildConnectedContentManagerChannelLabels(
  connectedPlatforms: string[],
  unified: Record<string, unknown> | null,
): ConnectedContentManagerChannelLabels {
  const next: ConnectedContentManagerChannelLabels = {};
  for (const p of connectedPlatforms) {
    const slice = unified?.[p];
    if (slice === null || slice === undefined) {
      continue;
    }

    if (p === "linkedin") {
      const r = slice as { profile?: unknown; organizations?: unknown };
      const merged = mergeConnectedChannelWithUnifiedSlice(BASE_CHANNELS[p], slice);
      next[p] = merged.title;
      const orgs = asRecordArray(r.organizations);
      orgs.forEach((o, index) => {
        const orgId =
          pickString(o, ["page_id", "organization_id", "id", "numeric_id"]) ??
          "";
        const orgName =
          pickString(o, ["page_name", "name", "localized_name"]) ??
          "Organization";
        const label = `${orgName} (${index + 1})`;
        if (orgId) {
          next[`linkedin:${orgId}`] = label;
        }
      });
      continue;
    }

    if (p === "facebook") {
      const r = slice as { profile?: unknown; pages?: unknown };
      const pages = asRecordArray(r.pages);
      if (pages.length === 0) {
        const merged = mergeConnectedChannelWithUnifiedSlice(
          BASE_CHANNELS[p],
          slice,
        );
        next[p] = `${CONTENT_LABELS[p]} · ${merged.title}`;
        continue;
      }
      pages.forEach((pg, index) => {
        const pageId =
          pickString(pg, ["page_id", "id", "numeric_id"]) ?? "";
        const pageName =
          pickString(pg, ["page_name", "name"]) ?? "Page";
        const label = `${pageName} (${index + 1})`;
        if (pageId) {
          next[`facebook:${pageId}`] = label;
        }
      });
      continue;
    }

    const merged = mergeConnectedChannelWithUnifiedSlice(BASE_CHANNELS[p], slice);
    next[p] = merged.title || CONTENT_LABELS[p];
  }
  return next;
}

/**
 * Build channel labels from in-memory caches only (no network).
 * Use on Content Manager so navigating to the page does not trigger OAuth / unified profile requests
 * when the user already loaded another workspace screen (caches warm).
 */
export function getConnectedContentManagerChannelLabelsFromCachesOnly(
  workspaceId: string,
): ConnectedContentManagerChannelLabels {
  const oauth = peekSocialOAuthTokenStatusCache(workspaceId);
  let connectedPlatforms = connectedPlatformsFromOAuth(oauth);
  const unified = peekUnifiedUserProfilesCache(workspaceId);
  if (connectedPlatforms.length === 0) {
    connectedPlatforms = inferPlatformsFromUnified(unified);
  }
  if (connectedPlatforms.length === 0) {
    return {};
  }
  return buildConnectedContentManagerChannelLabels(connectedPlatforms, unified);
}

export async function fetchConnectedContentManagerChannelLabels(
  accessToken: string,
  workspaceId: string,
): Promise<ConnectedContentManagerChannelLabels> {
  let oauth: SocialOAuthTokenStatusMap | null =
    peekSocialOAuthTokenStatusCache(workspaceId);
  if (!oauth) {
    oauth = await fetchSocialOAuthTokenStatus(accessToken, workspaceId, {
      preferCache: false,
    });
  }

  const connectedPlatforms = connectedPlatformsFromOAuth(oauth);
  if (connectedPlatforms.length === 0) {
    return {};
  }

  let unified = peekUnifiedUserProfilesCache(workspaceId);
  const needsUnifiedFetch =
    !unified ||
    connectedPlatforms.some(
      (p) => (unified as Record<string, unknown>)[p] == null,
    );
  if (needsUnifiedFetch) {
    unified = await fetchUnifiedUserProfiles(accessToken, workspaceId, {
      platforms: connectedPlatforms,
      forceRefresh: false,
    });
  }

  return buildConnectedContentManagerChannelLabels(
    connectedPlatforms,
    unified,
  );
}
