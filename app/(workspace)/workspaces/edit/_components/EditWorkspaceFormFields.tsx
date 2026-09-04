"use client";

import type { AuthWorkspaceLoginItem } from "@/lib/auth/types";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

interface EditWorkspaceFormFieldsProps {
  workspace: AuthWorkspaceLoginItem;
  isOwner: boolean;
}

export function EditWorkspaceFormFields({
  workspace,
  isOwner,
}: EditWorkspaceFormFieldsProps): React.ReactElement {
  const { t } = useTranslations();

  return (
    <div className="flex-1 space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/70">
          {t("workspaces.editNameLabel")}
        </label>
        <input
          className="w-full rounded-lg border-none bg-surface-container-lowest px-4 py-2.5 text-on-surface transition-all placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-secondary/50 read-only:opacity-70"
          defaultValue={workspace.name}
          placeholder={t("workspaces.editNamePlaceholder")}
          type="text"
          name="workspaceName"
          readOnly={!isOwner}
          aria-readonly={!isOwner}
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/70">
          {t("workspaces.editSlugLabel")}
        </label>
        <input
          className="w-full rounded-lg border-none bg-surface-container-lowest px-4 py-2.5 text-on-surface transition-all placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-secondary/50 read-only:opacity-70"
          defaultValue={workspace.slug}
          placeholder={t("workspaces.editSlugPlaceholder")}
          name="workspaceSlug"
          type="text"
          readOnly={!isOwner}
          aria-readonly={!isOwner}
        />
      </div>
    </div>
  );
}
