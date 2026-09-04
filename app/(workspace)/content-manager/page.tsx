import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { redirect } from "next/navigation";

import { WorkspaceRouteSkeleton } from "@/components/workspace/WorkspaceRouteSkeleton";

export const metadata: Metadata = {
  title: "Published Content | Postsiva",
  description: "Review published social content in the active workspace.",
};

const ContentManagerScreen = dynamic(
  () =>
    import("./_components/ContentManagerScreen").then((m) => ({
      default: m.ContentManagerScreen,
    })),
);

export default async function ContentManagerPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}): Promise<React.ReactElement> {
  const tab = (await searchParams).tab;
  if (tab === "scheduled") redirect("/post-scheduler/calendar");
  return (
    <Suspense fallback={<WorkspaceRouteSkeleton label="Loading content…" />}>
      <ContentManagerScreen />
    </Suspense>
  );
}
