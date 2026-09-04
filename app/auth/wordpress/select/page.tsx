import type { Metadata } from "next";
import { Suspense } from "react";

import { WordPressSiteSelectScreen } from "./_components/WordPressSiteSelectScreen";

export const metadata: Metadata = {
  title: "Choose WordPress sites | Postsiva",
  robots: "noindex, nofollow",
};

function WordPressSelectFallback(): React.ReactElement {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface text-on-surface">
      <p className="text-on-surface-variant">Loading your sites…</p>
    </div>
  );
}

export default function WordPressSelectPage(): React.ReactElement {
  return (
    <Suspense fallback={<WordPressSelectFallback />}>
      <WordPressSiteSelectScreen />
    </Suspense>
  );
}
