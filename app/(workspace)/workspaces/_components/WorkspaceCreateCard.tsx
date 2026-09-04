"use client";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { useWorkspaceCreateDialogContext } from "../../_components/WorkspaceCreateDialogProvider";

export function WorkspaceCreateCard(): React.ReactElement {
  const { t } = useTranslations();
  const dialog = useWorkspaceCreateDialogContext();

  return (
    <button
      type="button"
      onClick={dialog.open}
      className="group flex h-full min-h-[280px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-outline-variant/20 bg-surface-container/30 p-6 text-center transition-all duration-300 hover:border-secondary/45 hover:bg-secondary/5"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-container-high text-secondary shadow-inner transition-transform duration-300 group-hover:scale-105 group-hover:bg-secondary/15">
        <span className="material-symbols-outlined text-3xl">add</span>
      </div>
      <h3 className="text-lg font-bold text-on-surface">{t("workspaces.createCardTitle")}</h3>
      <p className="mt-2 max-w-[220px] text-sm leading-relaxed text-on-surface-variant">
        {t("workspaces.createCardBody")}
      </p>
    </button>
  );
}
