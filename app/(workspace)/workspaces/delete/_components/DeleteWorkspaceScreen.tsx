import { DeleteWorkspaceBlurredMain } from "./DeleteWorkspaceBlurredMain";
import { DeleteWorkspaceDialog } from "./DeleteWorkspaceDialog";
import { DeleteWorkspaceTopChrome } from "./DeleteWorkspaceTopChrome";
import { WorkspacePageDocumentHead } from "../../../_components/WorkspacePageDocumentHead";

interface DeleteWorkspaceScreenProps {
  initialWorkspaceId: string;
}

export function DeleteWorkspaceScreen({
  initialWorkspaceId,
}: DeleteWorkspaceScreenProps): React.ReactElement {
  return (
    <div className="bg-surface font-body text-on-surface selection:bg-primary-container/30 min-h-screen relative">
      <WorkspacePageDocumentHead
        titleKey="workspaces.deleteMetaTitle"
        descriptionKey="workspaces.deleteMetaDescription"
      />
      <DeleteWorkspaceTopChrome />
      <DeleteWorkspaceBlurredMain />
      <DeleteWorkspaceDialog initialWorkspaceId={initialWorkspaceId} />
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-primary-container/10 blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-secondary-container/5 blur-[100px]" />
      </div>
    </div>
  );
}
