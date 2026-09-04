import type { Metadata } from "next";
import dynamic from "next/dynamic";
import type { ReactElement } from "react";

import { WorkspaceRouteSkeleton } from "@/components/workspace/WorkspaceRouteSkeleton";

export const metadata: Metadata = {
  title: "Dashboard | Postsiva",
  description: "Workspace dashboard.",
};

const DashboardScreen = dynamic(
  () =>
    import("./_components/DashboardScreen").then((m) => ({
      default: m.DashboardScreen,
    })),
  {
    loading: () => <WorkspaceRouteSkeleton label="Loading dashboard…" />,
  },
);

export default function DashboardPage(): ReactElement {
  return <DashboardScreen />;
}
