import type { Metadata } from "next";
import { Suspense } from "react";

import { TiktokOAuthCompleteScreen } from "./_components/TiktokOAuthCompleteScreen";

export const metadata: Metadata = {
  title: "TikTok sign-in | Postsiva",
  robots: "noindex, nofollow",
};

function TiktokOAuthFallback(): React.ReactElement {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface text-on-surface">
      <p className="text-on-surface-variant">Loading…</p>
    </div>
  );
}

export default function TiktokOAuthCompletePage(): React.ReactElement {
  return (
    <Suspense fallback={<TiktokOAuthFallback />}>
      <TiktokOAuthCompleteScreen />
    </Suspense>
  );
}
