"use client";

import { useEffect, useState } from "react";

import { useStoredAuthUser } from "@/app/(workspace)/_hooks/useStoredAuthUser";
import type { AuthWorkspaceLoginItem } from "@/lib/auth/types";
import { userIdsEqual } from "@/lib/auth/userIdsEqual";
import { getStoredAccessToken, patchStoredWorkspace } from "@/lib/auth/session";
import { getWorkspaceById } from "@/lib/workspaces/workspaceApi";
import type { WorkspaceCardChannelRow } from "@/lib/workspaces/dashboardConnectedChannels";

import { useEditWorkspaceGeneralSave } from "../_hooks/useEditWorkspaceGeneralSave";

import { EditWorkspaceChannelsSection } from "./EditWorkspaceChannelsSection";
import { EditWorkspaceGeneralSection } from "./EditWorkspaceGeneralSection";
import { EditWorkspaceModalFooter } from "./EditWorkspaceModalFooter";
import { EditWorkspaceModalHeader } from "./EditWorkspaceModalHeader";
import { EditWorkspaceTeamSection } from "./EditWorkspaceTeamSection";

interface EditWorkspaceModalProps {
  workspace: AuthWorkspaceLoginItem | null;
  channels: WorkspaceCardChannelRow[];
  isReady: boolean;
}

export function EditWorkspaceModal({
  workspace,
  channels,
  isReady,
}: EditWorkspaceModalProps): React.ReactElement {
  const { user } = useStoredAuthUser();
  /** Canonical owner_id from GET /workspaces/:id (cache can omit or mismatch owner_id). */
  const [fetchedOwnerId, setFetchedOwnerId] = useState<string | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!workspace?.id) {
      setFetchedOwnerId(undefined);
      return;
    }
    const token = getStoredAccessToken()?.trim();
    if (!token) {
      setFetchedOwnerId(undefined);
      return;
    }
    let cancelled = false;
    void getWorkspaceById(token, workspace.id)
      .then((w) => {
        if (!cancelled) {
          setFetchedOwnerId(w.owner_id);
          patchStoredWorkspace(workspace.id, { owner_id: w.owner_id });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFetchedOwnerId(undefined);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [workspace?.id]);

  const ownerIdForAcl = fetchedOwnerId ?? workspace?.owner_id ?? "";
  const isOwner = Boolean(
    user && ownerIdForAcl && userIdsEqual(user.id, ownerIdForAcl),
  );

  const { saveBusy, saveError, onSubmit } = useEditWorkspaceGeneralSave(
    workspace,
    isOwner,
  );

  return (
    <div className="glass-panel flex max-h-[921px] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-outline-variant/10 shadow-[0_20px_40px_rgba(107,73,216,0.15)]">
      <form
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
        onSubmit={(ev) => {
          void onSubmit(ev);
        }}
      >
        <EditWorkspaceModalHeader workspaceName={workspace?.name} />
        <div className="workspace-modal-scrollbar flex-1 space-y-10 overflow-y-auto px-8 py-6">
          <EditWorkspaceGeneralSection
            key={
              workspace
                ? `${workspace.id}-${workspace.updated_at}`
                : "no-workspace"
            }
            workspace={workspace}
            isReady={isReady}
            isOwner={isOwner}
          />
          <EditWorkspaceChannelsSection
            workspaceId={workspace?.id ?? null}
            channels={channels}
            isReady={isReady}
            hasWorkspace={workspace !== null}
          />
          <EditWorkspaceTeamSection
            workspace={workspace}
            isReady={isReady}
            isOwner={isOwner}
          />
        </div>
        <EditWorkspaceModalFooter
          isOwner={isOwner}
          isSaving={saveBusy}
          saveError={saveError}
          workspaceId={workspace?.id ?? null}
        />
      </form>
    </div>
  );
}
