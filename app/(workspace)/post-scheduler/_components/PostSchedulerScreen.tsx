"use client";

import { motion } from "framer-motion";
import type { ReactElement } from "react";

import { useWorkspaceLayout } from "../../_context/WorkspaceLayoutContext";
import { WorkspaceTopNav } from "../../_components/WorkspaceTopNav";
import { WorkspaceDashboardBottomNav } from "../../dashboard/_components/WorkspaceDashboardBottomNav";
import { PostSchedulerAiDrawerHost } from "./PostSchedulerAiDrawerHost";
import { PostSchedulerComposerPublishBar } from "./PostSchedulerComposerPublishBar";
import { PostSchedulerComposerSection } from "./PostSchedulerComposerSection";
import { PostSchedulerComposerShell } from "./PostSchedulerComposerShell";

export function PostSchedulerScreen(): ReactElement {
  const { layoutMode, sidebarExpanded } = useWorkspaceLayout();
  const isSidebar = layoutMode === "sidebar";

  return (
    <PostSchedulerComposerShell>
      <PostSchedulerAiDrawerHost>
        <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-surface font-body text-on-surface selection:bg-primary-container/30">
          <div
            className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
            aria-hidden
          >
            <div className="absolute left-1/4 top-0 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-primary-container/12 blur-[100px] inbox-blob-a" />
            <div className="absolute bottom-0 right-1/4 h-[380px] w-[380px] rounded-full bg-secondary/10 blur-[88px] inbox-blob-b" />
            <div className="absolute right-0 top-1/3 h-[260px] w-[260px] rounded-full bg-tertiary/10 blur-[70px] inbox-blob-a opacity-70" />
          </div>
          <WorkspaceTopNav />
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`flex min-h-0 w-full flex-1 flex-col px-3 sm:px-6 md:px-10 xl:px-12 2xl:px-16 ${
              isSidebar ? "pb-24 pt-4" : "pb-36 pt-28"
            }`}
          >
            <div className="workspace-dashboard-scroll mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col overflow-y-auto pb-4">
              <PostSchedulerComposerSection />
            </div>
            {!isSidebar && <PostSchedulerComposerPublishBar />}
          </motion.main>

          {isSidebar && (
            <div
              className={`fixed bottom-0 right-0 z-40 transition-[left] duration-300 ease-in-out left-0 ${
                sidebarExpanded ? "lg:left-64" : "lg:left-20"
              }`}
            >
              <PostSchedulerComposerPublishBar />
            </div>
          )}

          <WorkspaceDashboardBottomNav />
        </div>
      </PostSchedulerAiDrawerHost>
    </PostSchedulerComposerShell>
  );
}
