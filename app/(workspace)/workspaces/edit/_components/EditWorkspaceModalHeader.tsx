"use client";

import Link from "next/link";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

interface EditWorkspaceModalHeaderProps {
  workspaceName?: string;
}

export function EditWorkspaceModalHeader({
  workspaceName,
}: EditWorkspaceModalHeaderProps): React.ReactElement {
  const { t } = useTranslations();

  return (
    <div className="flex items-center justify-between bg-surface-container-low/50 px-8 py-6">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold tracking-tight text-on-surface">
          {t("workspaces.editTitle")}
        </h1>
        <p className="text-sm text-on-surface-variant">
          {workspaceName
            ? t("workspaces.editSubtitleNamed", { name: workspaceName })
            : t("workspaces.editSubtitle")}
        </p>
      </div>
      <Link
        href="/workspaces"
        className="p-2 hover:bg-surface-container-high rounded-full transition-colors"
      >
        <span className="material-symbols-outlined text-on-surface-variant">
          close
        </span>
      </Link>
    </div>
  );
}
