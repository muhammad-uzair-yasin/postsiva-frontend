import type { Metadata } from "next";
import dynamic from "next/dynamic";
import type { ReactElement } from "react";
import { Suspense } from "react";

import { WorkspaceRouteSkeleton } from "@/components/workspace/WorkspaceRouteSkeleton";

export const metadata: Metadata = {
  title: "Explore | Postsiva",
  description: "Browse news, RSS feeds, and trending posts.",
};

const NewsScreen = dynamic(
  () =>
    import("./_components/NewsScreen").then((m) => ({
      default: m.NewsScreen,
    })),
  {
    loading: () => <WorkspaceRouteSkeleton label="Loading explore…" />,
  },
);

export default function NewsPage(): ReactElement {
  return (
    <Suspense fallback={<WorkspaceRouteSkeleton label="Loading explore…" />}>
      <NewsScreen />
    </Suspense>
  );
}
