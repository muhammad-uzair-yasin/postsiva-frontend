"use client";

import type { AuthWorkspaceLoginItem } from "@/lib/auth/types";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

interface EditWorkspaceDescriptionFieldProps {
  workspace: AuthWorkspaceLoginItem;
  isOwner: boolean;
}

export function EditWorkspaceDescriptionField({
  workspace,
  isOwner,
}: EditWorkspaceDescriptionFieldProps): React.ReactElement {
  const { t } = useTranslations();

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/70">
        {t("workspaces.editDescriptionLabel")}
      </label>
      <textarea
        className="w-full rounded-lg border-none bg-surface-container-lowest px-4 py-2.5 text-on-surface transition-all placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-secondary/50 read-only:opacity-70"
        defaultValue={workspace.description ?? ""}
        placeholder={t("workspaces.editDescriptionPlaceholder")}
        rows={3}
        name="workspaceDescription"
        readOnly={!isOwner}
        aria-readonly={!isOwner}
      />
    </div>
  );
}
