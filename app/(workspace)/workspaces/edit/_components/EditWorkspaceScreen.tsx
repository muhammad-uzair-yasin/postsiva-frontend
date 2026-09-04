"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { getStoredActiveWorkspaceId } from "@/lib/auth/session";
import { workspaceStitchChannelsFromWorkspace } from "@/lib/workspaces/dashboardConnectedChannels";

import { WorkspacePageDocumentHead } from "../../../_components/WorkspacePageDocumentHead";
import { useStoredWorkspaces } from "../../_hooks/useStoredWorkspaces";
import { EditWorkspaceBackdrop } from "./EditWorkspaceBackdrop";
import { EditWorkspaceModal } from "./EditWorkspaceModal";

export function EditWorkspaceScreen(): React.ReactElement {
  const searchParams = useSearchParams();
  const { workspaces, isReady } = useStoredWorkspaces();

  const workspace = useMemo(() => {
    if (!isReady) {
      return null;
    }
    const q = searchParams.get("id")?.trim();
    const resolvedId =
      q && q.length > 0 ? q : getStoredActiveWorkspaceId() ?? null;
    if (!resolvedId) {
      return null;
    }
    return workspaces.find((w) => w.id === resolvedId) ?? null;
  }, [isReady, searchParams, workspaces]);

  const channels = workspace
    ? workspaceStitchChannelsFromWorkspace(workspace)
    : [];

  return (
    <div className="bg-surface font-body text-on-surface relative min-h-screen">
      <WorkspacePageDocumentHead
        titleKey="workspaces.editMetaTitle"
        descriptionKey="workspaces.editMetaDescription"
      />
      <EditWorkspaceBackdrop />
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-dim/80 p-4 backdrop-blur-md">
        <EditWorkspaceModal
          workspace={workspace}
          channels={channels}
          isReady={isReady}
        />
      </div>
    </div>
  );
}
