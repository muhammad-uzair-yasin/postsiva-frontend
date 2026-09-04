import type { Metadata } from "next";
import dynamic from "next/dynamic";

import { WorkspaceRouteSkeleton } from "@/components/workspace/WorkspaceRouteSkeleton";

export const metadata: Metadata = {
  title: "Workspace Selection | Postsiva",
  description: "Choose a workspace to continue.",
};

const WorkspacesPageGate = dynamic(
  () =>
    import("./_components/WorkspacesPageGate").then((m) => ({
      default: m.WorkspacesPageGate,
    })),
  {
    loading: () => (
      <WorkspaceRouteSkeleton label="Loading workspaces…" variant="feed" />
    ),
  },
);

export default function WorkspacesPage(): React.ReactElement {
  return <WorkspacesPageGate />;
}
