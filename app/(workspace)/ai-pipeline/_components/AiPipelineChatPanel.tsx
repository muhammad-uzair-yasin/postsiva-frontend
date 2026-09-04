"use client";

import { motion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
} from "react";

import { useAiPipelineChat } from "../_context/AiPipelineChatContext";
import { AiPipelineChatComposerBar } from "./AiPipelineChatComposerBar";
import { AiPipelineChatMessages } from "./AiPipelineChatMessages";
import { AiPipelineChatStarterPrompts } from "./AiPipelineChatStarterPrompts";
import { AiPipelineNewChatDialog } from "./AiPipelineNewChatDialog";

function scrollContainerToBottom(el: HTMLElement, smooth: boolean): void {
  el.scrollTo({
    top: el.scrollHeight,
    behavior: smooth ? "smooth" : "auto",
  });
}

export type AiPipelineChatPanelVariant = "page" | "embed";

export function AiPipelineChatPanel({
  variant = "page",
  hideComposer = false,
}: {
  variant?: AiPipelineChatPanelVariant;
  hideComposer?: boolean;
}): ReactElement {
  const {
    messages,
    loading,
    sending,
    clearing,
    loadingMore,
    hasMoreOlder,
    error,
    reload,
    loadMoreOlder,
    clearAllChats,
  } = useAiPipelineChat();
  const isEmbed = variant === "embed";
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const prevSendingRef = useRef(false);
  const initialScrollDoneRef = useRef(false);
  const scrollRestoreRef = useRef<{ scrollHeight: number; scrollTop: number } | null>(null);
  const loadOlderTriggeredRef = useRef(false);
  const [newChatOpen, setNewChatOpen] = useState(false);

  const headerBusy = loading || sending || clearing;

  const handleConfirmNewChat = async (): Promise<void> => {
    await clearAllChats();
    setNewChatOpen(false);
  };

  useEffect(() => {
    const el = scrollAreaRef.current;
    if (!el) {
      return;
    }
    const wasSending = prevSendingRef.current;
    prevSendingRef.current = sending;
    if (wasSending === sending) {
      return;
    }
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const smooth = !reduceMotion;
    if ((!wasSending && sending) || (wasSending && !sending)) {
      requestAnimationFrame(() => {
        scrollContainerToBottom(el, smooth);
      });
    }
  }, [sending]);

  useEffect(() => {
    if (loading) {
      initialScrollDoneRef.current = false;
    }
  }, [loading]);

  useEffect(() => {
    if (messages.length === 0) {
      initialScrollDoneRef.current = false;
    }
  }, [messages.length]);

  useEffect(() => {
    if (loading || messages.length === 0) {
      return;
    }
    if (initialScrollDoneRef.current) {
      return;
    }
    const el = scrollAreaRef.current;
    if (!el) {
      return;
    }
    initialScrollDoneRef.current = true;
    requestAnimationFrame(() => {
      scrollContainerToBottom(el, false);
    });
  }, [loading, messages.length]);

  useLayoutEffect(() => {
    if (loadingMore) {
      return;
    }
    const snap = scrollRestoreRef.current;
    if (!snap) {
      return;
    }
    const el = scrollAreaRef.current;
    if (!el) {
      return;
    }
    scrollRestoreRef.current = null;
    const delta = el.scrollHeight - snap.scrollHeight;
    el.scrollTop = snap.scrollTop + delta;
    loadOlderTriggeredRef.current = false;
  }, [messages, loadingMore]);

  const onScrollAreaScroll = useCallback((): void => {
    const el = scrollAreaRef.current;
    if (!el || loading || loadingMore || !hasMoreOlder || loadOlderTriggeredRef.current) {
      return;
    }
    if (el.scrollTop > 100) {
      return;
    }
    loadOlderTriggeredRef.current = true;
    scrollRestoreRef.current = {
      scrollHeight: el.scrollHeight,
      scrollTop: el.scrollTop,
    };
    void loadMoreOlder();
  }, [loading, loadingMore, hasMoreOlder, loadMoreOlder]);

  return (
    <section
      className={`relative flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden bg-surface ${
        isEmbed ? "h-full" : "md:border-r md:border-outline-variant/10"
      }`}
    >
      {!isEmbed ? (
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35] marketing-grid-bg"
          aria-hidden
        />
      ) : null}
      {!isEmbed ? (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 30 }}
          className="relative flex shrink-0 items-center justify-between gap-3 border-b border-white/[0.08] bg-surface-container-low/85 px-4 py-4 backdrop-blur-xl md:px-8"
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
            aria-hidden
          />
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/90">
              Workspace AI
            </p>
            <h2 className="mt-0.5 font-headline text-lg font-bold tracking-tight text-on-surface md:text-xl">
              Agent inbox
            </h2>
            <p className="mt-1 max-w-md text-[11px] leading-snug text-on-surface-variant">
              All channels in one thread · New messages use the Website agent
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setNewChatOpen(true);
              }}
              disabled={headerBusy}
              className="rounded-xl border border-primary/25 bg-gradient-to-r from-surface-container-high to-surface-container px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-on-surface shadow-sm transition-shadow hover:border-secondary/35 hover:text-secondary disabled:opacity-50 motion-reduce:transform-none"
            >
              New chat
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => void reload()}
              disabled={headerBusy}
              className="rounded-xl border border-outline-variant/25 bg-surface-container-high/90 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-on-surface shadow-sm transition-colors hover:border-secondary/35 hover:text-secondary disabled:opacity-50 motion-reduce:transform-none"
            >
              Refresh
            </motion.button>
          </div>
        </motion.div>
      ) : null}
      <div
        className={`pointer-events-none absolute left-0 top-0 w-full bg-gradient-to-b from-primary/[0.08] via-transparent to-transparent ${
          isEmbed ? "h-24" : "h-40"
        }`}
        aria-hidden
      />
      {error ? (
        <div
          className={`relative z-[1] rounded-xl border border-error/35 bg-error/10 px-3 py-2.5 text-xs text-error shadow-sm ${
            isEmbed ? "mx-2 mt-2" : "mx-4 mt-3 md:mx-6"
          }`}
        >
          {error}
        </div>
      ) : null}
      <div
        ref={scrollAreaRef}
        onScroll={onScrollAreaScroll}
        className={`custom-scrollbar relative z-[1] min-h-0 flex-1 overflow-y-auto overflow-x-hidden ${
          isEmbed ? "px-2 py-3" : "px-4 py-8 md:px-8"
        }`}
      >
        <div
          className={`mx-auto flex flex-col ${isEmbed ? "max-w-none space-y-4" : "max-w-4xl space-y-8"}`}
        >
          {loadingMore ? (
            <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
              Loading older messages…
            </p>
          ) : null}
          {loading ? (
            <div className="space-y-4 py-4" aria-busy aria-label="Loading chat">
              <div className="flex gap-4">
                <div className="h-11 w-11 shrink-0 rounded-2xl border border-outline-variant/15 inbox-skeleton-shimmer" />
                <div className="flex-1 space-y-2">
                  <div className="h-24 rounded-2xl border border-outline-variant/10 inbox-skeleton-shimmer" />
                  <div className="h-3 w-24 rounded bg-surface-container-high/60" />
                </div>
              </div>
              <div className="flex flex-row-reverse gap-4">
                <div className="h-11 w-11 shrink-0 rounded-2xl inbox-skeleton-shimmer" />
                <div className="h-20 flex-1 rounded-2xl border border-outline-variant/10 inbox-skeleton-shimmer" />
              </div>
            </div>
          ) : messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              className={`rounded-3xl border border-dashed border-outline-variant/30 bg-surface-container-low/50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] ring-1 ring-white/[0.03] ${
                isEmbed ? "px-4 py-8" : "px-6 py-12"
              }`}
            >
              <div
                className={`flex flex-col ${isEmbed ? "" : "md:flex-row md:items-start md:gap-8"}`}
              >
                <div
                  className={`mb-6 flex shrink-0 justify-center md:mb-0 ${isEmbed ? "" : "md:justify-start"}`}
                >
                  <span className="material-symbols-outlined text-5xl text-primary/40 md:text-6xl">
                    forum
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-medium leading-relaxed text-on-surface-variant ${
                      isEmbed ? "mb-6 text-left" : "mb-8 text-center md:text-left"
                    }`}
                  >
                    No chat history yet. Pick a starter below or type your own message
                    — the Website agent will reply here.
                  </p>
                  <AiPipelineChatStarterPrompts embed={isEmbed} />
                </div>
              </div>
            </motion.div>
          ) : (
            <AiPipelineChatMessages messages={messages} />
          )}
        </div>
      </div>
      {!hideComposer && <AiPipelineChatComposerBar embed={isEmbed} />}
      {!isEmbed ? (
        <AiPipelineNewChatDialog
          open={newChatOpen}
          compact={false}
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
      ) : null}
    </section>
  );
}
