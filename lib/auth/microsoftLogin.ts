import { getApiBaseUrl } from "@/lib/api/config";

/** Must match the Next.js route that handles the backend redirect. */
export const MICROSOFT_OAUTH_CALLBACK_PATH = "/auth/microsoft/complete";

export function getMicrosoftLoginUrl(): string {
  const base = getApiBaseUrl();
  const appOrigin =
    (typeof window !== "undefined" ? window.location.origin : "") ||
    (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
  const params = new URLSearchParams();
  params.set("redirect_uri", MICROSOFT_OAUTH_CALLBACK_PATH);
  if (appOrigin) {
    params.set("origin", appOrigin);
  }
  return `${base}/microsoft/login?${params.toString()}`;
}
