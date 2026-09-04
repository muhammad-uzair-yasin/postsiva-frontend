"use client";

import type { ReactElement } from "react";

import {
  ACCOUNT_RAIL_MAIN_FILL_CLASS,
  WorkspaceAccountRailPageShell,
} from "../../../_components/shell/WorkspaceAccountRailPageLayout";
import { PostSchedulerCalendarView } from "./PostSchedulerCalendarView";

export function PostSchedulerCalendarScreen(): ReactElement {
  return (
    <WorkspaceAccountRailPageShell
      mainClassName={ACCOUNT_RAIL_MAIN_FILL_CLASS}
      mainScroll={false}
      className="selection:bg-secondary/30"
    >
      <PostSchedulerCalendarView />
    </WorkspaceAccountRailPageShell>
  );
}
