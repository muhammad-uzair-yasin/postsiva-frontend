"use client";

import { useState } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import type { AuthWorkspaceLoginItem } from "@/lib/auth/types";

import { useWorkspaceImageUpload } from "../_hooks/useWorkspaceImageUpload";
import { EditWorkspaceDescriptionField } from "./EditWorkspaceDescriptionField";
import { EditWorkspaceFormFields } from "./EditWorkspaceFormFields";
import { EditWorkspaceImageUrlControls } from "./EditWorkspaceImageUrlControls";
import { WorkspaceEditAvatarBlock } from "./WorkspaceEditAvatarBlock";

function initialLetter(name: string): string {
  const t = name.trim();
  if (!t) {
    return "?";
  }
  return t.charAt(0).toUpperCase();
}

interface EditWorkspaceGeneralSectionProps {
  workspace: AuthWorkspaceLoginItem | null;
  isReady: boolean;
  /** From parent: compares session user to canonical owner_id (GET /workspaces/:id + normalized match). */
  isOwner: boolean;
}

export function EditWorkspaceGeneralSection({
  workspace,
  isReady,
  isOwner,
}: EditWorkspaceGeneralSectionProps): React.ReactElement {
  const { t } = useTranslations();
  const [urlDraft, setUrlDraft] = useState("");

  const {
    displayUrl,
    busy,
    error,
    fileInputRef,
    onFileChange,
    applyExternalUrl,
    clearImage,
  } = useWorkspaceImageUpload(
    workspace?.id,
    isOwner,
    workspace?.image_url,
  );

  if (!isReady) {
    return (
      <section className="space-y-6">
        <p className="text-sm text-on-surface-variant">{t("workspaces.editLoading")}</p>
      </section>
    );
  }

  if (!workspace) {
    return (
      <section className="space-y-6">
        <p className="text-sm text-on-surface-variant">
          {t("workspaces.editNotFound")}
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6" key={workspace.id}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={(e) => {
          void onFileChange(e);
        }}
      />
      <div className="flex items-center gap-6">
        <WorkspaceEditAvatarBlock
          workspaceName={workspace.name}
          initialLetter={initialLetter(workspace.name)}
          imageUrl={displayUrl}
          busy={busy}
          canManage={isOwner}
          onOpenPicker={() => {
            fileInputRef.current?.click();
          }}
        />
        <EditWorkspaceFormFields workspace={workspace} isOwner={isOwner} />
      </div>
      {isOwner ? (
        <EditWorkspaceImageUrlControls
          urlDraft={urlDraft}
          onUrlDraftChange={setUrlDraft}
          busy={busy}
          hasImage={Boolean(displayUrl)}
          onApplyUrl={() => {
            void applyExternalUrl(urlDraft);
          }}
          onRemoveImage={() => {
            void clearImage();
          }}
        />
      ) : null}
      {error ? (
        <p className="text-sm text-error" role="alert">
          {error}
        </p>
      ) : null}
      <EditWorkspaceDescriptionField workspace={workspace} isOwner={isOwner} />
    </section>
  );
}
