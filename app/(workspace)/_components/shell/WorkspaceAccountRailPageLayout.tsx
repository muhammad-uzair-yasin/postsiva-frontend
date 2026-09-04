"use client";

import type { ReactElement, ReactNode } from "react";

import { useWorkspaceLayout } from "../../_context/WorkspaceLayoutContext";
import { WorkspaceDashboardBottomNav } from "../../dashboard/_components/WorkspaceDashboardBottomNav";
import { WorkspaceTopNav } from "../WorkspaceTopNav";
import { WorkspaceAccountFilterRail } from "./WorkspaceAccountFilterRail";

/** Scrollable main column (right side). */
export const ACCOUNT_RAIL_MAIN_SCROLL_CLASS =
  "workspace-dashboard-scroll min-h-0 min-w-0 flex-1 overflow-x-clip overflow-y-auto";

/** Horizontal inset for non-rail workspace pages (matches account-rail page inset). */
export const WORKSPACE_PAGE_HORIZONTAL_INSET_CLASS =
  "px-3 sm:px-4 md:px-5 lg:px-6";

/** Vertical inset shared by account-rail shells and sidebar subpages. */
export const WORKSPACE_PAGE_VERTICAL_INSET_CLASS =
  "py-2 sm:py-3 md:py-4 lg:py-4";

/** Inset around the rail + main row (horizontal and vertical). */
export const ACCOUNT_RAIL_PAGE_INSET_CLASS =
  `${WORKSPACE_PAGE_HORIZONTAL_INSET_CLASS} ${WORKSPACE_PAGE_VERTICAL_INSET_CLASS}`;

/** Gap between account rail and main content. */
export const ACCOUNT_RAIL_COLUMN_GAP_CLASS = "gap-3 md:gap-4";

/** Bottom/right padding for scrollable single-pane pages (top handled by page inset). */
export const ACCOUNT_RAIL_MAIN_PADDING_CLASS =
  "pb-20 sm:pb-24 md:pr-2 xl:pr-4 2xl:pr-6";

/** Sidebar mode: no bottom nav — lighter scroll gutter on account-rail main column. */
export const ACCOUNT_RAIL_MAIN_SCROLL_PADDING_SIDEBAR_CLASS =
  "pb-4 md:pr-2 xl:pr-4 2xl:pr-6";

/** Page title on workspace sidebar subpages (accounts, members, persona, integrations). */
export const WORKSPACE_SIDEBAR_SUBPAGE_TITLE_CLASS =
  "text-xl font-bold tracking-tight text-on-surface md:text-2xl";

/** Scrollable main column for sidebar subpages without account rail. */
export const WORKSPACE_SIDEBAR_PAGE_MAIN_CLASS =
  `workspace-dashboard-scroll min-h-0 min-w-0 w-full max-w-full flex-1 overflow-x-clip overflow-y-auto ${WORKSPACE_PAGE_HORIZONTAL_INSET_CLASS} ${WORKSPACE_PAGE_VERTICAL_INSET_CLASS}`;

export function resolveAccountRailMainScrollPadding(isSidebar: boolean): string {
  return isSidebar
    ? ACCOUNT_RAIL_MAIN_SCROLL_PADDING_SIDEBAR_CLASS
    : ACCOUNT_RAIL_MAIN_PADDING_CLASS;
}

/** Fill-height main column (inbox/calendar): no bottom scroll gutter; matches rail stretch. */
export const ACCOUNT_RAIL_MAIN_FILL_CLASS =
  "flex min-h-0 min-w-0 flex-1 flex-col self-stretch overflow-hidden md:pr-2 xl:pr-4 2xl:pr-6";

export interface WorkspaceAccountRailPageLayoutProps {
  readonly children: ReactNode;
  /** Extra classes on the main (right) column. */
  readonly mainClassName?: string;
  /**
   * When true (default), the main column scrolls as one pane.
   * Set false when the page owns internal sub-columns/rows (e.g. inbox).
   */
  readonly mainScroll?: boolean;
}

/**
 * Two-column workspace layout: account filter rail (left) + main content (right).
 */
export function WorkspaceAccountRailPageLayout({
  children,
  mainClassName = "",
  mainScroll = true,
}: WorkspaceAccountRailPageLayoutProps): ReactElement {
  const mainColumnClass = [
    mainScroll
      ? ACCOUNT_RAIL_MAIN_SCROLL_CLASS
      : "min-h-0 min-w-0 flex-1 self-stretch overflow-hidden",
    mainClassName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={`workspace-account-rail-page flex h-full min-h-0 min-w-0 flex-1 items-stretch overflow-hidden ${ACCOUNT_RAIL_PAGE_INSET_CLASS} ${ACCOUNT_RAIL_COLUMN_GAP_CLASS}`}
    >
      <WorkspaceAccountFilterRail />
      <div
        className={`workspace-account-rail-main flex min-h-0 min-w-0 flex-1 flex-col ${mainColumnClass}`}
      >
        {children}
      </div>
    </div>
  );
}

export interface WorkspaceAccountRailPageShellProps {
  readonly children: ReactNode;
  readonly mainClassName?: string;
  readonly mainScroll?: boolean;
  readonly className?: string;
}

/** Full-height page shell: top nav + two-column rail layout + bottom nav (legacy mode). */
export function WorkspaceAccountRailPageShell({
  children,
  mainClassName,
  mainScroll,
  className,
}: WorkspaceAccountRailPageShellProps): ReactElement {
  const { layoutMode } = useWorkspaceLayout();
  const isSidebar = layoutMode === "sidebar";

  return (
    <div
      className={[
        "relative flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-surface font-body text-on-surface",
        isSidebar ? "" : "min-h-screen",
        className ?? "",
      ].join(" ")}
    >
      <WorkspaceTopNav />
      <WorkspaceAccountRailPageLayout
        mainClassName={mainClassName}
        mainScroll={mainScroll}
      >
        {children}
      </WorkspaceAccountRailPageLayout>
      <WorkspaceDashboardBottomNav />
    </div>
  );
}
