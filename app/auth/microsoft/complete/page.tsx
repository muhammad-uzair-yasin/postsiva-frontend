import type { Metadata } from "next";
import { Suspense } from "react";

import { MicrosoftOAuthCompleteScreen } from "./_components/MicrosoftOAuthCompleteScreen";

export const metadata: Metadata = {
  title: "Microsoft sign-in | Postsiva",
  robots: "noindex, nofollow",
};

function MicrosoftOAuthFallback(): React.ReactElement {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface text-on-surface">
      <p className="text-on-surface-variant">Loading…</p>
    </div>
  );
}

export default function MicrosoftOAuthCompletePage(): React.ReactElement {
  return (
    <Suspense fallback={<MicrosoftOAuthFallback />}>
      <MicrosoftOAuthCompleteScreen />
    </Suspense>
  );
}
