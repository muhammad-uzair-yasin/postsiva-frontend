import type { Metadata } from "next";
import { Suspense } from "react";

import { FinishSignupScreen } from "./_components/FinishSignupScreen";

export const metadata: Metadata = {
  title: "Finish sign-up | Postsiva",
  robots: "noindex, nofollow",
};

function FinishSignupFallback(): React.ReactElement {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface text-on-surface">
      <p className="text-on-surface-variant">Loading…</p>
    </div>
  );
}

export default function FinishSignupPage(): React.ReactElement {
  return (
    <Suspense fallback={<FinishSignupFallback />}>
      <FinishSignupScreen />
    </Suspense>
  );
}
