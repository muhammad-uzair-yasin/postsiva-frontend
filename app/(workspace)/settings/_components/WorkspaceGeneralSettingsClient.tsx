"use client";

import { useMemo } from "react";
import type { ReactElement } from "react";

import { getStoredActiveWorkspaceId } from "@/lib/auth/session";
import { useStoredAuthUser } from "@/app/(workspace)/_hooks/useStoredAuthUser";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { EditWorkspaceGeneralSaveBar } from "../../workspaces/edit/_components/EditWorkspaceGeneralSaveBar";
import { EditWorkspaceGeneralSection } from "../../workspaces/edit/_components/EditWorkspaceGeneralSection";
import { useEditWorkspaceGeneralSave } from "../../workspaces/edit/_hooks/useEditWorkspaceGeneralSave";
import { useStoredWorkspaces } from "../../workspaces/_hooks/useStoredWorkspaces";
import { isWorkspaceOwner } from "../_hooks/useWorkspaceOwnerAcl";
import { SettingsSubpageChrome } from "./SettingsSubpageChrome";

export function WorkspaceGeneralSettingsClient(): ReactElement {
  const { t } = useTranslations();
  const { workspaces, isReady } = useStoredWorkspaces();
  const { user } = useStoredAuthUser();

  const workspace = useMemo(() => {
    const id = getStoredActiveWorkspaceId();
    if (!id) return null;
    return workspaces.find((w) => w.id === id) ?? null;
  }, [workspaces]);

  const isOwner = isWorkspaceOwner(workspace, user?.id);
  const { saveBusy, saveError, onSubmit } = useEditWorkspaceGeneralSave(
    workspace,
    isOwner,
  );

  return (
    <SettingsSubpageChrome titleKey="shell.settingsGeneral">
      <form
        key={workspace ? `${workspace.id}-${workspace.updated_at}` : "no-workspace"}
        className="w-full"
        onSubmit={(ev) => {
          void onSubmit(ev);
        }}
      >
        <EditWorkspaceGeneralSection workspace={workspace} isReady={isReady} isOwner={isOwner} />
        <EditWorkspaceGeneralSaveBar
          isOwner={isOwner}
          isSaving={saveBusy}
          saveError={saveError}
        />
      </form>
      {!isOwner ? (
        <p className="mt-4 text-sm text-on-surface-variant">{t("shell.settingsMembersViewOnly")}</p>
      ) : null}
    </SettingsSubpageChrome>
  );
}
