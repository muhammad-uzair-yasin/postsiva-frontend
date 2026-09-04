"use client";

import { WorkspaceTopNav } from "./WorkspaceTopNav";
import { WorkspaceDashboardBottomNav } from "../dashboard/_components/WorkspaceDashboardBottomNav";
import { useWorkspaceLayout } from "../_context/WorkspaceLayoutContext";
import {
  resolveAccountRailMainScrollPadding,
  WORKSPACE_SIDEBAR_PAGE_MAIN_CLASS,
  WorkspaceAccountRailPageLayout,
} from "./shell/WorkspaceAccountRailPageLayout";

/** Legacy full-width main column (bottom nav layout). */
export const WORKSPACE_MAIN_CONTENT_CLASS =
  "workspace-dashboard-scroll min-w-0 max-w-full w-full overflow-x-clip px-3 pb-40 pt-4 sm:px-6 md:px-10 xl:px-12 2xl:px-16";

export {
  WORKSPACE_SIDEBAR_PAGE_MAIN_CLASS,
  WORKSPACE_SIDEBAR_SUBPAGE_TITLE_CLASS,
  resolveAccountRailMainScrollPadding,
} from "./shell/WorkspaceAccountRailPageLayout";

interface WorkspacePageScaffoldProps {
  children: React.ReactNode;
  mainClassName?: string;
  /** Optional extra classes (e.g. `max-w-3xl mx-auto`); default is full width like the dashboard. */
  maxWidthClass?: string;
  /** Two-column layout: account rail (left) + scrollable main (right). */
  accountRail?: boolean;
}

export function WorkspacePageScaffold({
  children,
  mainClassName,
  maxWidthClass,
  accountRail = false,
}: WorkspacePageScaffoldProps): React.ReactElement {
  const { layoutMode } = useWorkspaceLayout();
  const isSidebar = layoutMode === "sidebar";
  const accountRailPadding = resolveAccountRailMainScrollPadding(isSidebar);

  const defaultMainClass = accountRail
    ? accountRailPadding
    : isSidebar
      ? WORKSPACE_SIDEBAR_PAGE_MAIN_CLASS
      : WORKSPACE_MAIN_CONTENT_CLASS;

  const resolvedMainClass = mainClassName ?? defaultMainClass;
  const mainClass = maxWidthClass
    ? `${resolvedMainClass} ${maxWidthClass}`
    : resolvedMainClass;

  const rootClass = isSidebar
    ? "flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-surface font-body text-on-surface selection:bg-secondary/30"
    : "app-viewport min-h-screen min-w-0 max-w-full overflow-x-clip bg-surface font-body text-on-surface selection:bg-secondary/30";

  const accountRailMainClass = mainClassName
    ? `${accountRailPadding} ${mainClassName}`.trim()
    : accountRailPadding;

  const mainContent = accountRail ? (
    <WorkspaceAccountRailPageLayout mainClassName={accountRailMainClass}>
      {children}
    </WorkspaceAccountRailPageLayout>
  ) : (
    <main className={`min-h-0 flex-1 ${mainClass}`}>{children}</main>
  );

  return (
    <div className={rootClass}>
      <div
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        aria-hidden
      >
        <div className="absolute left-1/4 top-0 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-primary-container/10 blur-[100px]" />
        <div className="absolute bottom-0 right-0 h-[320px] w-[320px] rounded-full bg-secondary/10 blur-[80px]" />
      </div>
      <WorkspaceTopNav />
      {accountRail ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{mainContent}</div>
      ) : (
        mainContent
      )}
      <WorkspaceDashboardBottomNav />
    </div>
  );
}
