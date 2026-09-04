"use client";

import { useState, type ReactElement, type ReactNode } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { formatWorkspaceDisplayName } from "@/lib/workspace/formatWorkspaceDisplayName";

import { useActiveWorkspaceId } from "../../_hooks/useActiveWorkspaceId";
import { useStoredWorkspaces } from "../../workspaces/_hooks/useStoredWorkspaces";
import { WorkspaceSwitcherModal } from "./WorkspaceSwitcherModal";

function workspaceInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}

interface WorkspaceAccountRailTopBarProps {
  readonly collapsed: boolean;
  readonly isRefreshing: boolean;
  readonly onRefresh: () => void;
  readonly onToggleCollapse: () => void;
  readonly search: ReactNode;
}

export function WorkspaceAccountRailTopBar({
  collapsed,
  isRefreshing,
  onRefresh,
  onToggleCollapse,
  search,
}: WorkspaceAccountRailTopBarProps): ReactElement {
  const { t } = useTranslations();
  const activeId = useActiveWorkspaceId();
  const { workspaces } = useStoredWorkspaces();
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const active = workspaces.find((w) => w.id === activeId) ?? workspaces[0] ?? null;
  const name = formatWorkspaceDisplayName(active?.name?.trim() || t("settings.workspace"));

  const iconButtonClass =
    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-on-surface/[0.06] hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <>
      <div
        className={[
          "shrink-0 border-b border-outline-variant/20 py-3",
          collapsed ? "px-1.5" : "px-3",
        ].join(" ")}
      >
        <div
          className={[
            "flex items-center gap-1",
            collapsed ? "flex-col justify-center gap-2" : "gap-1.5",
          ].join(" ")}
        >
          <button
            type="button"
            onClick={() => setSwitcherOpen(true)}
            className={[
              "flex min-w-0 items-center rounded-lg transition-colors hover:bg-on-surface/[0.05]",
              collapsed ? "justify-center p-1" : "min-w-0 flex-1 gap-1.5 py-0.5 pl-0.5 pr-1",
            ].join(" ")}
            aria-label={t("shell.switchWorkspaceEdit")}
            title={name}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-primary-container text-xs font-bold text-on-primary-container">
              {active?.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={active.image_url} alt="" className="h-full w-full object-cover" />
              ) : (
                workspaceInitial(name)
              )}
            </span>
            {!collapsed ? (
              <span className="min-w-0 flex-1 truncate text-left text-xs font-semibold text-on-surface">
                {name}
              </span>
            ) : null}
          </button>

          {!collapsed ? (
            <button
              type="button"
              onClick={() => setSwitcherOpen(true)}
              className={iconButtonClass}
              aria-label={t("shell.switchWorkspace")}
              title={t("shell.switchWorkspace")}
            >
              <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => void onRefresh()}
            disabled={isRefreshing}
            aria-label={t("settings.channelModalRefreshAccounts")}
            className={iconButtonClass}
          >
            <span className={`material-symbols-outlined text-[18px] ${isRefreshing ? "animate-spin" : ""}`}>
              refresh
            </span>
          </button>

          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={
              collapsed ? t("shell.expandAccountFilter") : t("shell.collapseAccountFilter")
            }
            className={iconButtonClass}
          >
            <span className="material-symbols-outlined text-[18px]">
              {collapsed ? "left_panel_open" : "left_panel_close"}
            </span>
          </button>
        </div>

        {!collapsed ? <div className="mt-2">{search}</div> : null}
      </div>
      <WorkspaceSwitcherModal open={switcherOpen} onClose={() => setSwitcherOpen(false)} />
    </>
  );
}
