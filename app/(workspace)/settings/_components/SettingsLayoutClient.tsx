"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactElement, ReactNode } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { pathnameIsSettingsIntegrationsArea } from "@/lib/settings/integrationsData";
import { pathnameIsWorkspaceSidebarSubpage } from "@/lib/workspace/workspaceSidebarSubpages";

import { useWorkspaceLayout } from "../../_context/WorkspaceLayoutContext";
import { WorkspacePageScaffold } from "../../_components/WorkspacePageScaffold";
import { WORKSPACE_SIDEBAR_PAGE_MAIN_CLASS } from "../../_components/shell/WorkspaceAccountRailPageLayout";

interface SettingsLayoutClientProps {
  children: ReactNode;
}

export function SettingsLayoutClient({
  children,
}: SettingsLayoutClientProps): ReactElement {
  const pathname = usePathname();
  const { t } = useTranslations();
  const { layoutMode } = useWorkspaceLayout();
  const isSidebar = layoutMode === "sidebar";
  const isHub = pathname === "/settings";
  const hideBackLink =
    isHub ||
    pathnameIsWorkspaceSidebarSubpage(pathname) ||
    pathnameIsSettingsIntegrationsArea(pathname);

  const backLink =
    !hideBackLink ? (
      <Link
        href="/settings"
        className="mb-4 flex w-fit items-center gap-1 text-sm font-semibold text-secondary hover:underline"
      >
        <span className="material-symbols-outlined text-base">arrow_back</span>
        {t("shell.backToSettings")}
      </Link>
    ) : null;

  if (isSidebar) {
    return (
      <div className={WORKSPACE_SIDEBAR_PAGE_MAIN_CLASS}>
        {backLink}
        {children}
      </div>
    );
  }

  return (
    <WorkspacePageScaffold>
      {backLink}
      {children}
    </WorkspacePageScaffold>
  );
}
