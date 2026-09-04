"use client";

import { motion, useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState, type ReactElement } from "react";

import { useActiveWorkspaceId } from "../_hooks/useActiveWorkspaceId";
import { useWorkspaceAgentCapabilityBubbles } from "../_hooks/useWorkspaceAgentCapabilityBubbles";
import { AiPipelineChatProvider } from "../ai-pipeline/_context/AiPipelineChatContext";
import { AiPipelineNewChatDialog } from "../ai-pipeline/_components/AiPipelineNewChatDialog";
import { useAiPipelineChat } from "../ai-pipeline/_context/AiPipelineChatContext";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { usePostSchedulerComposerOverlayOpen } from "../_hooks/usePostSchedulerComposerOverlayOpen";
import { WorkspaceAgentFabLauncher } from "./WorkspaceAgentFabLauncher";

const AiPipelineChatPanel = dynamic(
  () =>
    import("../ai-pipeline/_components/AiPipelineChatPanel").then((m) => ({
      default: m.AiPipelineChatPanel,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[12rem] items-center justify-center text-sm text-white/40">
        …
      </div>
    ),
  },
);

/**
 * FAB only until open — then mounts chat provider + panel (avoids history fetch on every page).
 */
export function WorkspaceAgentFabDock(): ReactElement | null {
  const pathname = usePathname();
  const activeWorkspaceId = useActiveWorkspaceId();
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const composerModalOpen = usePostSchedulerComposerOverlayOpen();

  const isFullAgentPage =
    pathname === "/ai-pipeline" || pathname.startsWith("/ai-pipeline/");
  const isWorkspaceSelectionPage =
    pathname === "/workspaces" || pathname === "/workspaces/";

  const capabilityBubble = useWorkspaceAgentCapabilityBubbles(
    !isFullAgentPage,
    open,
  );

  if (
    isFullAgentPage ||
    isWorkspaceSelectionPage ||
    activeWorkspaceId === null
  ) {
    return null;
  }

  const showCapabilityBubble = Boolean(
    capabilityBubble && !open && !composerModalOpen,
  );
  const hideLauncher = open || composerModalOpen;

  return (
    <>
      <div
        className={hideLauncher ? "pointer-events-none invisible" : undefined}
        aria-hidden={hideLauncher || undefined}
      >
        <WorkspaceAgentFabLauncher
          capabilityMessage={showCapabilityBubble ? capabilityBubble : null}
          onOpen={() => {
            setOpen(true);
          }}
        />
      </div>
      {open ? (
        <AiPipelineChatProvider>
          <WorkspaceAgentFabDockOpen
            reduceMotion={reduceMotion}
            onClose={() => setOpen(false)}
          />
        </AiPipelineChatProvider>
      ) : null}
    </>
  );
}

function WorkspaceAgentFabDockOpen({
  reduceMotion,
  onClose,
}: {
  reduceMotion: boolean | null;
  onClose: () => void;
}): ReactElement {
  const [expanded, setExpanded] = useState(false);
  const { loading, sending, clearing, clearAllChats } = useAiPipelineChat();
  const [newChatOpen, setNewChatOpen] = useState(false);
  const headerBusy = loading || sending || clearing;
  const { t } = useTranslations();

  const closePanel = useCallback((): void => {
    setExpanded(false);
    setNewChatOpen(false);
    onClose();
  }, [onClose]);

  const toggleExpand = useCallback((): void => {
    setExpanded((v) => !v);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key !== "Escape") {
        return;
      }
      if (expanded) {
        setExpanded(false);
      } else {
        closePanel();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [expanded, closePanel]);

  const handleConfirmNewChat = async (): Promise<void> => {
    await clearAllChats();
    setNewChatOpen(false);
  };

  const layoutTransition = reduceMotion
    ? { duration: 0.15 }
    : { type: "spring" as const, stiffness: 400, damping: 36, mass: 0.9 };

  return (
    <>
      <button
        type="button"
        aria-label={t("aiPipeline.fabCloseOverlayAria")}
        className="fixed inset-0 z-[124] bg-black/50 backdrop-blur-[2px] motion-safe:transition-opacity"
        onClick={closePanel}
      />
      <motion.div
        layout
        transition={{ layout: layoutTransition }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="workspace-agent-fab-title"
        className={`fixed z-[126] flex flex-col overflow-hidden rounded-2xl border border-white/12 bg-[#0f1117] shadow-[0_28px_90px_-14px_rgba(0,0,0,0.85),0_0_0_1px_rgba(107,73,216,0.10)_inset] motion-safe:will-change-transform ${
          expanded
            ? "inset-3 max-h-[calc(100dvh-1.5rem)] sm:inset-5 md:inset-6"
            : "bottom-[5.75rem] right-5 h-[min(82vh,720px)] w-[min(100vw-1.25rem,40rem)] sm:bottom-[7.25rem] sm:right-6"
        }`}
      >
        <div className="relative flex shrink-0 flex-col border-b border-white/[0.08] bg-gradient-to-r from-[#13151f]/98 via-[#13151f]/95 to-[#0f1117]/90 backdrop-blur-xl">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#0058bc]/40 to-transparent motion-reduce:hidden"
            aria-hidden
          />
          <div className="flex items-center justify-between gap-2 px-3 py-2.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full">
                <Image
                  src="/images/new_piva1.png"
                  alt="Piva"
                  width={32}
                  height={32}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <p
                  id="workspace-agent-fab-title"
                  className="truncate text-sm font-bold tracking-tight text-white"
                >
                  {t("aiPipeline.pageTitle")}
                </p>
                <p className="truncate text-[10px] text-white/40">
                  {expanded
                    ? t("aiPipeline.fabExpandedHint")
                    : t("aiPipeline.fabPreviewHint")}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-0.5">
              <motion.button
                type="button"
                onClick={() => {
                  setNewChatOpen(true);
                }}
                disabled={headerBusy}
                whileHover={{ scale: headerBusy ? 1 : 1.08 }}
                whileTap={{ scale: headerBusy ? 1 : 0.94 }}
                className="rounded-xl p-2 text-white/40 transition-colors hover:bg-white/5 hover:text-white/70 disabled:opacity-40 motion-reduce:transform-none"
                title={t("aiPipeline.fabNewChatTitle")}
                aria-label={t("aiPipeline.fabNewChatAria")}
              >
                <span className="material-symbols-outlined text-xl">note_add</span>
              </motion.button>
              <motion.button
                type="button"
                onClick={toggleExpand}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                className="rounded-xl p-2 text-white/40 transition-colors hover:bg-white/5 hover:text-white/70 motion-reduce:transform-none"
                title={
                  expanded
                    ? t("aiPipeline.fabShrinkTitle")
                    : t("aiPipeline.fabExpandTitle")
                }
                aria-label={
                  expanded
                    ? t("aiPipeline.fabShrinkAria")
                    : t("aiPipeline.fabExpandAria")
                }
              >
                <span className="material-symbols-outlined text-xl">
                  {expanded ? "fullscreen_exit" : "open_in_full"}
                </span>
              </motion.button>
              <motion.button
                type="button"
                onClick={closePanel}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                className="rounded-xl p-2 text-white/40 transition-colors hover:bg-red-500/10 hover:text-red-400 motion-reduce:transform-none"
                aria-label={t("aiPipeline.fabCloseAria")}
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </motion.button>
            </div>
          </div>
        </div>
        <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
          <AiPipelineChatPanel variant="embed" />
        </div>
      </motion.div>
      <AiPipelineNewChatDialog
        open={newChatOpen}
        compact
        confirming={clearing}
        onCancel={() => {
          if (!clearing) {
            setNewChatOpen(false);
          }
        }}
        onConfirm={() => {
          void handleConfirmNewChat();
        }}
      />
    </>
  );
}
