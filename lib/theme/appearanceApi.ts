import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";
import { parseApiErrorBody } from "@/lib/api/parseApiError";
import { getStoredAccessToken } from "@/lib/auth/session";

import type { AppTheme, LayoutMode } from "@/lib/theme/themeConstants";

export type UserAppearance = {
  theme: AppTheme;
  layout_mode: LayoutMode;
};

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

async function readError(res: Response): Promise<string> {
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return parseApiErrorBody(body);
}

export async function fetchUserAppearance(
  token?: string | null,
): Promise<UserAppearance | null> {
  const access = token ?? getStoredAccessToken();
  if (!access) return null;
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/user/appearance/me`,
    access,
    authHeaders,
  );
  if (!res.ok) throw new Error(await readError(res));
  return (await res.json()) as UserAppearance;
}

export async function saveUserAppearance(
  patch: { theme?: AppTheme; layout_mode?: LayoutMode },
  token?: string | null,
): Promise<UserAppearance | null> {
  const access = token ?? getStoredAccessToken();
  if (!access) return null;
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/user/appearance/me`,
    access,
    authHeaders,
    { method: "PUT", body: JSON.stringify(patch) },
  );
  if (!res.ok) throw new Error(await readError(res));
  return (await res.json()) as UserAppearance;
}
