"use client";

import type { ReactElement, ReactNode } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { useWorkspaceLayout } from "../../../(workspace)/_context/WorkspaceLayoutContext";
import { WorkspaceNavUserProfile } from "../../../(workspace)/_components/WorkspaceNavUserProfile";
import { AccountSidebar } from "./AccountSidebar";

/**
 * Dashboard-style chrome for the account/workspaces area: fixed collapsible
 * sidebar + full-width main content.
 */
export function AccountShell({ children }: { children: ReactNode }): ReactElement {
  const { t } = useTranslations();
  const { sidebarExpanded, setSidebarMobileOpen } = useWorkspaceLayout();

  return (
    <div className="app-viewport flex min-h-screen min-w-0 max-w-full overflow-x-clip bg-surface">
      <AccountSidebar />

      <main
        className={[
          "flex-1 transition-[margin] duration-300 ease-in-out",
          "ml-0",
          sidebarExpanded ? "lg:ml-64" : "lg:ml-20",
        ].join(" ")}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-outline-variant/15 bg-surface/85 px-4 backdrop-blur-lg sm:px-6">
          <button
            type="button"
            onClick={() => setSidebarMobileOpen(true)}
            className="flex rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high lg:hidden"
            aria-label={t("nav.openNavigation")}
          >
            <span className="material-symbols-outlined text-xl">menu</span>
          </button>
          <div className="ml-auto">
            <WorkspaceNavUserProfile variant="dashboard" />
          </div>
        </header>

        <div className="flex min-w-0 max-w-full flex-1 flex-col overflow-x-clip px-4 pb-20 pt-6 sm:px-6 md:px-8 lg:px-10">{children}</div>
      </main>
    </div>
  );
}
