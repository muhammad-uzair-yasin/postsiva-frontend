"use client";

import type { ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

interface EditWorkspaceGeneralSaveBarProps {
  isOwner: boolean;
  isSaving: boolean;
  saveError: string | null;
}

export function EditWorkspaceGeneralSaveBar({
  isOwner,
  isSaving,
  saveError,
}: EditWorkspaceGeneralSaveBarProps): ReactElement | null {
  const { t } = useTranslations();

  if (!isOwner) {
    return null;
  }

  return (
    <div className="mt-8 flex flex-col gap-3 border-t border-outline-variant/10 pt-6">
      {saveError ? (
        <p className="text-sm font-medium text-error" role="alert">
          {saveError}
        </p>
      ) : null}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-lg bg-primary-container px-8 py-2.5 text-sm font-bold text-on-primary-container shadow-[0_8px_16px_rgba(107,73,216,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
        >
          {isSaving ? t("workspaces.editSaving") : t("workspaces.editSaveChanges")}
        </button>
      </div>
    </div>
  );
}
