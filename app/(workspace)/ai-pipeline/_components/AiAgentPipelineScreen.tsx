"use client";

import { motion } from "framer-motion";
import type { ReactElement } from "react";

import { useWorkspaceLayout } from "../../_context/WorkspaceLayoutContext";
import { WorkspaceTopNav } from "../../_components/WorkspaceTopNav";
import { WorkspaceDashboardBottomNav } from "../../dashboard/_components/WorkspaceDashboardBottomNav";
import { AiPipelineChatPanel } from "./AiPipelineChatPanel";
import { AiAgentChatScreen } from "./AiAgentChatScreen";

/** Full-height chat with shared workspace chrome (same top nav as dashboard, calendar, etc.). */
export function AiAgentPipelineScreen(): ReactElement {
  const { layoutMode } = useWorkspaceLayout();

  // ChatGPT-like UI for sidebar mode
  if (layoutMode === "sidebar") {
    return <AiAgentChatScreen />;
  }

  // Original UI for navbar mode
  return (
    <div className="relative flex h-[100dvh] flex-col overflow-hidden bg-surface font-body text-on-surface selection:bg-primary-container selection:text-on-primary-container">
      <div
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        aria-hidden
      >
        <div className="absolute left-1/4 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary-container/14 blur-[110px] inbox-blob-a" />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-secondary/12 blur-[90px] inbox-blob-b" />
        <div className="absolute right-0 top-1/3 h-[280px] w-[280px] rounded-full bg-tertiary/10 blur-[72px] inbox-blob-a opacity-60" />
      </div>
      <WorkspaceTopNav />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="flex min-h-0 flex-1 flex-col overflow-hidden pt-28 pb-36 md:pb-40"
      >
        <AiPipelineChatPanel variant="page" />
      </motion.main>
      <WorkspaceDashboardBottomNav />
    </div>
  );
}
