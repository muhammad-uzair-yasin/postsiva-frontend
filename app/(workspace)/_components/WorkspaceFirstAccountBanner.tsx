"use client";

import { useWorkspacePlatformsModal } from "./WorkspacePlatformsModalProvider";
import { ConnectFirstAccountPrompt } from "./ConnectFirstAccountPrompt";

export function WorkspaceFirstAccountBanner(): React.ReactElement {
  const { openPlatforms } = useWorkspacePlatformsModal();

  return (
    <div className="relative z-40 px-3 pb-4 pt-1 sm:px-6">
      <div className="mx-auto w-full max-w-6xl">
        <ConnectFirstAccountPrompt variant="banner" onConnect={openPlatforms} />
      </div>
    </div>
  );
}
