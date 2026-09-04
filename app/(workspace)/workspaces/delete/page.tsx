import type { Metadata } from "next";
import { DeleteWorkspaceScreen } from "./_components/DeleteWorkspaceScreen";

export const metadata: Metadata = {
  title: "Delete Workspace | Postsiva",
  description: "Confirm workspace deletion.",
};

interface DeleteWorkspacePageProps {
  searchParams?: {
    workspaceId?: string;
  };
}

export default function DeleteWorkspacePage({
  searchParams,
}: DeleteWorkspacePageProps): React.ReactElement {
  const initialWorkspaceId =
    typeof searchParams?.workspaceId === "string"
      ? searchParams.workspaceId
      : "";
  return <DeleteWorkspaceScreen initialWorkspaceId={initialWorkspaceId} />;
}
