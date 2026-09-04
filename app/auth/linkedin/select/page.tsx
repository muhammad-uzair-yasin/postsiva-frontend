import type { Metadata } from "next";
import { Suspense } from "react";

import { LinkedInAccountSelectScreen } from "./_components/LinkedInAccountSelectScreen";

export const metadata: Metadata = {
  title: "Select LinkedIn accounts | Postsiva",
  robots: "noindex, nofollow",
};

function LinkedInSelectFallback(): React.ReactElement {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-700">
      <p>Loading LinkedIn accounts…</p>
    </div>
  );
}

export default function LinkedInSelectPage(): React.ReactElement {
  return (
    <Suspense fallback={<LinkedInSelectFallback />}>
      <LinkedInAccountSelectScreen />
    </Suspense>
  );
}
