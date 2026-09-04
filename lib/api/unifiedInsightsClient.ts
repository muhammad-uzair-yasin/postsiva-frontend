import { getApiBaseUrl } from "./config";
import { fetchWithAccessTokenRetry } from "./fetchWithAccessTokenRetry";
import { getStoredAccessToken } from "@/lib/auth/session";

export interface UnifiedProfileResponse {
  success: boolean;
  platform: string;
  account_id?: string | null;
  workspace_id: string;
  profile: {
    username: string;
    profile_image?: string | null;
    custom_url?: string | null;
    vanity_name?: string | null;
    headline?: string | null;
    description?: string | null;
  };
  metrics: Record<string, unknown>;
  history: Array<{
    date: string;
    [key: string]: unknown;
  }>;
  error?: string;
}

export interface UnifiedPostsResponse {
  success: boolean;
  platform: string;
  posts: Array<Record<string, unknown>>;
  error?: string;
}

export interface UnifiedRefreshResponse {
  ok: boolean;
  run_id: string;
  platform: string;
  account_id?: string | null;
  message: string;
}

function getAuthToken(): string {
  const token = getStoredAccessToken();
  return token || "";
}

export async function fetchUnifiedProfileInsights(
  platform: string,
  workspaceId?: string,
  days = 30,
  accountId?: string | null,
): Promise<UnifiedProfileResponse> {
  const baseUrl = getApiBaseUrl();
  const query = new URLSearchParams({ platform, days: String(days) });
  if (workspaceId) query.set("workspace_id", workspaceId);
  if (accountId) query.set("account_id", accountId);

  const token = getAuthToken();
  const res = await fetchWithAccessTokenRetry(
    `${baseUrl}/unified-insights/profile?${query.toString()}`,
    token,
    (t) => ({ Authorization: `Bearer ${t}`, Accept: "application/json" }),
  );
  return res.json();
}

export async function fetchUnifiedPostInsights(
  platform: string,
  workspaceId?: string,
  limit = 25,
  accountId?: string | null,
): Promise<UnifiedPostsResponse> {
  const baseUrl = getApiBaseUrl();
  const query = new URLSearchParams({ platform, limit: String(limit) });
  if (workspaceId) query.set("workspace_id", workspaceId);
  if (accountId) query.set("account_id", accountId);

  const token = getAuthToken();
  const res = await fetchWithAccessTokenRetry(
    `${baseUrl}/unified-insights/posts?${query.toString()}`,
    token,
    (t) => ({ Authorization: `Bearer ${t}`, Accept: "application/json" }),
  );
  return res.json();
}

/**
 * Trigger a live snapshot refresh for a platform, then re-fetch the profile.
 * Call this when user clicks the refresh button on the dashboard.
 */
export async function triggerUnifiedInsightsRefresh(
  platform: string,
  workspaceId?: string,
  accountId?: string | null,
): Promise<UnifiedRefreshResponse> {
  const baseUrl = getApiBaseUrl();
  const query = new URLSearchParams({ platform });
  if (workspaceId) query.set("workspace_id", workspaceId);
  if (accountId) query.set("account_id", accountId);

  const token = getAuthToken();
  const res = await fetchWithAccessTokenRetry(
    `${baseUrl}/unified-insights/refresh?${query.toString()}`,
    token,
    (t) => ({ Authorization: `Bearer ${t}`, Accept: "application/json" }),
    { method: "POST" },
  );
  return res.json();
}
