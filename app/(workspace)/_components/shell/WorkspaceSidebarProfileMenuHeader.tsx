"use client";

import type { ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

interface WorkspaceSidebarProfileMenuHeaderProps {
  readonly workspaceName: string;
  readonly workspaceImageUrl: string | null | undefined;
  readonly planName: string;
  readonly channelCount: number;
  readonly planLoading: boolean;
  readonly showUpgrade: boolean;
  readonly onUpgrade: () => void;
}

function initialLetter(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}

export function WorkspaceSidebarProfileMenuHeader({
  workspaceName,
  workspaceImageUrl,
  planName,
  channelCount,
  planLoading,
  showUpgrade,
  onUpgrade,
}: WorkspaceSidebarProfileMenuHeaderProps): ReactElement {
  const { t } = useTranslations();

  return (
    <div className="border-b border-outline-variant/35 bg-surface-container-high px-3 py-3.5">
      <div className="flex items-center gap-2.5 rounded-lg border border-outline-variant/30 bg-surface-container/70 px-2.5 py-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-primary/10 text-xs font-bold text-primary">
          {workspaceImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={workspaceImageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            initialLetter(workspaceName)
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium leading-tight text-on-surface-variant">
            {t("shell.sidebarProfileConnectedWorkspace")}
          </p>
          <p className="mt-0.5 truncate text-xs font-semibold leading-tight text-on-surface">
            {workspaceName}
          </p>
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center rounded-full bg-primary/12 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
          {planLoading ? t("dashboard.planLoading") : t("shell.sidebarPlanLabel", { plan: planName })}
        </span>
        {!planLoading ? (
          <span className="inline-flex items-center rounded-full bg-surface-container px-2.5 py-0.5 text-[11px] font-medium text-on-surface-variant">
            {t("shell.sidebarProfileChannelCount", { count: channelCount })}
          </span>
        ) : null}
      </div>

      {showUpgrade ? (
        <button
          type="button"
          onClick={onUpgrade}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-primary/25 bg-primary/10 px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/15"
        >
          <span className="material-symbols-outlined text-[18px]">bolt</span>
          {t("shell.sidebarProfileUpgrade")}
        </button>
      ) : null}
    </div>
  );
}
