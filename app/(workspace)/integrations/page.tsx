import type { Metadata } from "next";
import dynamic from "next/dynamic";
import type { ReactElement } from "react";

import { WorkspaceRouteSkeleton } from "@/components/workspace/WorkspaceRouteSkeleton";

export const metadata: Metadata = {
  title: "Integrations | Postsiva",
  description: "Workspace messaging and automation integrations.",
};

const IntegrationsScreen = dynamic(
  () =>
    import("./_components/IntegrationsScreen").then((m) => ({
      default: m.IntegrationsScreen,
    })),
  {
    loading: () => (
      <WorkspaceRouteSkeleton label="Loading integrations…" />
    ),
  },
);

export default function IntegrationsPage(): ReactElement {
  return <IntegrationsScreen />;
}
