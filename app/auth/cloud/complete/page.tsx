import type { Metadata } from "next";
import { Suspense } from "react";

import { CloudConnectCompleteScreen } from "./_components/CloudConnectCompleteScreen";

export const metadata: Metadata = {
  title: "Cloud storage | Postsiva",
  robots: "noindex, nofollow",
};

function CloudConnectFallback(): React.ReactElement {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface text-on-surface">
      <p className="text-on-surface-variant">Finishing up…</p>
    </div>
  );
}

export default function CloudConnectCompletePage(): React.ReactElement {
  return (
    <Suspense fallback={<CloudConnectFallback />}>
      <CloudConnectCompleteScreen />
    </Suspense>
  );
}
