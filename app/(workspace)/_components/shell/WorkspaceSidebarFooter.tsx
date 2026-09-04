"use client";

import type { ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { useWorkspaceLayout } from "../../_context/WorkspaceLayoutContext";
import { WorkspaceSidebarProfileMenu } from "./WorkspaceSidebarProfileMenu";

interface WorkspaceSidebarFooterProps {
  readonly showExpandedContent: boolean;
}

export function WorkspaceSidebarFooter({
  showExpandedContent,
}: WorkspaceSidebarFooterProps): ReactElement {
  const { t } = useTranslations();
  const { sidebarCollapsed, setSidebarCollapsed } = useWorkspaceLayout();

  const collapseButton = (
    <button
      type="button"
      onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
      className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-md text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface lg:flex"
      aria-label={sidebarCollapsed ? t("nav.expandSidebar") : t("nav.collapseSidebar")}
      title={sidebarCollapsed ? t("nav.expandSidebar") : t("nav.collapseSidebar")}
    >
      <span className="material-symbols-outlined text-[20px]">
        {sidebarCollapsed ? "left_panel_open" : "left_panel_close"}
      </span>
    </button>
  );

  return (
    <WorkspaceSidebarProfileMenu
      showExpandedContent={showExpandedContent}
      collapseButton={collapseButton}
    />
  );
}
