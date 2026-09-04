"use client";

import Link from "next/link";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

interface EditWorkspaceModalFooterProps {
  isOwner: boolean;
  isSaving: boolean;
  saveError: string | null;
  workspaceId: string | null;
}

export function EditWorkspaceModalFooter({
  isOwner,
  isSaving,
  saveError,
  workspaceId,
}: EditWorkspaceModalFooterProps): React.ReactElement {
  const { t } = useTranslations();
  const deleteHref = workspaceId
    ? `/workspaces/delete?workspaceId=${encodeURIComponent(workspaceId)}`
    : "/workspaces/delete";
  return (
    <div className="flex flex-col gap-3 bg-surface-container-highest/30 px-8 py-6">
      {saveError ? (
        <p className="text-xs font-medium text-error" role="alert">
          {saveError}
        </p>
      ) : null}
      <div className="flex items-center justify-between">
        <Link
          href={deleteHref}
          className="flex items-center gap-1.5 text-xs font-bold text-error/60 transition-colors hover:text-error"
        >
          <span className="material-symbols-outlined text-sm">delete</span>
          {t("workspaces.deleteTitle")}
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/workspaces"
            className="px-6 py-2.5 text-sm font-bold text-on-surface-variant transition-colors hover:text-on-surface"
          >
            {t("workspaces.createCancel")}
          </Link>
          <button
            type="submit"
            disabled={!isOwner || isSaving}
            className="rounded-lg bg-primary-container px-8 py-2.5 text-sm font-bold text-on-primary-container shadow-[0_8px_16px_rgba(107,73,216,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
          >
            {isSaving ? t("workspaces.editSaving") : t("workspaces.editSaveChanges")}
          </button>
        </div>
      </div>
    </div>
  );
}
