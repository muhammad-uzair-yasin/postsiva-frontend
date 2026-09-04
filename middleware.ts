import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getApexRedirectUrl } from "@/lib/seo/apexRedirect";

export function middleware(request: NextRequest): NextResponse {
  const redirectUrl = getApexRedirectUrl(request);
  if (redirectUrl) {
    return NextResponse.redirect(redirectUrl, 301);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest)$).*)",
  ],
};
