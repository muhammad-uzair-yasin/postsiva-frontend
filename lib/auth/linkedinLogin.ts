import { getApiBaseUrl } from "@/lib/api/config";

export const LINKEDIN_OAUTH_CALLBACK_PATH = "/auth/linkedin/complete";

export function getLinkedInLoginUrl(): string {
  const base = getApiBaseUrl();
  const appOrigin =
    (typeof window !== "undefined" ? window.location.origin : "") ||
    (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
  const params = new URLSearchParams();
  params.set("redirect_uri", LINKEDIN_OAUTH_CALLBACK_PATH);
  if (appOrigin) {
    params.set("origin", appOrigin);
  }
  return `${base}/linkedin/login?${params.toString()}`;
}
