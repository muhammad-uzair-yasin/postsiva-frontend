import type { NextRequest } from "next/server";

import { APEX_HOST, WWW_HOST } from "@/lib/seo/siteOrigin";

function normalizeHost(host: string | null): string | null {
  if (!host) return null;
  return host.split(":")[0]?.toLowerCase() ?? null;
}

/** Pure helper for unit tests and middleware. */
export function buildApexRedirectUrl(
  host: string | null,
  pathname: string,
  search = "",
): URL | null {
  const normalized = normalizeHost(host);
  if (normalized !== APEX_HOST) {
    return null;
  }
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return new URL(`https://${WWW_HOST}${path}${search}`);
}

export function getApexRedirectUrl(request: NextRequest): URL | null {
  return buildApexRedirectUrl(
    request.headers.get("host"),
    request.nextUrl.pathname,
    request.nextUrl.search,
  );
}
