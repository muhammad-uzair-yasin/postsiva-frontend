import { getPendingSessionExpiry } from "@/lib/auth/session";

const SESSION_EXPIRY_PATTERNS = [
  /^session expired/i,
  /^invalid or expired token/i,
  /^the request used an expired session/i,
];

export function isSessionExpiryErrorMessage(message: string | null | undefined): boolean {
  const trimmed = message?.trim();
  if (!trimmed) {
    return false;
  }
  return SESSION_EXPIRY_PATTERNS.some((re) => re.test(trimmed));
}

/** Hide inline API errors while the global session-expired modal is active. */
export function shouldSuppressInlineApiError(): boolean {
  return getPendingSessionExpiry()?.loginUrl != null;
}

export function resolveInlineApiErrorMessage(
  message: string | null | undefined,
): string | null {
  if (!message?.trim()) {
    return null;
  }
  if (shouldSuppressInlineApiError() || isSessionExpiryErrorMessage(message)) {
    return null;
  }
  return message;
}
