import type { Metadata } from "next";
import { Suspense } from "react";

import { CanvaReturnCompleteScreen } from "./_components/CanvaReturnCompleteScreen";

export const metadata: Metadata = {
  title: "Canva | Postsiva",
  robots: "noindex, nofollow",
};

function CanvaReturnFallback(): React.ReactElement {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface text-on-surface">
      <p className="text-on-surface-variant">Finishing up…</p>
    </div>
  );
}

export default function CanvaReturnCompletePage(): React.ReactElement {
  return (
    <Suspense fallback={<CanvaReturnFallback />}>
      <CanvaReturnCompleteScreen />
    </Suspense>
  );
}
