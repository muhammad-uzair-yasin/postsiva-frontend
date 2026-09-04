import { redirect } from "next/navigation";

/** Legacy route — unified under Insights admin with Worker tab. */
export default function AdminInsightsWorkerPage() {
  redirect("/admin/insights-snapshots?tab=worker");
}
