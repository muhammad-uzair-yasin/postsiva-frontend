import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";
import { parseApiErrorBody } from "@/lib/api/parseApiError";

import type {
  AuthUser,
  AuthWorkspaceLoginItem,
  LoginSuccessPayload,
  SignupSuccessPayload,
} from "./types";
import { usernameFromEmail } from "./usernameFromEmail";

/** Normalize API user fields for UI (full_name, image_url, id). */
export function normalizeUser(user: AuthUser): AuthUser {
  const fullName =
    typeof user.full_name === "string"
      ? user.full_name.trim() || ""
      : user.full_name ?? "";
  const imageUrl =
    typeof user.image_url === "string"
      ? user.image_url.trim() || null
      : user.image_url ?? null;
  return {
    ...user,
    id: typeof user.id === "string" ? user.id : String(user.id),
    full_name: fullName,
    image_url: imageUrl,
    must_set_password: user.must_set_password ?? true,
    email_verified: Boolean(user.email_verified),
  };
}

export interface UpdateProfilePayload {
  full_name?: string;
  username?: string;
  image_url?: string;
}

export async function readApiErrorMessage(res: Response): Promise<string> {
  try {
    const data: unknown = await res.json();
    if (data && typeof data === "object") {
      const o = data as Record<string, unknown>;
      if (typeof o.message === "string") {
        return o.message;
      }
      const detail = o.detail;
      if (typeof detail === "string") {
        return detail;
      }
      if (detail && typeof detail === "object" && !Array.isArray(detail)) {
        const nested = detail as Record<string, unknown>;
        if (typeof nested.message === "string") {
          return nested.message;
        }
        if (nested.error === "insufficient_ai_credits") {
          const available = Number(nested.available ?? 0);
          const required = Number(nested.required ?? 0);
          if (Number.isFinite(available) && Number.isFinite(required) && required > 0) {
            return `You need ${required} AI credits, but only have ${Math.max(available, 0)} available.`;
          }
          return "You do not have enough AI credits for this action.";
        }
      }
      if (Array.isArray(detail)) {
        const parts = detail
          .map((item) => {
            if (item && typeof item === "object" && "msg" in item) {
              return String((item as { msg: string }).msg);
            }
            return "";
          })
          .filter(Boolean);
        if (parts.length) {
          return parts.join(", ");
        }
      }
    }
  } catch {
    // ignore
  }
  return res.statusText || "Request failed";
}

export async function loginWithPassword(
  email: string,
  password: string,
): Promise<LoginSuccessPayload> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim(), password }),
  });
  if (!res.ok) {
    throw new Error(await readApiErrorMessage(res));
  }
  const raw: unknown = await res.json();
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid login response");
  }
  const o = raw as Record<string, unknown>;
  const accessToken =
    typeof o.access_token === "string" ? o.access_token.trim() : "";
  if (!accessToken) {
    throw new Error("Invalid login response: missing access_token");
  }
  const tokenType =
    typeof o.token_type === "string" ? o.token_type : "bearer";
  const userRaw = o.user;
  if (!userRaw || typeof userRaw !== "object") {
    throw new Error("Invalid login response: missing user");
  }
  return {
    access_token: accessToken,
    token_type: tokenType,
    user: normalizeUser(userRaw as AuthUser),
    workspaces: [],
  };
}

/** Exchange one-time admin impersonation handoff code for a login session. */
export async function exchangeImpersonationCode(
  code: string,
): Promise<LoginSuccessPayload> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/auth/impersonate/exchange`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: code.trim() }),
  });
  if (!res.ok) {
    throw new Error(await readApiErrorMessage(res));
  }
  const raw: unknown = await res.json();
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid impersonation response");
  }
  const o = raw as Record<string, unknown>;
  const accessToken =
    typeof o.access_token === "string" ? o.access_token.trim() : "";
  if (!accessToken) {
    throw new Error("Invalid impersonation response: missing access_token");
  }
  const tokenType =
    typeof o.token_type === "string" ? o.token_type : "bearer";
  const userRaw = o.user;
  if (!userRaw || typeof userRaw !== "object") {
    throw new Error("Invalid impersonation response: missing user");
  }
  return {
    access_token: accessToken,
    token_type: tokenType,
    user: normalizeUser(userRaw as AuthUser),
    workspaces: [],
  };
}

function authHeaders(accessToken: string): HeadersInit {
  return { Authorization: `Bearer ${accessToken}` };
}

export async function fetchCurrentUser(
  accessToken: string,
  signal?: AbortSignal,
): Promise<AuthUser> {
  const base = getApiBaseUrl();
  const res = await fetchWithAccessTokenRetry(
    `${base}/auth/me`,
    accessToken,
    (t) => ({
      ...authHeaders(t),
      Accept: "application/json",
    }),
    { signal },
  );
  const raw = (await res.json()) as AuthUser;
  return normalizeUser(raw);
}

/** POST /auth/logout — best-effort server notify; client clears JWT locally. */
export async function logoutWithTokens(
  accessToken: string | null,
): Promise<void> {
  const base = getApiBaseUrl();
  const trimmedAccess = accessToken?.trim() ?? "";
  const res = await fetch(`${base}/auth/logout`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(trimmedAccess ? { Authorization: `Bearer ${trimmedAccess}` } : {}),
    },
    body: JSON.stringify({}),
  });
  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(parseApiErrorBody(body));
  }
}

export async function updateProfile(
  accessToken: string,
  payload: UpdateProfilePayload,
): Promise<AuthUser> {
  const base = getApiBaseUrl();
  const res = await fetchWithAccessTokenRetry(
    `${base}/auth/profile`,
    accessToken,
    (t) => ({
      ...authHeaders(t),
      Accept: "application/json",
      "Content-Type": "application/json",
    }),
    { method: "PATCH", body: JSON.stringify(payload) },
  );
  const body: unknown = await res.json().catch(() => null);
  return normalizeUser(body as AuthUser);
}

/** POST /auth/profile/image — multipart field `file` (jpg, png, gif, webp). */
export async function uploadProfileImage(
  accessToken: string,
  file: File,
): Promise<AuthUser> {
  const base = getApiBaseUrl();
  const form = new FormData();
  form.append("file", file);
  const res = await fetchWithAccessTokenRetry(
    `${base}/auth/profile/image`,
    accessToken,
    (t) => ({
      Authorization: `Bearer ${t}`,
      Accept: "application/json",
    }),
    { method: "POST", body: form },
  );
  const body: unknown = await res.json().catch(() => null);
  return normalizeUser(body as AuthUser);
}

/** Same-token concurrent callers share one GET /workspaces (e.g. React Strict Mode, double mounts). */
const inflightWorkspaceListByAccessToken = new Map<
  string,
  Promise<AuthWorkspaceLoginItem[]>
>();

async function loadWorkspacesFromApi(
  accessToken: string,
  signal?: AbortSignal,
): Promise<AuthWorkspaceLoginItem[]> {
  const base = getApiBaseUrl();
  const res = await fetchWithAccessTokenRetry(
    `${base}/workspaces?product=postsiva`,
    accessToken,
    (t) => ({
      ...authHeaders(t),
      Accept: "application/json",
    }),
    { signal },
  );
  const data: unknown = await res.json();
  if (!Array.isArray(data)) {
    return [];
  }
  /** Preserve full API objects (same family as login workspaces). */
  return data as AuthWorkspaceLoginItem[];
}

export async function fetchWorkspacesForSession(
  accessToken: string,
  signal?: AbortSignal,
): Promise<AuthWorkspaceLoginItem[]> {
  const token = accessToken.trim();
  if (!token) {
    return [];
  }
  const inflight = inflightWorkspaceListByAccessToken.get(token);
  if (inflight) {
    return inflight;
  }
  const promise = loadWorkspacesFromApi(token, signal).finally(() => {
    inflightWorkspaceListByAccessToken.delete(token);
  });
  inflightWorkspaceListByAccessToken.set(token, promise);
  return promise;
}

export interface SignupInput {
  email: string;
  password: string;
  fullName: string;
  workspaceName?: string;
  referralCode?: string;
  /** Public locale (en|bs) — seeds default workspace locale */
  locale?: string;
}

export async function signupAccount(input: SignupInput): Promise<SignupSuccessPayload> {
  const base = getApiBaseUrl();
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  const url = new URL(`${base}/auth/signup`);
  if (origin) {
    url.searchParams.set("origin", origin);
  }
  const workspace_name = input.workspaceName?.trim() || undefined;
  const referral_code = input.referralCode?.trim() || undefined;
  const locale = input.locale?.trim() || undefined;
  const body = {
    email: input.email.trim(),
    username: usernameFromEmail(input.email),
    full_name: input.fullName.trim(),
    password: input.password,
    ...(workspace_name ? { workspace_name } : {}),
    ...(referral_code ? { referral_code } : {}),
    ...(locale ? { locale } : {}),
  };
  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(origin ? { "X-Frontend-Origin": origin } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(await readApiErrorMessage(res));
  }
  const raw: unknown = await res.json();
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid signup response");
  }
  const o = raw as Record<string, unknown>;
  const accessToken =
    typeof o.access_token === "string" ? o.access_token.trim() : "";
  if (!accessToken) {
    throw new Error("Invalid signup response: missing access_token");
  }
  const userRaw = o.user;
  if (!userRaw || typeof userRaw !== "object") {
    throw new Error("Invalid signup response: missing user");
  }
  return {
    access_token: accessToken,
    token_type: typeof o.token_type === "string" ? o.token_type : "bearer",
    user: normalizeUser(userRaw as AuthUser),
    workspaces: [],
  };
}

/** POST /social-login/complete-profile — finish a social signup that had no email. */
export async function completeSocialProfile(input: {
  token: string;
  email: string;
  password: string;
}): Promise<SignupSuccessPayload> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/social-login/complete-profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: input.token,
      email: input.email.trim(),
      password: input.password,
    }),
  });
  if (!res.ok) {
    throw new Error(await readApiErrorMessage(res));
  }
  const raw: unknown = await res.json();
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const accessToken =
    typeof o.access_token === "string" ? o.access_token.trim() : "";
  if (!accessToken) {
    throw new Error("Invalid response: missing access_token");
  }
  const userRaw = o.user;
  if (!userRaw || typeof userRaw !== "object") {
    throw new Error("Invalid response: missing user");
  }
  return {
    access_token: accessToken,
    token_type: typeof o.token_type === "string" ? o.token_type : "bearer",
    user: normalizeUser(userRaw as AuthUser),
    workspaces: [],
  };
}

export async function requestPasswordReset(email: string): Promise<{
  message: string;
}> {
  const base = getApiBaseUrl();
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  const url = new URL(`${base}/auth/forgot-password`);
  if (origin) {
    url.searchParams.set("origin", origin);
  }
  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(origin ? { "X-Frontend-Origin": origin } : {}),
    },
    body: JSON.stringify({ email: email.trim() }),
  });
  if (!res.ok) {
    throw new Error(await readApiErrorMessage(res));
  }
  return (await res.json()) as { message: string };
}

export async function verifyPasswordResetToken(
  token: string,
  signal?: AbortSignal,
): Promise<boolean> {
  const base = getApiBaseUrl();
  const res = await fetch(
    `${base}/auth/verify-reset-token?token=${encodeURIComponent(token)}`,
    { signal },
  );
  if (!res.ok) {
    return false;
  }
  const data = (await res.json()) as { valid?: boolean };
  return data.valid === true;
}

export async function resetPasswordWithToken(
  token: string,
  newPassword: string,
): Promise<{ message: string }> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, new_password: newPassword }),
  });
  if (!res.ok) {
    throw new Error(await readApiErrorMessage(res));
  }
  return (await res.json()) as { message: string };
}

/** POST /auth/verify-otp — verify 6-digit email code. */
export async function verifyOtp(
  accessToken: string,
  otp: string,
): Promise<{ message: string; user: AuthUser }> {
  const base = getApiBaseUrl();
  const res = await fetchWithAccessTokenRetry(
    `${base}/auth/verify-otp`,
    accessToken,
    (t) => ({
      ...authHeaders(t),
      Accept: "application/json",
      "Content-Type": "application/json",
    }),
    { method: "POST", body: JSON.stringify({ otp: otp.trim() }) },
  );
  const data = (await res.json()) as { message?: string; user?: AuthUser };
  if (!data.user) {
    throw new Error("Invalid verify-otp response");
  }
  return {
    message: data.message ?? "Email verified.",
    user: normalizeUser(data.user),
  };
}

/** POST /auth/resend-otp */
export async function resendOtp(accessToken: string): Promise<{ message: string }> {
  const base = getApiBaseUrl();
  const res = await fetchWithAccessTokenRetry(
    `${base}/auth/resend-otp`,
    accessToken,
    (t) => ({
      ...authHeaders(t),
      Accept: "application/json",
      "Content-Type": "application/json",
    }),
    { method: "POST", body: JSON.stringify({}) },
  );
  return (await res.json()) as { message: string };
}

/** POST /auth/setup-password — mandatory onboarding password. */
export async function setupPassword(
  accessToken: string,
  password: string,
  confirmPassword: string,
): Promise<{ message: string; user: AuthUser }> {
  const base = getApiBaseUrl();
  const res = await fetchWithAccessTokenRetry(
    `${base}/auth/setup-password`,
    accessToken,
    (t) => ({
      ...authHeaders(t),
      Accept: "application/json",
      "Content-Type": "application/json",
    }),
    {
      method: "POST",
      body: JSON.stringify({
        password,
        confirm_password: confirmPassword,
      }),
    },
  );
  const data = (await res.json()) as { message?: string; user?: AuthUser };
  if (!data.user) {
    throw new Error("Invalid setup-password response");
  }
  return {
    message: data.message ?? "Password saved.",
    user: normalizeUser(data.user),
  };
}

/** @deprecated Link verification removed — use verifyOtp */
export async function verifyEmailWithToken(
  token: string,
  signal?: AbortSignal,
): Promise<{ message: string }> {
  const base = getApiBaseUrl();
  const res = await fetch(
    `${base}/auth/verify-email?token=${encodeURIComponent(token)}`,
    { signal },
  );
  if (!res.ok) {
    throw new Error(await readApiErrorMessage(res));
  }
  return (await res.json()) as { message: string };
}
