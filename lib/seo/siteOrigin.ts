import { getSiteUrl } from "@/lib/site/getSiteUrl";

export const APEX_HOST = "postsiva.com";
export const WWW_HOST = "www.postsiva.com";

/** Canonical public origin (no trailing slash). */
export function getCanonicalOrigin(): string {
  return getSiteUrl();
}

/** Absolute canonical URL for a site path (`/` for home). */
export function buildCanonicalUrl(path: string): string {
  const origin = getCanonicalOrigin();
  if (!path || path === "/") {
    return `${origin}/`;
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${normalized}`;
}
