import { NextResponse } from "next/server";

import { getReleaseId } from "@/lib/deployment/releaseMetadata";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    {
      status: "healthy",
      service: "postsiva-frontend",
      release: getReleaseId(),
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
