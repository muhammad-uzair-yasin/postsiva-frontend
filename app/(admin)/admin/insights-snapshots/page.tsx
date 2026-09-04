import { Suspense } from "react";
import { InsightsAdminScreen } from "./_components/InsightsAdminScreen";

export default function AdminInsightsSnapshotsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-on-surface-variant">Loading insights…</div>}>
      <InsightsAdminScreen />
    </Suspense>
  );
}
