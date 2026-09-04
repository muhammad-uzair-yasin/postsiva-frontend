"use client";

import { useMemo } from "react";
import type { ReactElement } from "react";

import { getStoredActiveWorkspaceId } from "@/lib/auth/session";
import { useStoredAuthUser } from "@/app/(workspace)/_hooks/useStoredAuthUser";

import { useStoredWorkspaces } from "../../workspaces/_hooks/useStoredWorkspaces";
import { isWorkspaceOwner } from "../_hooks/useWorkspaceOwnerAcl";
import { WorkspaceMembersPageContent } from "./WorkspaceMembersPageContent";

export function WorkspaceMembersSettingsClient(): ReactElement {
  const { workspaces, isReady } = useStoredWorkspaces();
  const { user } = useStoredAuthUser();

  const workspace = useMemo(() => {
    const id = getStoredActiveWorkspaceId();
    if (!id) return null;
    return workspaces.find((w) => w.id === id) ?? null;
  }, [workspaces]);

  const isOwner = isWorkspaceOwner(workspace, user?.id);

  return (
    <WorkspaceMembersPageContent workspace={workspace} isReady={isReady} isOwner={isOwner} />
  );
}
