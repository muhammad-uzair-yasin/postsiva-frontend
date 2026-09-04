import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";
import { getStoredAccessToken } from "@/lib/auth/session";

/** Authenticated JSON fetch against the consolidated admin API (/admin/api). */

export class AdminAuthMissingError extends Error {
  constructor() {
    super("Admin session missing");
    this.name = "AdminAuthMissingError";
  }
}

function requireToken(): string {
  const token = getStoredAccessToken();
  if (!token) {
    throw new AdminAuthMissingError();
  }
  return token;
}

async function adminRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = requireToken();
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}${path}`,
    token,
    (t) => ({ Authorization: `Bearer ${t}`, Accept: "application/json" }),
    init,
  );
  return (await res.json()) as T;
}

export function adminGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  return adminRequest<T>(path, { signal });
}

export function adminSend<T>(
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
): Promise<T> {
  return adminRequest<T>(path, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export interface AdminPingResponse {
  ok: boolean;
  admin_email: string;
}

export function pingAdminApi(signal?: AbortSignal): Promise<AdminPingResponse> {
  return adminGet<AdminPingResponse>("/admin/api/ping", signal);
}
