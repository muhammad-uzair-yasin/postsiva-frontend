import type { Metadata } from "next";
import dynamic from "next/dynamic";
import type { ReactElement } from "react";

import { WorkspaceRouteSkeleton } from "@/components/workspace/WorkspaceRouteSkeleton";
import { PostSchedulerSchedulingGate } from "../_components/PostSchedulerFeatureGates";

export const metadata: Metadata = {
  title: "Content Calendar | Postsiva",
  description: "Week schedule for your planned posts.",
};

const PostSchedulerCalendarScreen = dynamic(
  () =>
    import("./_components/PostSchedulerCalendarScreen").then((m) => ({
      default: m.PostSchedulerCalendarScreen,
    })),
  {
    loading: () => (
      <WorkspaceRouteSkeleton label="Loading calendar…" variant="calendar" />
    ),
  },
);

export default function PostSchedulerCalendarPage(): ReactElement {
  return (
    <PostSchedulerSchedulingGate>
      <PostSchedulerCalendarScreen />
    </PostSchedulerSchedulingGate>
  );
}
