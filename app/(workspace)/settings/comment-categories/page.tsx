import type { Metadata } from "next";
import dynamic from "next/dynamic";
import type { ReactElement } from "react";

import { SettingsRouteSkeleton } from "../_components/SettingsRouteSkeleton";

export const metadata: Metadata = {
  title: "Comment Categories | Settings | Postsiva",
};

const WorkspaceCommentCategoriesClient = dynamic(
  () =>
    import("../_components/WorkspaceCommentCategoriesClient").then((m) => ({
      default: m.WorkspaceCommentCategoriesClient,
    })),
  { loading: () => <SettingsRouteSkeleton /> },
);

export default function SettingsCommentCategoriesPage(): ReactElement {
  return <WorkspaceCommentCategoriesClient />;
}
