const DEFAULT_SITE_URL = "https://www.postsiva.com";

export function getSiteUrl(): string {
  const rawSiteUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!rawSiteUrl) {
    return DEFAULT_SITE_URL;
  }

  try {
    return new URL(rawSiteUrl).toString().replace(/\/$/, "");
  } catch {
    return DEFAULT_SITE_URL;
  }
}
