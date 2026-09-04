import { Suspense } from "react";

import { SystemPromptsScreen } from "./_components/SystemPromptsScreen";

export default function AdminSystemPromptsPage() {
  return (
    <Suspense fallback={null}>
      <SystemPromptsScreen />
    </Suspense>
  );
}
