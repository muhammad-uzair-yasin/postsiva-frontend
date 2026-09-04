import type { Metadata } from "next";
import { Suspense } from "react";

import { FacebookOAuthCompleteScreen } from "./_components/FacebookOAuthCompleteScreen";

export const metadata: Metadata = {
  title: "Facebook sign-in | Postsiva",
  robots: "noindex, nofollow",
};

function FacebookOAuthFallback(): React.ReactElement {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface text-on-surface">
      <p className="text-on-surface-variant">Loading…</p>
    </div>
  );
}

export default function FacebookOAuthCompletePage(): React.ReactElement {
  return (
    <Suspense fallback={<FacebookOAuthFallback />}>
      <FacebookOAuthCompleteScreen />
    </Suspense>
  );
}
