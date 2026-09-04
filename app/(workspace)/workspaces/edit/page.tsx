import type { Metadata } from "next";
import { Suspense } from "react";

import { EditWorkspaceLoading } from "./_components/EditWorkspaceLoading";
import { EditWorkspaceScreen } from "./_components/EditWorkspaceScreen";

export const metadata: Metadata = {
  title: "Edit Workspace Settings | Postsiva",
  description: "Update workspace identity and access.",
};

export default function EditWorkspacePage(): React.ReactElement {
  return (
    <Suspense fallback={<EditWorkspaceLoading />}>
      <EditWorkspaceScreen />
    </Suspense>
  );
}
