import { fetchUnifiedUserProfiles } from "@/lib/dashboard/channelProfileApi";
import { fetchUnifiedPosts } from "@/lib/contentManager/unifiedPostsApi";
import { fetchUnifiedComments } from "@/lib/social/unifiedCommentsApi";
import {
  fetchSocialOAuthTokenStatus,
  invalidateSocialOAuthTokenStatusCache,
  type SocialOAuthTokenStatusMap,
  type SocialOAuthTokenStatusPlatform,
} from "@/lib/social/unifiedOAuthApi";

/**
 * Post-OAuth prefetch posts limit. LinkedIn is aligned to 50 (same as other platforms).
 */
function postOAuthUnifiedPostsLimit(
  platform: keyof SocialOAuthTokenStatusMap,
  _linkedinOauthConnectionCount?: number,
): number {
  if (platform !== "linkedin") {
    return 50;
  }
  return 50;
}

/** GET /unified/comments/ prefetch: 50 posts' worth of context per platform (product default). */
function postOAuthUnifiedCommentsLimit(
  _platform: keyof SocialOAuthTokenStatusMap,
): number {
  return 50;
}

function readLinkedinOauthConnectionCount(
  profiles: Record<string, unknown>,
): number | undefined {
  const li = profiles.linkedin;
  if (li === null || typeof li !== "object") {
    return undefined;
  }
  const raw = (li as Record<string, unknown>).oauth_connection_count;
  if (typeof raw !== "number" || !Number.isFinite(raw)) {
    return undefined;
  }
  return raw;
}

/**
 * GET /unified/comments/ after OAuth — same set as mobile; Pinterest skipped (no inbox comments prefetch).
 */
const POST_OAUTH_UNIFIED_COMMENTS_PLATFORMS: ReadonlySet<SocialOAuthTokenStatusPlatform> =
  new Set([
    "linkedin",
    "facebook",
    "instagram",
    "youtube",
    "threads",
    "tiktok",
    "mastodon",
  ]);

const BETWEEN_CHECKS_MS = 2;
const FACEBOOK_PAGES_RETRY_MS = 1500;

export const OAUTH_SYNC_NOT_CONNECTED_MESSAGE =
  "Connection was interrupted. Please reconnect and try again.";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractFacebookPageIdsFromUnifiedProfiles(
  profiles: Record<string, unknown>,
): string[] {
  const fb = profiles.facebook;
  if (fb === null || typeof fb !== "object") {
    return [];
  }
  const pagesRaw = (fb as Record<string, unknown>).pages;
  if (!Array.isArray(pagesRaw)) {
    return [];
  }
  const ids: string[] = [];
  for (const p of pagesRaw) {
    if (p === null || typeof p !== "object") {
      continue;
    }
    const id = String((p as Record<string, unknown>).page_id ?? "").trim();
    if (id.length > 0) {
      ids.push(id);
    }
  }
  return ids;
}

/** Full workspace connection map (no `?platform=` — same as modal refresh after disconnect). */
async function fetchFullOAuthTokenStatus(
  accessToken: string,
  workspaceId: string,
): Promise<SocialOAuthTokenStatusMap> {
  return fetchSocialOAuthTokenStatus(accessToken, workspaceId, {
    preferCache: false,
  });
}

async function prefetchFacebookSinglePageParallel(
  accessToken: string,
  workspaceId: string,
  pageId: string,
): Promise<void> {
  await Promise.all([
    fetchUnifiedPosts(accessToken, workspaceId, {
      platforms: ["facebook"],
      forceRefresh: true,
      limit: postOAuthUnifiedPostsLimit("facebook"),
      stats: true,
      facebookPageIds: [pageId],
    }).catch(() => undefined),
    fetchUnifiedComments(accessToken, workspaceId, {
      platforms: ["facebook"],
      limit: postOAuthUnifiedCommentsLimit("facebook"),
      commentsPerPost: 50,
      forceRefresh: true,
      facebookPageIds: [pageId],
    }).catch(() => undefined),
  ]);
}

async function prefetchUnifiedDataSequential(
  accessToken: string,
  workspaceId: string,
  oauthPlatform: keyof SocialOAuthTokenStatusMap,
  options: {
    facebookPageIds?: string[];
    linkedinOauthConnectionCount?: number;
  },
): Promise<void> {
  try {
    await fetchUnifiedPosts(accessToken, workspaceId, {
      platforms: [oauthPlatform],
      forceRefresh: true,
      allowPaidLinkedinRefresh: oauthPlatform === "linkedin",
      limit: postOAuthUnifiedPostsLimit(
        oauthPlatform,
        options.linkedinOauthConnectionCount,
      ),
      stats: true,
      ...(options.facebookPageIds && options.facebookPageIds.length > 0
        ? { facebookPageIds: options.facebookPageIds }
        : {}),
    });
  } catch {
    // Best-effort: feed can load on next screen.
  }
  if (POST_OAUTH_UNIFIED_COMMENTS_PLATFORMS.has(oauthPlatform)) {
    try {
      await fetchUnifiedComments(accessToken, workspaceId, {
        platforms: [oauthPlatform],
        limit: postOAuthUnifiedCommentsLimit(oauthPlatform),
        commentsPerPost: 50,
        forceRefresh: true,
        ...(options.facebookPageIds && options.facebookPageIds.length > 0
          ? { facebookPageIds: options.facebookPageIds }
          : {}),
      });
    } catch {
      // Best-effort: inbox can load on next visit.
    }
  }
}

export interface RunPostOAuthConnectSyncResult {
  oauthStatusMap: SocialOAuthTokenStatusMap;
  profilesPartial: Record<string, unknown>;
}

/**
 * After OAuth: two GET /unified/oauth/token calls (no platform filter) 2ms apart so the client
 * receives every connected account; we still require the just-connected platform to be true in
 * that map. Then GET /unified/user-profiles/ for the connected platform with force_refresh,
 * then posts + comments prefetch (Pinterest comments skipped).
 */
export async function runPostOAuthConnectSync(
  accessToken: string,
  workspaceId: string,
  oauthPlatform: SocialOAuthTokenStatusPlatform,
): Promise<RunPostOAuthConnectSyncResult> {
  invalidateSocialOAuthTokenStatusCache(workspaceId);
  const firstMap = await fetchFullOAuthTokenStatus(accessToken, workspaceId);
  const first = Boolean(firstMap[oauthPlatform]);
  await sleep(BETWEEN_CHECKS_MS);
  const secondMap = await fetchFullOAuthTokenStatus(accessToken, workspaceId);
  const second = Boolean(secondMap[oauthPlatform]);
  if (!first && !second) {
    throw new Error(OAUTH_SYNC_NOT_CONNECTED_MESSAGE);
  }

  const oauthStatusMap = secondMap;

  if (oauthPlatform === "facebook") {
    let profiles = await fetchUnifiedUserProfiles(accessToken, workspaceId, {
      platforms: ["facebook"],
      forceRefresh: true,
    });
    let pageIds = extractFacebookPageIdsFromUnifiedProfiles(profiles);
    if (pageIds.length === 0) {
      // Backend may persist pages shortly after profile fetch; retry once before showing "no pages".
      await sleep(FACEBOOK_PAGES_RETRY_MS);
      profiles = await fetchUnifiedUserProfiles(accessToken, workspaceId, {
        platforms: ["facebook"],
        forceRefresh: true,
      });
      pageIds = extractFacebookPageIdsFromUnifiedProfiles(profiles);
    }
    if (pageIds.length > 0) {
      await Promise.all(
        pageIds.map((pageId) =>
          prefetchFacebookSinglePageParallel(accessToken, workspaceId, pageId),
        ),
      );
    } else {
      await prefetchUnifiedDataSequential(accessToken, workspaceId, "facebook", {});
    }
    return { oauthStatusMap, profilesPartial: profiles };
  }

  const profilesPartial = await fetchUnifiedUserProfiles(accessToken, workspaceId, {
    platforms: [oauthPlatform],
    forceRefresh: true,
  });
  const linkedinOauthConnectionCount =
    oauthPlatform === "linkedin"
      ? readLinkedinOauthConnectionCount(profilesPartial)
      : undefined;
  await prefetchUnifiedDataSequential(accessToken, workspaceId, oauthPlatform, {
    linkedinOauthConnectionCount,
  });
  return { oauthStatusMap, profilesPartial };
}
