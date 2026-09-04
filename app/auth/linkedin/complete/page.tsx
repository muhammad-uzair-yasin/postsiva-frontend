import type { Metadata } from "next";
import { Suspense } from "react";

import { LinkedInOAuthCompleteScreen } from "./_components/LinkedInOAuthCompleteScreen";

export const metadata: Metadata = {
  title: "LinkedIn sign-in | Postsiva",
  robots: "noindex, nofollow",
};

function LinkedInOAuthFallback(): React.ReactElement {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface text-on-surface">
      <p className="text-on-surface-variant">Loading…</p>
    </div>
  );
}

export default function LinkedInOAuthCompletePage(): React.ReactElement {
  return (
    <Suspense fallback={<LinkedInOAuthFallback />}>
      <LinkedInOAuthCompleteScreen />
    </Suspense>
  );
}
