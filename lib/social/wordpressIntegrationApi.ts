import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";

export interface WordPressStartOAuthResult {
  authorizationUrl: string;
}

export interface WordPressPendingSite {
  remoteSiteId: string;
  name: string | null;
  url: string;
  iconUrl: string | null;
  isJetpack: boolean;
  canPublish: boolean;
  alreadyConnected: boolean;
  reason: string | null;
}

export interface WordPressPendingSelection {
  accountLogin: string | null;
  sites: WordPressPendingSite[];
}

export interface WordPressConnectedAccount {
  id: string;
  siteName: string | null;
  siteUrl: string;
  username: string | null;
  status: string;
}

function authHeaders(workspaceId: string) {
  return (t: string) => ({
    Authorization: `Bearer ${t}`,
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Workspace-Id": workspaceId,
  });
}

function errorFrom(raw: Record<string, unknown>, fallback: string): Error {
  const detail = raw.detail;
  if (detail && typeof detail === "object") {
    const d = detail as { message?: unknown; code?: unknown };
    return new Error(String(d.message ?? d.code ?? fallback));
  }
  return new Error(String(raw.message ?? raw.detail ?? fallback));
}

/** Begin WordPress.com authorization; returns the URL to open in the popup. */
export async function startWordPressOAuth(
  accessToken: string,
  workspaceId: string,
): Promise<WordPressStartOAuthResult> {
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/api/integrations/wordpress/oauth/start`,
    accessToken,
    authHeaders(workspaceId),
    { method: "POST" },
  );
  const raw = (await res.json()) as Record<string, unknown>;
  if (!res.ok || raw.success === false) {
    throw errorFrom(raw, "Could not start the WordPress connection.");
  }
  const authorizationUrl =
    typeof raw.authorization_url === "string" ? raw.authorization_url.trim() : "";
  if (!authorizationUrl) {
    throw new Error("WordPress did not return an authorization URL.");
  }
  return { authorizationUrl };
}

/** Sites available for selection after the user approved on WordPress.com. */
export async function getWordPressPendingSelection(
  accessToken: string,
  workspaceId: string,
  handle: string,
): Promise<WordPressPendingSelection> {
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/api/integrations/wordpress/oauth/pending/${encodeURIComponent(handle)}`,
    accessToken,
    authHeaders(workspaceId),
    { method: "GET" },
  );
  const raw = (await res.json()) as Record<string, unknown>;
  if (!res.ok || raw.success === false) {
    throw errorFrom(raw, "Could not load your WordPress sites.");
  }
  const account = (raw.account ?? {}) as Record<string, unknown>;
  const sites = Array.isArray(raw.sites) ? raw.sites : [];
  return {
    accountLogin: typeof account.login === "string" ? account.login : null,
    sites: sites.map((entry) => {
      const s = entry as Record<string, unknown>;
      return {
        remoteSiteId: String(s.remote_site_id ?? ""),
        name: typeof s.name === "string" ? s.name : null,
        url: String(s.url ?? ""),
        iconUrl: typeof s.icon_url === "string" ? s.icon_url : null,
        isJetpack: Boolean(s.is_jetpack),
        canPublish: s.can_publish !== false,
        alreadyConnected: Boolean(s.already_connected),
        reason: typeof s.reason === "string" ? s.reason : null,
      };
    }),
  };
}

/** Create one connection per selected site. */
export async function confirmWordPressSites(
  accessToken: string,
  workspaceId: string,
  handle: string,
  remoteSiteIds: string[],
): Promise<WordPressConnectedAccount[]> {
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/api/integrations/wordpress/oauth/confirm`,
    accessToken,
    authHeaders(workspaceId),
    {
      method: "POST",
      body: JSON.stringify({
        handle,
        remote_site_ids: remoteSiteIds,
        workspace_id: workspaceId,
      }),
    },
  );
  const raw = (await res.json()) as Record<string, unknown>;
  if (!res.ok || raw.success === false) {
    throw errorFrom(raw, "Could not connect the selected WordPress sites.");
  }
  const accounts = Array.isArray(raw.accounts) ? raw.accounts : [];
  return accounts.map((entry) => {
    const a = entry as Record<string, unknown>;
    return {
      id: String(a.id ?? ""),
      siteName: typeof a.site_name === "string" ? a.site_name : null,
      siteUrl: String(a.site_url ?? ""),
      username: typeof a.username === "string" ? a.username : null,
      status: String(a.status ?? "connected"),
    };
  });
}

export interface WordPressSiteInspection {
  siteUrl: string;
  siteName: string | null;
  hasJetpack: boolean;
}

/** Pre-flight a self-hosted site: is it WordPress, and does it run Jetpack? */
export async function inspectWordPressSite(
  accessToken: string,
  workspaceId: string,
  siteUrl: string,
): Promise<WordPressSiteInspection> {
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/api/integrations/wordpress/self-hosted/inspect`,
    accessToken,
    authHeaders(workspaceId),
    { method: "POST", body: JSON.stringify({ site_url: siteUrl }) },
  );
  const raw = (await res.json()) as Record<string, unknown>;
  if (!res.ok || raw.success === false) {
    throw errorFrom(raw, "Could not read that WordPress site.");
  }
  return {
    siteUrl: String(raw.site_url ?? siteUrl),
    siteName: typeof raw.site_name === "string" ? raw.site_name : null,
    hasJetpack: Boolean(raw.has_jetpack),
  };
}

/** Connect self-hosted WordPress with a manually created Application Password. */
export async function connectWordPressSelfHostedManual(
  accessToken: string,
  workspaceId: string,
  siteUrl: string,
  userLogin: string,
  applicationPassword: string,
): Promise<WordPressConnectedAccount> {
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/api/integrations/wordpress/self-hosted/connect`,
    accessToken,
    authHeaders(workspaceId),
    {
      method: "POST",
      body: JSON.stringify({
        site_url: siteUrl,
        user_login: userLogin,
        application_password: applicationPassword,
      }),
    },
  );
  const raw = (await res.json()) as Record<string, unknown>;
  if (!res.ok || raw.success === false) {
    throw errorFrom(raw, "Could not connect that WordPress site.");
  }
  const a = (raw.account ?? {}) as Record<string, unknown>;
  return {
    id: String(a.id ?? ""),
    siteName: typeof a.site_name === "string" ? a.site_name : null,
    siteUrl: String(a.site_url ?? siteUrl),
    username: typeof a.username === "string" ? a.username : null,
    status: String(a.status ?? "connected"),
  };
}

/** Connected WordPress sites in this workspace, with health status. */
export async function listWordPressConnections(
  accessToken: string,
  workspaceId: string,
): Promise<WordPressConnectedAccount[]> {
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/api/integrations/wordpress`,
    accessToken,
    authHeaders(workspaceId),
    { method: "GET" },
  );
  const raw = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    throw errorFrom(raw, "Could not load WordPress connections.");
  }
  const accounts = Array.isArray(raw.accounts) ? raw.accounts : [];
  return accounts.map((entry) => {
    const a = entry as Record<string, unknown>;
    return {
      id: String(a.id ?? ""),
      siteName: typeof a.site_name === "string" ? a.site_name : null,
      siteUrl: String(a.site_url ?? ""),
      username: typeof a.username === "string" ? a.username : null,
      status: String(a.status ?? "connected"),
    };
  });
}

export async function deleteWordPressConnection(
  accessToken: string,
  workspaceId: string,
  connectionId: string,
): Promise<void> {
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/api/integrations/wordpress/${encodeURIComponent(connectionId)}`,
    accessToken,
    (t) => ({
      Authorization: `Bearer ${t}`,
      Accept: "application/json",
      "X-Workspace-Id": workspaceId,
    }),
    { method: "DELETE" },
  );
  const raw = (await res.json()) as Record<string, unknown>;
  if (!res.ok || raw.success === false) {
    throw errorFrom(raw, "Could not disconnect WordPress.");
  }
}
