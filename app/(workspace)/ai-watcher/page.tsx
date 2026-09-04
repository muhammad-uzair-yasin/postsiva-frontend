import type { Metadata } from "next";
import dynamic from "next/dynamic";
import type { ReactElement } from "react";

import { FeatureGatedPage } from "@/components/billing/FeatureGatedPage";
import { WorkspaceRouteSkeleton } from "@/components/workspace/WorkspaceRouteSkeleton";

export const metadata: Metadata = {
  title: "AI Watcher | Postsiva",
  description: "Posts with AI comment replier enabled.",
};

const AiWatcherScreen = dynamic(
  () =>
    import("./_components/AiWatcherScreen").then((m) => ({
      default: m.AiWatcherScreen,
    })),
  {
    loading: () => <WorkspaceRouteSkeleton label="Loading AI Watcher…" />,
  },
);

export default function AiWatcherPage(): ReactElement {
  return (
    <FeatureGatedPage feature="ai_watcher_enabled">
      <AiWatcherScreen />
    </FeatureGatedPage>
  );
}
