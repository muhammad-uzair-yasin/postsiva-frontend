import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";
import { fetchWorkspacesForSession } from "@/lib/auth/authApi";
import { setStoredWorkspaces } from "@/lib/auth/session";
import {
  fetchUnifiedUserProfiles,
  invalidateUnifiedUserProfilesRequests,
  peekUnifiedUserProfilesCache,
} from "@/lib/dashboard/channelProfileApi";
import { notifyUnifiedProfilesMerged } from "@/lib/dashboard/unifiedProfilesPartialMerge";

/** Platforms requested on GET /unified/oauth/token. */
export const SOCIAL_OAUTH_TOKEN_STATUS_PLATFORMS = [
  "linkedin",
  "instagram",
  "facebook",
  "tiktok",
  "youtube",
  "pinterest",
  "threads",
  "bluesky",
  "mastodon",
  "wordpress",
] as const;

export type SocialOAuthTokenStatusPlatform =
  (typeof SOCIAL_OAUTH_TOKEN_STATUS_PLATFORMS)[number];

export type SocialOAuthTokenStatusMap = Record<
  SocialOAuthTokenStatusPlatform,
  boolean
>;

/** True when GET /unified/oauth/token reports at least one connected platform. */
export function oauthTokenStatusHasAnyConnection(
  status: SocialOAuthTokenStatusMap | null,
): boolean {
  if (!status) {
    return false;
  }
  return SOCIAL_OAUTH_TOKEN_STATUS_PLATFORMS.some((p) => status[p] === true);
}

export const SOCIAL_OAUTH_STATUS_UPDATED_EVENT =
  "postsiva:social-oauth-status-updated";

export interface SocialOAuthStatusUpdatedDetail {
  workspaceId: string;
  status: SocialOAuthTokenStatusMap;
}

const oauthTokenStatusCache = new Map<string, SocialOAuthTokenStatusMap>();
/** Key: `${workspaceId}\0${platform ?? ""}` — empty platform means full status fetch. */
const inflightOauthTokenStatus = new Map<
  string,
  Promise<SocialOAuthTokenStatusMap>
>();

function oauthTokenInflightKey(
  workspaceId: string,
  platform: SocialOAuthTokenStatusPlatform | undefined,
): string {
  return `${workspaceId}\0${platform ?? ""}`;
}

export function peekSocialOAuthTokenStatusCache(
  workspaceId: string,
): SocialOAuthTokenStatusMap | null {
  return oauthTokenStatusCache.get(workspaceId) ?? null;
}

export function notifySocialOAuthStatusUpdated(
  workspaceId: string,
  status: SocialOAuthTokenStatusMap,
): void {
  oauthTokenStatusCache.set(workspaceId, status);
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(
    new CustomEvent(SOCIAL_OAUTH_STATUS_UPDATED_EVENT, {
      detail: { workspaceId, status } satisfies SocialOAuthStatusUpdatedDetail,
    }),
  );
}

/** Clears cached GET /unified/oauth/token for a workspace (matches mobile before post-OAuth checks). */
export function invalidateSocialOAuthTokenStatusCache(
  workspaceId: string,
): void {
  oauthTokenStatusCache.delete(workspaceId);
}

export interface DeleteOAuthTokenResult {
  success: boolean;
  message: string;
}

export interface SocialOAuthAuthorizeUrlOptions {
  /** Required for Bluesky app-password connect. */
  bluesky?: {
    handle: string;
    appPassword: string;
  };
}

export interface SocialOAuthAuthorizeUrlResult {
  /** When set, redirect the user (e.g. popup) to start OAuth. When null, server completed connect without a redirect. */
  authUrl: string | null;
}

export interface SaveMastodonInstanceResult {
  instanceBase: string;
  instanceName: string | null;
}

export interface YouTubeConnectionSummary {
  channel_id: string;
  is_default: boolean;
  title: string | null;
  custom_url: string | null;
  thumbnail_url: string | null;
  connected_at: string | null;
}

async function youtubeConnectionRequest(
  accessToken: string,
  workspaceId: string,
  path: string,
  method: "GET" | "POST" | "DELETE",
): Promise<Record<string, unknown>> {
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/youtube/auth${path}`,
    accessToken,
    (t) => ({ Authorization: `Bearer ${t}`, "X-Workspace-Id": workspaceId }),
    { method },
  );
  const raw = (await res.json()) as Record<string, unknown>;
  if (!res.ok || raw.success === false) {
    throw new Error(String(raw.message ?? raw.detail ?? "YouTube connection request failed"));
  }
  invalidateUnifiedUserProfilesRequests(workspaceId);
  return raw;
}

export async function listYouTubeConnections(
  accessToken: string,
  workspaceId: string,
): Promise<YouTubeConnectionSummary[]> {
  const raw = await youtubeConnectionRequest(
    accessToken,
    workspaceId,
    "/connections",
    "GET",
  );
  const data = raw.data;
  if (!data || typeof data !== "object") return [];
  const list = (data as { connections?: unknown }).connections;
  return Array.isArray(list) ? (list as YouTubeConnectionSummary[]) : [];
}

export async function setDefaultYouTubeConnection(
  accessToken: string,
  workspaceId: string,
  channelId: string,
): Promise<void> {
  await youtubeConnectionRequest(
    accessToken,
    workspaceId,
    `/connections/${encodeURIComponent(channelId)}/default`,
    "POST",
  );
}

export async function deleteYouTubeConnection(
  accessToken: string,
  workspaceId: string,
  channelId: string,
): Promise<void> {
  await youtubeConnectionRequest(
    accessToken,
    workspaceId,
    `/connections/${encodeURIComponent(channelId)}`,
    "DELETE",
  );
}

function buildSocialOAuthUrlBody(
  platform: string,
  options?: SocialOAuthAuthorizeUrlOptions,
): Record<string, string> {
  const p = platform.trim();
  if (p === "bluesky") {
    const handle = options?.bluesky?.handle.trim() ?? "";
    const appPassword = options?.bluesky?.appPassword.trim() ?? "";
    if (!handle || !appPassword) {
      throw new Error("Bluesky requires handle and app password");
    }
    return {
      platform: "bluesky",
      handle,
      app_password: appPassword,
    };
  }
  return { platform: p };
}

/**
 * POST /unified/oauth/url — OAuth authorize URL or inline connect (JWT + X-Workspace-Id).
 * Body: `{ "platform": "linkedin" }` or `{ "platform": "bluesky", "handle": "…", "app_password": "…" }`.
 * Returns `results[platform].auth_url` when present; Bluesky may return success with no `auth_url`.
 */
export async function fetchSocialOAuthAuthorizeUrl(
  accessToken: string,
  workspaceId: string,
  platform: string,
  options?: SocialOAuthAuthorizeUrlOptions,
): Promise<SocialOAuthAuthorizeUrlResult> {
  const base = getApiBaseUrl();
  const res = await fetchWithAccessTokenRetry(
    `${base}/unified/oauth/url`,
    accessToken,
    (t) => ({
      Authorization: `Bearer ${t}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Workspace-Id": workspaceId,
    }),
    {
      method: "POST",
      body: JSON.stringify(buildSocialOAuthUrlBody(platform, options)),
    },
  );
  const data: unknown = await res.json();
  const results =
    data &&
    typeof data === "object" &&
    "results" in data &&
    typeof (data as { results: unknown }).results === "object" &&
    (data as { results: unknown }).results !== null
      ? (data as { results: Record<string, unknown> }).results
      : null;
  const block = results?.[platform];
  if (!block || typeof block !== "object") {
    throw new Error("Unexpected response from server");
  }
  const o = block as { success?: boolean; message?: string; auth_url?: unknown };
  if (!o.success) {
    throw new Error(
      typeof o.message === "string" && o.message.trim()
        ? o.message
        : "Could not get connect URL",
    );
  }
  const url =
    typeof o.auth_url === "string" && o.auth_url.trim()
      ? o.auth_url.trim()
      : null;
  return { authUrl: url };
}

/**
 * PUT /mastodon/instance — saves the workspace Mastodon server before OAuth starts.
 */
export async function saveMastodonInstanceForWorkspace(
  accessToken: string,
  workspaceId: string,
  instanceBase: string,
): Promise<SaveMastodonInstanceResult> {
  const rawInstance = instanceBase.trim();
  if (!rawInstance) {
    throw new Error("Enter a Mastodon instance.");
  }
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/mastodon/instance`,
    accessToken,
    (t) => ({
      Authorization: `Bearer ${t}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Workspace-Id": workspaceId,
    }),
    {
      method: "PUT",
      body: JSON.stringify({ instance_base: rawInstance }),
    },
  );
  const data = (await res.json()) as Record<string, unknown>;
  if (!res.ok || data.success === false) {
    throw new Error(
      String(data.message ?? data.detail ?? "Could not save Mastodon instance"),
    );
  }
  const savedInstanceBase =
    typeof data.instance_base === "string" ? data.instance_base : rawInstance;
  const instanceName =
    typeof data.instance_name === "string" && data.instance_name.trim()
      ? data.instance_name.trim()
      : null;
  return { instanceBase: savedInstanceBase, instanceName };
}

/**
 * DELETE /unified/oauth/token — disconnect one platform for a workspace (JWT + X-Workspace-Id).
 * @param platform API name: linkedin, instagram, facebook, tiktok, youtube, pinterest, threads, bluesky, mastodon, wordpress
 */
export async function deleteOAuthTokenForWorkspace(
  accessToken: string,
  workspaceId: string,
  platform: string,
  targetId?: string,
): Promise<DeleteOAuthTokenResult> {
  const base = getApiBaseUrl();
  const qs = new URLSearchParams({ platform });
  const target = targetId?.trim();
  if (target) {
    qs.set("target_id", target);
  }
  const res = await fetchWithAccessTokenRetry(
    `${base}/unified/oauth/token?${qs.toString()}`,
    accessToken,
    (t) => ({
      Authorization: `Bearer ${t}`,
      "X-Workspace-Id": workspaceId,
    }),
    { method: "DELETE" },
  );
  const data: unknown = await res.json();
  const results =
    data &&
    typeof data === "object" &&
    "results" in data &&
    (data as { results: unknown }).results &&
    typeof (data as { results: unknown }).results === "object"
      ? (data as { results: Record<string, unknown> }).results
      : null;
  const block = results?.[platform];
  if (!block || typeof block !== "object") {
    throw new Error("Unexpected response from server");
  }
  const o = block as { success?: boolean; message?: string };
  if (!o.success) {
    throw new Error(
      typeof o.message === "string" && o.message.trim()
        ? o.message
        : "Disconnect failed",
    );
  }
  if (
    SOCIAL_OAUTH_TOKEN_STATUS_PLATFORMS.includes(
      platform as SocialOAuthTokenStatusPlatform,
    )
  ) {
    const oauthPlatform = platform as SocialOAuthTokenStatusPlatform;
    invalidateUnifiedUserProfilesRequests(workspaceId);
    const currentStatus = peekSocialOAuthTokenStatusCache(workspaceId);
    if (currentStatus) {
      notifySocialOAuthStatusUpdated(workspaceId, {
        ...currentStatus,
        [oauthPlatform]: false,
      });
    }
    const currentProfiles = peekUnifiedUserProfilesCache(workspaceId);
    if (currentProfiles) {
      notifyUnifiedProfilesMerged(workspaceId, {
        ...currentProfiles,
        [oauthPlatform]: null,
      });
    }
    try {
      const freshProfiles = await fetchUnifiedUserProfiles(
        accessToken,
        workspaceId,
        { platforms: [], forceRefresh: true },
      );
      notifyUnifiedProfilesMerged(workspaceId, freshProfiles);
    } catch {
      // The disconnect succeeded and optimistic state is already correct.
    }
  }
  return {
    success: true,
    message:
      typeof o.message === "string" && o.message.trim()
        ? o.message
        : "Disconnected",
  };
}

/**
 * GET /unified/oauth/token — connection status per platform (JWT + X-Workspace-Id).
 * Omit `platform` to fetch all platforms (used after OAuth connect; optional `?platform=` scopes the request).
 */
export async function fetchSocialOAuthTokenStatus(
  accessToken: string,
  workspaceId: string,
  options?: {
    preferCache?: boolean;
    platform?: SocialOAuthTokenStatusPlatform;
  },
): Promise<SocialOAuthTokenStatusMap> {
  const preferCache = options?.preferCache ?? true;
  const scopedPlatform = options?.platform;
  if (preferCache && !scopedPlatform) {
    const cached = peekSocialOAuthTokenStatusCache(workspaceId);
    if (cached) {
      return cached;
    }
  }
  const inflightKey = oauthTokenInflightKey(workspaceId, scopedPlatform);
  const inflight = inflightOauthTokenStatus.get(inflightKey);
  if (inflight) {
    return inflight;
  }

  const promise = (async (): Promise<SocialOAuthTokenStatusMap> => {
    const base = getApiBaseUrl();
    const qs = scopedPlatform
      ? `?${new URLSearchParams({ platform: scopedPlatform }).toString()}`
      : "";
    const res = await fetchWithAccessTokenRetry(
      `${base}/unified/oauth/token${qs}`,
      accessToken,
      (t) => ({
        Authorization: `Bearer ${t}`,
        Accept: "application/json",
        "X-Workspace-Id": workspaceId,
      }),
      { method: "GET" },
    );
    const data: unknown = await res.json();
    const results =
      data &&
      typeof data === "object" &&
      "results" in data &&
      typeof (data as { results: unknown }).results === "object" &&
      (data as { results: unknown }).results !== null
        ? (data as { results: Record<string, unknown> }).results
        : {};
    const out = {} as SocialOAuthTokenStatusMap;
    for (const p of SOCIAL_OAUTH_TOKEN_STATUS_PLATFORMS) {
      const block = results[p];
      const success =
        block !== null &&
        typeof block === "object" &&
        "success" in block &&
        (block as { success?: unknown }).success === true;
      out[p] = Boolean(success);
    }
    if (!scopedPlatform) {
      oauthTokenStatusCache.set(workspaceId, out);
    }
    return out;
  })();
  inflightOauthTokenStatus.set(inflightKey, promise);
  void promise.finally(() => {
    inflightOauthTokenStatus.delete(inflightKey);
  });
  return promise;
}

/** Refetch workspaces from API and update localStorage (and notify listeners). */
export async function refreshStoredWorkspacesFromApi(
  accessToken: string,
): Promise<void> {
  const list = await fetchWorkspacesForSession(accessToken);
  setStoredWorkspaces(list);
}
