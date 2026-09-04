import type { Metadata } from "next";
import type { ReactElement } from "react";

import { PostSchedulerSchedulingGate } from "../_components/PostSchedulerFeatureGates";
import { PostSchedulerPipelineScreen } from "./_components/PostSchedulerPipelineScreen";

export const metadata: Metadata = {
  title: "Content pipeline | Postsiva",
  description: "Track posts from idea through draft, review, and schedule.",
};

export default function PostSchedulerPipelinePage(): ReactElement {
  return (
    <PostSchedulerSchedulingGate>
      <PostSchedulerPipelineScreen />
    </PostSchedulerSchedulingGate>
  );
}
