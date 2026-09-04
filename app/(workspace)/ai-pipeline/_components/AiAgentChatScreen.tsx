"use client";

import { useWorkspaceLayout } from "../../_context/WorkspaceLayoutContext";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { AiPipelineChatComposerBar } from "./AiPipelineChatComposerBar";
import { AiPipelineChatPanel } from "./AiPipelineChatPanel";

export function AiAgentChatScreen(): React.ReactElement {
  const { sidebarExpanded } = useWorkspaceLayout();
  const { t } = useTranslations();

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-outline-variant/15 px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">smart_toy</span>
          <h1 className="text-base font-bold text-on-surface sm:text-lg">
            {t("aiPipeline.pageTitle")}
          </h1>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col pb-36">
        <AiPipelineChatPanel variant="page" hideComposer />
      </div>

      <div
        className={`fixed bottom-0 right-0 z-40 transition-[left] duration-300 ease-in-out left-0 ${
          sidebarExpanded ? "lg:left-64" : "lg:left-20"
        }`}
      >
        <AiPipelineChatComposerBar />
      </div>
    </div>
  );
}
