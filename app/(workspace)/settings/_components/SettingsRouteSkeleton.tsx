import type { ReactElement } from "react";

import { WorkspaceRouteSkeleton } from "@/components/workspace/WorkspaceRouteSkeleton";

/** Settings section chrome while *Client chunk loads. */
export function SettingsRouteSkeleton(): ReactElement {
  return <WorkspaceRouteSkeleton label="Loading settings…" variant="form" />;
}
