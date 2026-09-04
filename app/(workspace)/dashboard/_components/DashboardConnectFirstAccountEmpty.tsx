"use client";

import type { ReactElement } from "react";

import { ConnectFirstAccountPrompt } from "../../_components/ConnectFirstAccountPrompt";
import { useWorkspacePlatformsModal } from "../../_components/WorkspacePlatformsModalProvider";

export function DashboardConnectFirstAccountEmpty(): ReactElement {
  const { openPlatforms } = useWorkspacePlatformsModal();

  return <ConnectFirstAccountPrompt variant="hero" onConnect={openPlatforms} />;
}
