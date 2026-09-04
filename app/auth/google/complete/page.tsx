import type { Metadata } from "next";
import { Suspense } from "react";

import { GoogleOAuthCompleteScreen } from "./_components/GoogleOAuthCompleteScreen";

export const metadata: Metadata = {
  title: "Google sign-in | Postsiva",
  robots: "noindex, nofollow",
};

function GoogleOAuthFallback(): React.ReactElement {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface text-on-surface">
      <p className="text-on-surface-variant">Loading…</p>
    </div>
  );
}

export default function GoogleOAuthCompletePage(): React.ReactElement {
  return (
    <Suspense fallback={<GoogleOAuthFallback />}>
      <GoogleOAuthCompleteScreen />
    </Suspense>
  );
}
