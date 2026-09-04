"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { flushComposerClearOnClose } from "@/lib/post-composer/composerClearOnClose";
import { usePostSchedulerAi } from "./PostSchedulerAiContext";
import { hasComposerEscapeOverlay } from "./postSchedulerComposerEscapeOverlay";
import { PostSchedulerAiDrawerHost } from "./PostSchedulerAiDrawerHost";
import { PostSchedulerComposerPublishBar } from "./PostSchedulerComposerPublishBar";
import { PostSchedulerComposerSection } from "./PostSchedulerComposerSection";
import { PostSchedulerComposerShell } from "./PostSchedulerComposerShell";
import { PostSchedulerComposerModalLayoutProvider } from "../_context/PostSchedulerComposerModalLayoutContext";
import { setPostSchedulerComposerOverlayMounted } from "@/lib/workspace/postSchedulerComposerOverlayState";
import type { WorkspaceComposerEditSession } from "@/lib/post-composer/composerEditSessionFromUnifiedPost";
import type { WorkspaceComposerEditCallbacks } from "../../_components/WorkspaceComposerModalProvider";
import { PostSchedulerComposerEditModeProvider } from "../../content-manager/_context/PostSchedulerComposerEditModeContext";
import { PostSchedulerComposerContentManagerEditFooter } from "../../content-manager/_components/PostSchedulerComposerContentManagerEditFooter";

const MODAL_ANIM_MS = 300;
const DRAWER_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

interface PostSchedulerComposerModalProps {
  scheduledAt: Date;
  /** Opening from a chosen pipeline/CM slot — show “Schedule Now” immediately. */
  pipelineSlotPreselected?: boolean;
  editSession?: WorkspaceComposerEditSession | null;
  editCallbacks?: WorkspaceComposerEditCallbacks;
  onClose: () => void;
}

export function PostSchedulerComposerModal({
  scheduledAt,
  pipelineSlotPreselected = false,
  editSession = null,
  editCallbacks,
  onClose,
}: PostSchedulerComposerModalProps): React.ReactElement {
  const { t } = useTranslations();
  const [isFullscreen, setIsFullscreen] = useState(false);
  /** Panel starts off-screen; transition runs only after this is true. */
  const [transitionReady, setTransitionReady] = useState(false);
  const [entered, setEntered] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) {
      setTransitionReady(true);
      setEntered(true);
      return;
    }
    // Paint off-screen first, enable transition, then slide in.
    enterTimerRef.current = setTimeout(() => {
      setTransitionReady(true);
      enterTimerRef.current = setTimeout(() => {
        enterTimerRef.current = null;
        setEntered(true);
      }, 16);
    }, 16);
    return () => {
      if (enterTimerRef.current !== null) {
        clearTimeout(enterTimerRef.current);
        enterTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    setPostSchedulerComposerOverlayMounted(true);
    return () => {
      setPostSchedulerComposerOverlayMounted(false);
    };
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      if (closeTimerRef.current !== null) {
        clearTimeout(closeTimerRef.current);
      }
      if (enterTimerRef.current !== null) {
        clearTimeout(enterTimerRef.current);
      }
    };
  }, []);

  const handleRequestClose = useCallback(() => {
    if (leaving) {
      return;
    }
    flushComposerClearOnClose();
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) {
      onClose();
      return;
    }
    setLeaving(true);
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null;
      onClose();
    }, MODAL_ANIM_MS);
  }, [leaving, onClose]);

  const openVisual = entered && !leaving;
  const panelOpen = openVisual;
  const panelTransitionClass = transitionReady
    ? "transition-transform duration-[300ms] motion-reduce:transition-none"
    : "transition-none";

  const modalTitle = editSession
    ? editSession.kind === "draft"
      ? t("content.draftEditTitle")
      : t("content.scheduledEditTitle")
    : t("composer.title");

  const composerShell = (
    <PostSchedulerComposerShell
      lockedAccountId={editSession?.lockedAccountId}
      sessionBootstrap={editSession?.sessionBootstrap}
    >
      <PostSchedulerAiDrawerHost
        manageBodyScroll={false}
        drawerVariant="modalPanel"
        stickyFooter={
          editSession && editCallbacks ? (
            <PostSchedulerComposerContentManagerEditFooter
              session={editSession}
              onClose={handleRequestClose}
              onUpdateSuccess={editCallbacks.onUpdateSuccess}
              onScheduleComplete={editCallbacks.onScheduleComplete}
              onPublishSuccess={editCallbacks.onPublishSuccess}
              onDeleteSuccess={editCallbacks.onDeleteSuccess}
              onMoveToDraftSuccess={editCallbacks.onMoveToDraftSuccess}
            />
          ) : (
            <PostSchedulerComposerPublishBar
              initialScheduledAt={scheduledAt}
              pipelineSlotPreselected={pipelineSlotPreselected}
            />
          )
        }
      >
        <PostSchedulerModalEscapeBridge
          isFullscreen={isFullscreen}
          onCloseModal={handleRequestClose}
          onExitFullscreen={() => {
            setIsFullscreen(false);
          }}
        />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-2 sm:gap-2 sm:p-3">
          <PostSchedulerComposerSection />
        </div>
      </PostSchedulerAiDrawerHost>
    </PostSchedulerComposerShell>
  );

  /* z-[130]/[131]: composer drawer; Connect your world uses z-[150] when opened on top. */
  return (
    <div className="fixed inset-0 z-[130] flex items-stretch justify-end p-0">
      <button
        type="button"
        aria-label={t("postScheduler.modal.closeDialog")}
        className={`absolute inset-0 z-[130] bg-black/70 motion-reduce:transition-none ${
          transitionReady
            ? "transition-opacity duration-[300ms] ease-out"
            : "transition-none"
        } ${openVisual ? "opacity-100" : "opacity-0"}`}
        onClick={handleRequestClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="post-scheduler-modal-title"
        style={{
          transitionDuration: `${MODAL_ANIM_MS}ms`,
          transitionTimingFunction: DRAWER_EASE,
        }}
        className={`relative z-[131] flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden border border-outline-variant/20 border-r-0 bg-surface shadow-2xl will-change-transform motion-reduce:translate-x-0 ${panelTransitionClass} ${
          panelOpen ? "translate-x-0" : "translate-x-full"
        } ${
          isFullscreen
            ? "w-full max-w-[100vw] rounded-none border-transparent shadow-none transition-[transform,width,max-width] duration-[300ms] motion-reduce:transition-none"
            : "w-[80vw] max-w-[80vw] rounded-none"
        }`}
      >
        <header className="flex shrink-0 items-center justify-between border-b border-outline-variant/15 px-3 py-2 sm:px-4">
          <h2
            id="post-scheduler-modal-title"
            className="text-sm font-bold text-on-surface"
          >
            {modalTitle}
          </h2>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => {
                setIsFullscreen((prev) => !prev);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
              title={
                isFullscreen
                  ? t("postScheduler.modal.exitFullscreen")
                  : t("postScheduler.modal.enterFullscreen")
              }
              aria-label={
                isFullscreen
                  ? t("postScheduler.modal.exitFullscreen")
                  : t("postScheduler.modal.enterFullscreen")
              }
            >
              <span className="material-symbols-outlined text-[22px]">
                {isFullscreen ? "close_fullscreen" : "open_in_full"}
              </span>
            </button>
            <button
              type="button"
              onClick={handleRequestClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
              aria-label={t("common.close")}
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>
        </header>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <PostSchedulerComposerModalLayoutProvider>
            {editSession ? (
              <PostSchedulerComposerEditModeProvider mode={editSession.kind}>
                {composerShell}
              </PostSchedulerComposerEditModeProvider>
            ) : (
              composerShell
            )}
          </PostSchedulerComposerModalLayoutProvider>
        </div>
      </div>
    </div>
  );
}

function PostSchedulerModalEscapeBridge({
  onCloseModal,
  isFullscreen,
  onExitFullscreen,
}: {
  onCloseModal: () => void;
  isFullscreen: boolean;
  onExitFullscreen: () => void;
}): null {
  const { aiPanelOpen } = usePostSchedulerAi();

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key !== "Escape") {
        return;
      }
      if (hasComposerEscapeOverlay()) {
        return;
      }
      if (aiPanelOpen) {
        return;
      }
      if (isFullscreen) {
        onExitFullscreen();
        return;
      }
      onCloseModal();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [aiPanelOpen, isFullscreen, onCloseModal, onExitFullscreen]);

  return null;
}
