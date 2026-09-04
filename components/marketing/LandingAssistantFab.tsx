"use client";

/**
 * Postsiva Assistant — public landing page chat FAB.
 *
 * - No auth required. Calls POST /public/postsiva-assistant/chat.
 * - Session (sessionId + messages) persists in localStorage across page refreshes.
 * - Appears immediately on page load (no trigger delay).
 * - Same FAB visual pattern as PIVA (post-login), distinct branding.
 */

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactElement,
} from "react";

import {
  postLandingAssistantChat,
  transcribeLandingAudio,
  type LandingAssistantHistoryMessage,
} from "@/lib/landingAssistant/landingAssistantApi";
import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";
import { useVoiceRecorder } from "@/lib/ui/useVoiceRecorder";

import { LandingAssistantChatPanel } from "./landingAssistant/LandingAssistantChatPanel";
import {
  generateSessionId,
  loadSession,
  makeWelcomeMessage,
  saveSession,
  updateWelcomeInSession,
  type ChatMessage,
  type PersistedSession,
} from "./landingAssistant/session";

export function LandingAssistantFab(): ReactElement {
  const { t } = usePublicTranslations();
  const welcomeText = t("marketing.assistantWelcome");
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<PersistedSession>(() =>
    loadSession(welcomeText),
  );
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [animatedMessageId, setAnimatedMessageId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dragged = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const sessionRef = useRef(session);
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    setSession((prev) => updateWelcomeInSession(prev, welcomeText));
  }, [welcomeText]);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [session.messages, open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [open]);

  useEffect(() => {
    saveSession(session, welcomeText);
  }, [session, welcomeText]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent): void => {
      if (e.key === "Escape") {
        setAnimatedMessageId(null);
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const clearSession = useCallback((): void => {
    const fresh: PersistedSession = {
      sessionId: generateSessionId(),
      messages: [makeWelcomeMessage(welcomeText)],
    };
    setSession(fresh);
    setAnimatedMessageId(null);
    setError(null);
  }, [welcomeText]);

  const sendText = useCallback(
    async (text: string): Promise<void> => {
      if (!text.trim() || sending) return;
      setDraft(text);
      await Promise.resolve();
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text,
      };
      const pendingId = `pending-${Date.now()}`;
      const pendingMsg: ChatMessage = {
        id: pendingId,
        role: "assistant",
        content: "",
      };
      setSession((prev) => ({
        ...prev,
        messages: [...prev.messages, userMsg, pendingMsg],
      }));
      setDraft("");
      setSending(true);
      setError(null);
      const currentSession = sessionRef.current;
      const history: LandingAssistantHistoryMessage[] = currentSession.messages
        .filter((m) => m.id !== "welcome" && m.id !== pendingId)
        .map((m) => ({ role: m.role, content: m.content }));
      try {
        const res = await postLandingAssistantChat({
          message: text,
          history,
          session_id: currentSession.sessionId,
        });
        const assistantMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: res.response,
        };
        setAnimatedMessageId(assistantMsg.id);
        setSession((prev) => ({
          ...prev,
          messages: [
            ...prev.messages.filter((m) => m.id !== pendingId),
            assistantMsg,
          ],
        }));
      } catch (err) {
        setSession((prev) => ({
          ...prev,
          messages: prev.messages.filter((m) => m.id !== pendingId),
        }));
        setError(
          err instanceof Error
            ? err.message
            : t("marketing.assistantError"),
        );
      } finally {
        setSending(false);
      }
    },
    [sending, t],
  );

  const voice = useVoiceRecorder({
    transcribe: transcribeLandingAudio,
    onTranscript: (text) => {
      void sendText(text);
    },
  });

  const elapsedLabel = `${Math.floor(voice.elapsed / 60)}:${String(voice.elapsed % 60).padStart(2, "0")}`;

  const send = useCallback(async (): Promise<void> => {
    await sendText(draft);
  }, [draft, sendText]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>): void => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        void send();
      }
    },
    [send],
  );

  return (
    <>
      {open ? (
        <button
          type="button"
          aria-label={t("marketing.assistantCloseBackdrop")}
          className="fixed inset-0 z-[124] bg-black/40 backdrop-blur-[2px]"
          onClick={() => {
            setAnimatedMessageId(null);
            setOpen(false);
          }}
        />
      ) : null}

      {open ? (
        <LandingAssistantChatPanel
          reduceMotion={reduceMotion}
          session={session}
          animatedMessageId={animatedMessageId}
          draft={draft}
          setDraft={setDraft}
          sending={sending}
          error={error}
          voiceState={voice.state}
          elapsedLabel={elapsedLabel}
          messagesEndRef={messagesEndRef}
          inputRef={inputRef}
          onClose={() => {
            setAnimatedMessageId(null);
            setOpen(false);
          }}
          onClear={clearSession}
          onSend={() => void send()}
          onToggleRecording={() => voice.toggleRecording()}
          onKeyDown={handleKeyDown}
        />
      ) : null}

      {!open ? (
        <motion.div
          drag
          dragMomentum={false}
          dragElastic={0}
          onDragStart={() => {
            dragged.current = true;
          }}
          onDragEnd={() => {
            setTimeout(() => {
              dragged.current = false;
            }, 100);
          }}
          className="group fixed bottom-5 right-5 z-[130] cursor-grab active:cursor-grabbing sm:bottom-6 sm:right-6"
          whileDrag={{ scale: 1.1 }}
          whileHover={{ scale: 1.08 }}
          animate={
            reduceMotion
              ? {}
              : {
                  y: [0, -6, 0],
                }
          }
          transition={{
            y: { repeat: Infinity, duration: 3, ease: "easeInOut" },
          }}
        >
          <div
            role="tooltip"
            className="pointer-events-none absolute bottom-[calc(100%+0.5rem)] right-0 z-0 w-max max-w-[min(16rem,calc(100vw-2rem))] rounded-2xl border border-white/12 bg-[#13151f]/95 px-3.5 py-2.5 text-[11px] leading-snug text-white opacity-0 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.65)] backdrop-blur-md transition-opacity duration-200 ease-out group-hover:opacity-100 group-focus-within:opacity-100 sm:text-xs"
          >
            <p className="text-[10px] font-bold uppercase tracking-wide text-sky-400">
              {t("marketing.assistantTitle")}
            </p>
            <p className="mt-1 text-white/60">
              {t("marketing.assistantSubtitle")}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!dragged.current) {
                setAnimatedMessageId(null);
                setOpen(true);
              }
            }}
            className="landing-assistant-fab-btn relative z-[1] flex h-16 w-16 items-center justify-center rounded-full border-2 p-1.5 text-white transition-transform hover:scale-[1.04] active:scale-[0.97] sm:h-20 sm:w-20 sm:p-2.5"
            aria-label={t("marketing.assistantOpen")}
          >
            <span className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full">
              <Image
                src="/images/new_piva1.png"
                alt=""
                width={256}
                height={256}
                className="max-h-full max-w-full object-contain object-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
                sizes="(max-width: 640px) 80px, 96px"
              />
            </span>
          </button>
        </motion.div>
      ) : null}
    </>
  );
}
