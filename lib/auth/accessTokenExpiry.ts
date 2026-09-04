function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.trim().split(".");
  if (parts.length !== 3) {
    return null;
  }
  const segment = parts[1];
  if (!segment) {
    return null;
  }
  try {
    const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const json = atob(padded);
    const parsed: unknown = JSON.parse(json);
    return parsed && typeof parsed === "object"
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

/** JWT `exp` claim in milliseconds since epoch, or null if missing/unparseable. */
export function getAccessTokenExpiryMs(accessToken: string): number | null {
  const payload = decodeJwtPayload(accessToken);
  const exp = payload?.exp;
  if (typeof exp !== "number" || !Number.isFinite(exp)) {
    return null;
  }
  return exp * 1000;
}

/** True when the access token’s `exp` is in the past (optional clock skew). */
export function isAccessTokenExpired(
  accessToken: string,
  skewMs = 0,
): boolean {
  const expMs = getAccessTokenExpiryMs(accessToken);
  if (expMs == null) {
    return false;
  }
  return Date.now() >= expMs - skewMs;
}
