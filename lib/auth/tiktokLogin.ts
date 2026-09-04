import { getApiBaseUrl } from "@/lib/api/config";

/** Must match the Next.js route that handles the backend redirect. */
export const TIKTOK_OAUTH_CALLBACK_PATH = "/auth/tiktok/complete";

export function getTiktokLoginUrl(): string {
  const base = getApiBaseUrl();
  const appOrigin =
    (typeof window !== "undefined" ? window.location.origin : "") ||
    (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
  const params = new URLSearchParams();
  params.set("redirect_uri", TIKTOK_OAUTH_CALLBACK_PATH);
  if (appOrigin) {
    params.set("origin", appOrigin);
  }
  return `${base}/tiktok/login?${params.toString()}`;
}
