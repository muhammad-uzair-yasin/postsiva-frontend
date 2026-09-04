"use client";

import Link from "next/link";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { useDeleteWorkspaceDialog } from "../_hooks/useDeleteWorkspaceDialog";

interface DeleteWorkspaceDialogProps {
  initialWorkspaceId: string;
}

export function DeleteWorkspaceDialog({
  initialWorkspaceId,
}: DeleteWorkspaceDialogProps): React.ReactElement {
  const { t } = useTranslations();
  const {
    workspaceName,
    confirmValue,
    setConfirmValue,
    deleting,
    error,
    loadError,
    canDelete,
    noWorkspace,
    notOwner,
    onDelete,
  } = useDeleteWorkspaceDialog(initialWorkspaceId);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface-dim/80 backdrop-blur-sm">
      <div className="w-full max-w-md glass-panel rounded-xl overflow-hidden shadow-[0_0_60px_-15px_rgba(107,73,216,0.3)] border border-outline-variant/10">
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-error to-transparent opacity-50" />
        <div className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-error-container/20 flex items-center justify-center">
              <span
                className="material-symbols-outlined text-error text-2xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                warning
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-on-surface">
              {t("workspaces.deleteTitle")}
            </h2>
          </div>
          <div className="mb-8 space-y-3">
            <p className="text-on-surface-variant leading-relaxed">
              {t("workspaces.deleteBodyIntro")}
            </p>
            <p className="text-sm font-semibold text-on-surface">
              {t("workspaces.deleteDataIntro")}
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-on-surface-variant">
              <li>{t("workspaces.deleteItemAccounts")}</li>
              <li>{t("workspaces.deleteItemScheduled")}</li>
              <li>{t("workspaces.deleteItemPublished")}</li>
              <li>{t("workspaces.deleteItemMedia")}</li>
              <li>{t("workspaces.deleteItemTeam")}</li>
              <li>{t("workspaces.deleteItemSettings")}</li>
            </ul>
            <p className="text-sm leading-relaxed text-on-surface-variant">
              {t("workspaces.deleteFinalNote")}
            </p>
          </div>
          {noWorkspace ? (
            <p className="mb-6 text-sm text-error" role="alert">
              {t("workspaces.deleteNoWorkspace")}{" "}
              <Link href="/workspaces" className="underline font-semibold">
                {t("workspaces.deleteChooseWorkspace")}
              </Link>
              .
            </p>
          ) : null}
          {loadError ? (
            <p className="mb-6 text-sm text-error" role="alert">
              {loadError}
            </p>
          ) : null}
          {notOwner ? (
            <p className="mb-6 text-sm text-error" role="alert">
              {t("workspaces.deleteOwnerOnly")}
            </p>
          ) : null}
          {error ? (
            <p className="mb-6 text-sm text-error" role="alert">
              {error}
            </p>
          ) : null}
          <div className="space-y-4 mb-8">
            <label
              className="block text-sm font-semibold text-on-surface mb-2"
              htmlFor="workspace_name"
            >
              {t("workspaces.deleteConfirmLabel")}
            </label>
            {workspaceName ? (
              <div className="rounded-lg border border-outline-variant/20 bg-surface-container-low px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-on-surface-variant">
                  {t("workspaces.deleteNameLabel")}
                </p>
                <p className="mt-1 font-mono text-sm text-on-surface select-all break-all">
                  {workspaceName}
                </p>
              </div>
            ) : null}
            <div className="relative">
              <input
                className="w-full bg-surface-container-lowest border-0 ring-1 ring-outline-variant/20 rounded-lg py-3 px-4 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-secondary/50 focus:outline-none transition-all disabled:opacity-50"
                id="workspace_name"
                name="workspace_name"
                placeholder={workspaceName || t("workspaces.deleteNamePlaceholder")}
                type="text"
                value={confirmValue}
                onChange={(e) => {
                  setConfirmValue(e.target.value);
                }}
                disabled={Boolean(noWorkspace || loadError || notOwner)}
                autoComplete="off"
              />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              disabled={!canDelete}
              onClick={() => {
                void onDelete();
              }}
              className="group relative w-full py-3.5 px-6 rounded-lg bg-error-container text-on-error-container font-bold text-sm overflow-hidden transition-all hover:scale-[1.02] active:scale-95 shadow-[0_4px_12px_rgba(147,0,10,0.3)] disabled:pointer-events-none disabled:opacity-40"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative z-10">
                {deleting ? t("workspaces.deleteSubmitting") : t("workspaces.deleteConfirm")}
              </span>
              <div className="absolute inset-0 bg-error blur-xl opacity-0 group-hover:opacity-20 transition-opacity" />
            </button>
            <Link
              href="/workspaces"
              className="w-full py-3.5 px-6 rounded-lg bg-transparent text-on-surface-variant font-medium text-sm hover:text-on-surface hover:bg-surface-container-high transition-all text-center"
            >
              {t("workspaces.createCancel")}
            </Link>
          </div>
        </div>
        <div className="px-8 py-4 bg-surface-container-high/30 flex justify-center items-center gap-2">
          <span className="w-1 h-1 rounded-full bg-primary/40" />
          <span className="w-1 h-1 rounded-full bg-secondary/40" />
          <span className="w-1 h-1 rounded-full bg-primary/40" />
        </div>
      </div>
    </div>
  );
}
