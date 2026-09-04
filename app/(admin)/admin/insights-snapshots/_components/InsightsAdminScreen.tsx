"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { LineChart } from "lucide-react";

import { InsightsSnapshotsScreen } from "./InsightsSnapshotsScreen";
import { InsightsWorkerScreen } from "../../insights-worker/_components/InsightsWorkerScreen";

type InsightsTab = "access" | "worker";

export function InsightsAdminScreen() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab: InsightsTab = searchParams.get("tab") === "worker" ? "worker" : "access";

  const setTab = (next: InsightsTab) => {
    router.replace(`/admin/insights-snapshots?tab=${next}`);
  };

  return (
    <div className="min-w-0 space-y-5 p-6">
      <header>
        <div className="flex items-center gap-2">
          <LineChart className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold text-on-surface">Insights</h1>
        </div>
        <p className="mt-1 text-sm text-on-surface-variant">
          Enable snapshot access per user, then manage the daily worker and audit logs.
        </p>
      </header>

      <div className="flex gap-1 rounded-xl border border-outline-variant/20 bg-surface-container-low p-1 w-fit">
        <button
          type="button"
          onClick={() => setTab("access")}
          className={[
            "rounded-lg px-4 py-2 text-sm font-semibold transition",
            tab === "access" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container",
          ].join(" ")}
        >
          User access
        </button>
        <button
          type="button"
          onClick={() => setTab("worker")}
          className={[
            "rounded-lg px-4 py-2 text-sm font-semibold transition",
            tab === "worker" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container",
          ].join(" ")}
        >
          Worker &amp; logs
        </button>
      </div>

      {tab === "access" ? <InsightsSnapshotsScreen embedded /> : <InsightsWorkerScreen embedded />}
    </div>
  );
}
