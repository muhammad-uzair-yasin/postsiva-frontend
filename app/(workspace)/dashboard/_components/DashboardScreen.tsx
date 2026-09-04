"use client";

import { motion } from "framer-motion";
import type { ReactElement } from "react";
import { WorkspacePageDocumentHead } from "../../_components/WorkspacePageDocumentHead";
import {
  resolveAccountRailMainScrollPadding,
  WorkspaceAccountRailPageShell,
} from "../../_components/shell/WorkspaceAccountRailPageLayout";
import { useWorkspaceLayout } from "../../_context/WorkspaceLayoutContext";
import { useActiveWorkspaceId } from "../../_hooks/useActiveWorkspaceId";
import { DashboardContent } from "./static/DashboardContent";

export function DashboardScreen(): ReactElement {
  const activeWorkspaceId = useActiveWorkspaceId();
  const { layoutMode } = useWorkspaceLayout();
  const isSidebar = layoutMode === "sidebar";

  return (
    <>
      <WorkspacePageDocumentHead
        titleKey="dashboard.metaTitle"
        descriptionKey="dashboard.metaDescription"
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        aria-hidden
      >
        <div className="absolute left-1/4 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary-container/14 blur-[110px] inbox-blob-a" />
        <div className="absolute bottom-0 right-0 h-[380px] w-[380px] rounded-full bg-secondary/12 blur-[90px] inbox-blob-b" />
        <div className="absolute left-1/2 top-1/3 h-[280px] w-[280px] -translate-x-1/2 rounded-full bg-tertiary/8 blur-[70px] inbox-blob-a opacity-70" />
      </div>
      <WorkspaceAccountRailPageShell
        key={activeWorkspaceId ?? "no-workspace"}
        mainClassName={resolveAccountRailMainScrollPadding(isSidebar)}
        className="selection:bg-primary/30"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <DashboardContent />
        </motion.div>
      </WorkspaceAccountRailPageShell>
    </>
  );
}
