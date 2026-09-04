"use client";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

export function EditWorkspaceLoading(): React.ReactElement {
  const { t } = useTranslations();

  return (
    <div className="bg-surface font-body text-on-surface flex min-h-screen items-center justify-center">
      <p className="text-sm text-on-surface-variant">{t("workspaces.editLoading")}</p>
    </div>
  );
}
