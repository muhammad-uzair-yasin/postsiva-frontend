import type { Metadata } from "next";
import dynamic from "next/dynamic";
import type { ReactElement } from "react";

import { WorkspaceRouteSkeleton } from "@/components/workspace/WorkspaceRouteSkeleton";

export const metadata: Metadata = {
  title: "Library | Postsiva",
  description: "Workspace media library — images and videos.",
};

const LibraryScreen = dynamic(
  () =>
    import("./_components/LibraryScreen").then((m) => ({
      default: m.LibraryScreen,
    })),
  {
    loading: () => <WorkspaceRouteSkeleton label="Loading library…" />,
  },
);

export default function LibraryPage(): ReactElement {
  return <LibraryScreen />;
}
