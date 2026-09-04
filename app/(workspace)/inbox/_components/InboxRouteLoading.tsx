import type { ReactElement } from "react";

import { WorkspaceRouteSkeleton } from "@/components/workspace/WorkspaceRouteSkeleton";

export function InboxRouteLoading(): ReactElement {
  return (
    <WorkspaceRouteSkeleton label="Loading inbox…" variant="feed" />
  );
}
