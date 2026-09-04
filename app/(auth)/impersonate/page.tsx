import type { Metadata } from "next";
import { Suspense } from "react";

import { ImpersonateScreen } from "./_components/ImpersonateScreen";

export const metadata: Metadata = {
  title: "Support login | Postsiva",
  description: "Complete admin support login handoff.",
};

export default function ImpersonatePage(): React.ReactElement {
  return (
    <Suspense fallback={null}>
      <ImpersonateScreen />
    </Suspense>
  );
}
