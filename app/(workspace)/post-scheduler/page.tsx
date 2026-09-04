import type { Metadata } from "next";
import dynamic from "next/dynamic";
import type { ReactElement } from "react";

import { WorkspaceRouteSkeleton } from "@/components/workspace/WorkspaceRouteSkeleton";
import { PostSchedulerPublishingGate } from "./_components/PostSchedulerFeatureGates";

export const metadata: Metadata = {
  title: "Post Scheduler | Postsiva",
  description: "Multi-channel composer with AI assistant.",
};

const PostSchedulerScreen = dynamic(
  () =>
    import("./_components/PostSchedulerScreen").then((m) => ({
      default: m.PostSchedulerScreen,
    })),
  {
    loading: () => <WorkspaceRouteSkeleton label="Loading composer…" variant="form" />,
  },
);

export default function PostSchedulerPage(): ReactElement {
  return (
    <PostSchedulerPublishingGate>
      <PostSchedulerScreen />
    </PostSchedulerPublishingGate>
  );
}
