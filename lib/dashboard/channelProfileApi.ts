import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";
import { fetchUnifiedBlogProfile } from "@/lib/social/unifiedBlogProfileApi";

function workspaceHeaders(
  accessToken: string,
  workspaceId: string,
): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
    "X-Workspace-Id": workspaceId,
  };
}

/** Last successful full/partial aggregate per workspace (for subscribers that mount after fetch). */
const unifiedProfilesByWorkspace = new Map<string, Record<string, unknown>>();

export function replaceUnifiedUserProfilesCache(
  workspaceId: string,
  profiles: Record<string, unknown>,
): void {
  unifiedProfilesByWorkspace.set(workspaceId, profiles);
}

export function peekUnifiedUserProfilesCache(
  workspaceId: string,
): Record<string, unknown> | null {
  return unifiedProfilesByWorkspace.get(workspaceId) ?? null;
}

function unifiedUserProfilesRequestKey(
  workspaceId: string,
  options: {
    platforms: string[];
    forceRefresh: boolean;
    facebookPageId?: string;
  },
): string {
  const sorted = [...options.platforms].sort().join("\0");
  const page = options.facebookPageId ?? "";
  return `${workspaceId}\0${options.forceRefresh}\0${sorted}\0${page}`;
}

const inflightUnifiedUserProfiles = new Map<
  string,
  Promise<Record<string, unknown>>
>();
const unifiedProfilesGeneration = new Map<string, number>();

/** Prevent profile requests started before a disconnect from publishing stale account data. */
export function invalidateUnifiedUserProfilesRequests(workspaceId: string): void {
  unifiedProfilesGeneration.set(
    workspaceId,
    (unifiedProfilesGeneration.get(workspaceId) ?? 0) + 1,
  );
  for (const key of inflightUnifiedUserProfiles.keys()) {
    if (key.startsWith(`${workspaceId}\0`)) {
      inflightUnifiedUserProfiles.delete(key);
    }
  }
}

/**
 * GET /unified/user-profiles/ — aggregate profiles; with force_refresh, each requested platform is refreshed from its API.
 * Uses a trailing slash to avoid a 307 redirect. Coalesces identical in-flight requests (e.g. dashboard + hover).
 */
export async function fetchUnifiedUserProfiles(
  accessToken: string,
  workspaceId: string,
  options: {
    platforms: string[];
    forceRefresh: boolean;
    facebookPageId?: string;
  },
): Promise<Record<string, unknown>> {
  const requestGeneration = unifiedProfilesGeneration.get(workspaceId) ?? 0;
  const hasWordpress = options.platforms.some(
    (p) => p.trim().toLowerCase() === "wordpress",
  );
  const socialPlatforms = options.platforms.filter(
    (p) => p.trim().toLowerCase() !== "wordpress",
  );

  if (hasWordpress && socialPlatforms.length === 0) {
    const profiles = await fetchUnifiedBlogProfile(accessToken, workspaceId, {
      forceRefresh: options.forceRefresh,
    });
    if ((unifiedProfilesGeneration.get(workspaceId) ?? 0) !== requestGeneration) {
      throw new Error("Discarded stale unified profiles response");
    }
    return profiles;
  }

  const key = unifiedUserProfilesRequestKey(workspaceId, options);
  const existing = inflightUnifiedUserProfiles.get(key);
  if (existing) {
    return existing;
  }

  const promise = (async (): Promise<Record<string, unknown>> => {
    const base = getApiBaseUrl();
    const params = new URLSearchParams();
    if (options.forceRefresh) {
      params.set("force_refresh", "true");
    }
    for (const p of socialPlatforms.length > 0 ? socialPlatforms : options.platforms) {
      params.append("platforms", p);
    }
    if (options.facebookPageId) {
      params.set("facebook_page_id", options.facebookPageId);
    }
    const q = params.toString();
    const path = `${base}/unified/user-profiles/`;
    const url = q ? `${path}?${q}` : path;
    const res = await fetchWithAccessTokenRetry(
      url,
      accessToken,
      (t) => workspaceHeaders(t, workspaceId),
      { method: "GET" },
    );
    const profiles = (await res.json()) as Record<string, unknown>;
    if ((unifiedProfilesGeneration.get(workspaceId) ?? 0) !== requestGeneration) {
      throw new Error("Discarded stale unified profiles response");
    }
    if (hasWordpress && socialPlatforms.length > 0) {
      const wpProfiles = await fetchUnifiedBlogProfile(accessToken, workspaceId, {
        forceRefresh: options.forceRefresh,
      });
      return { ...profiles, ...(wpProfiles.wordpress != null ? { wordpress: wpProfiles.wordpress } : {}) };
    }
    return profiles;
  })();

  inflightUnifiedUserProfiles.set(key, promise);
  const cleanup = (): void => {
    if (inflightUnifiedUserProfiles.get(key) === promise) {
      inflightUnifiedUserProfiles.delete(key);
    }
  };
  void promise.then(cleanup, cleanup);

  return promise;
}
