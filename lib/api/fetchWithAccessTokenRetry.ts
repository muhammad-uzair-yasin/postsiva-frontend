import { parseApiErrorBody } from "@/lib/api/parseApiError";
import { formatUserFacingApiError } from "@/lib/api/formatUserFacingApiError";
import { parseBillingPlanError } from "@/lib/billing/billingErrors";
import { isAccessTokenExpired } from "@/lib/auth/accessTokenExpiry";
import { redirectToLoginAfterFailedSession } from "@/lib/auth/session";
import { shouldRedirectToLogin } from "@/lib/auth/sessionFailure";

/**
 * Same JWT / status checks as mobileApp (unifiedCommentsApi, unifiedPostingApi, etc.).
 */
/**
 * Authenticated fetch. On expired JWT (401/510), clears session and redirects to login.
 * Password-setup 403 responses are returned to the caller.
 */
export async function fetchWithAccessTokenRetry(
  url: string,
  initialAccessToken: string,
  buildHeaders: (accessToken: string) => HeadersInit,
  init: RequestInit = {},
): Promise<Response> {
  const token = initialAccessToken.trim();
  if (typeof window !== "undefined" && token && isAccessTokenExpired(token)) {
    redirectToLoginAfterFailedSession(initialAccessToken);
  }

  const merged = new Headers(init.headers ?? undefined);
  const auth = new Headers(buildHeaders(initialAccessToken));
  auth.forEach((value, key) => merged.set(key, value));

  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: merged,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Network error";
    if (typeof window !== "undefined" && token && isAccessTokenExpired(token)) {
      redirectToLoginAfterFailedSession(initialAccessToken);
    }
    throw new Error(formatUserFacingApiError(msg));
  }

  if (res.ok) {
    return res;
  }

  const parsed: unknown = await res.json().catch(() => null);
  const billingError = parseBillingPlanError(res.status, parsed);
  if (billingError) {
    throw billingError;
  }
  const lastError = parseApiErrorBody(parsed);

  const errorCode =
    parsed && typeof parsed === "object" && "code" in parsed
      ? String((parsed as { code?: unknown }).code ?? "")
      : null;
  if (shouldRedirectToLogin(res.status, errorCode)) {
    redirectToLoginAfterFailedSession(initialAccessToken);
  }
  if (
    res.status === 403 &&
    errorCode?.toUpperCase() === "EMAIL_VERIFICATION_REQUIRED" &&
    typeof window !== "undefined" &&
    !window.location.pathname.startsWith("/verify-otp")
  ) {
    window.location.assign("/verify-otp");
  }

  throw new Error(formatUserFacingApiError(lastError));
}
