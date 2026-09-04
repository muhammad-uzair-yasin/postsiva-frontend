"use client";

import { motion } from "framer-motion";
import { ArrowUp, Loader2, RotateCcw, X } from "lucide-react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  type KeyboardEvent,
  type ReactElement,
  type RefObject,
} from "react";

import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";
import { AgentThinkingIndicator } from "@/lib/ui/AgentThinkingIndicator";
import { useTypewriter } from "@/lib/ui/useTypewriter";
import type { VoiceState } from "@/lib/ui/useVoiceRecorder";

import type { ChatMessage, PersistedSession } from "./session";

function renderMarkdown(text: string): ReactElement {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ children, href }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-sky-300 underline decoration-[#0058bc]/60 underline-offset-2 transition-colors hover:text-sky-200"
          >
            {children}
          </a>
        ),
        p: ({ children }) => <p className="my-1 first:mt-0 last:mb-0">{children}</p>,
        ul: ({ children }) => <ul className="my-1 list-disc space-y-1 pl-5">{children}</ul>,
        ol: ({ children }) => <ol className="my-1 list-decimal space-y-1 pl-5">{children}</ol>,
        strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
      }}
    >
      {text}
    </ReactMarkdown>
  );
}

function AssistantBubble({
  msg,
  reduceMotion,
  animate,
}: {
  msg: ChatMessage;
  reduceMotion: boolean | null;
  animate: boolean;
}): ReactElement {
  const shouldStream = animate && !reduceMotion;
  const { displayed, done } = useTypewriter(msg.content, shouldStream);
  const visible = shouldStream ? displayed : msg.content;

  return (
    <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white/[0.06] px-4 py-3 text-sm leading-relaxed text-white/85 ring-1 ring-white/[0.06]">
      {renderMarkdown(visible)}
      {!done && shouldStream ? (
        <span
          className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[1px] animate-pulse rounded-sm bg-sky-400 align-middle"
          aria-hidden
        />
      ) : null}
    </div>
  );
}

export type LandingAssistantChatPanelProps = {
  reduceMotion: boolean | null;
  session: PersistedSession;
  animatedMessageId: string | null;
  draft: string;
  setDraft: (value: string) => void;
  sending: boolean;
  error: string | null;
  voiceState: VoiceState;
  elapsedLabel: string;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  onClose: () => void;
  onClear: () => void;
  onSend: () => void;
  onToggleRecording: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
};

export function LandingAssistantChatPanel({
  reduceMotion,
  session,
  animatedMessageId,
  draft,
  setDraft,
  sending,
  error,
  voiceState,
  elapsedLabel,
  messagesEndRef,
  inputRef,
  onClose,
  onClear,
  onSend,
  onToggleRecording,
  onKeyDown,
}: LandingAssistantChatPanelProps): ReactElement {
  const { t } = usePublicTranslations();

  const placeholder =
    voiceState === "recording"
      ? t("marketing.assistantRecording", { elapsed: elapsedLabel })
      : voiceState === "transcribing"
        ? t("marketing.assistantTranscribing")
        : t("marketing.assistantPlaceholder");

  const micAria =
    voiceState === "recording"
      ? t("marketing.assistantStopRecording", { elapsed: elapsedLabel })
      : voiceState === "transcribing"
        ? t("marketing.assistantTranscribing")
        : t("marketing.assistantStartVoice");

  return (
    <motion.div
      initial={reduceMotion ? {} : { opacity: 0, scale: 0.95, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 16 }}
      transition={{ type: "spring", stiffness: 420, damping: 34 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="landing-assistant-title"
      className="fixed bottom-[5.75rem] right-5 z-[126] flex h-[min(78vh,640px)] w-[min(100vw-1.25rem,26rem)] flex-col overflow-hidden rounded-2xl border border-white/12 bg-[#0f1117] shadow-[0_28px_90px_-14px_rgba(0,0,0,0.85),0_0_0_1px_rgba(0,88,188,0.12)_inset] sm:bottom-[7.25rem] sm:right-6"
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/[0.08] bg-gradient-to-r from-[#13151f]/98 via-[#13151f]/95 to-[#0f1117]/90 px-4 py-3 backdrop-blur-xl">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#0058bc]/40 to-transparent"
          aria-hidden
        />
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full">
            <Image
              src="/images/new_piva1.png"
              alt={t("marketing.assistantAlt")}
              width={32}
              height={32}
              className="h-full w-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <p
              id="landing-assistant-title"
              className="truncate text-sm font-bold tracking-tight text-white"
            >
              {t("marketing.assistantTitle")}
            </p>
            <p className="truncate text-[10px] text-white/40">
              {t("marketing.assistantSubtitle")}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={onClear}
            disabled={sending}
            className="rounded-xl p-2 text-white/40 transition-colors hover:bg-white/5 hover:text-white/70 disabled:opacity-40"
            title={t("marketing.assistantClear")}
            aria-label={t("marketing.assistantClear")}
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-white/40 transition-colors hover:bg-red-500/10 hover:text-red-400"
            aria-label={t("marketing.assistantClose")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
        {session.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && msg.content === "" ? (
              <div className="flex max-w-[85%] items-center rounded-2xl rounded-tl-sm bg-white/[0.06] px-4 py-3 text-sm text-white/60 ring-1 ring-white/[0.06]">
                <AgentThinkingIndicator />
              </div>
            ) : msg.role === "user" ? (
              <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-[#0058bc]/85 px-4 py-2.5 text-sm leading-relaxed text-white shadow-sm ring-1 ring-[#0058bc]/30">
                {msg.content}
              </div>
            ) : (
              <AssistantBubble
                msg={msg}
                reduceMotion={reduceMotion ?? false}
                animate={msg.id === animatedMessageId}
              />
            )}
          </div>
        ))}

        {error ? (
          <div className="rounded-xl bg-red-500/10 px-4 py-2.5 text-xs text-red-400 ring-1 ring-red-500/20">
            {error}
          </div>
        ) : null}

        <div ref={messagesEndRef} />
      </div>

      <div className="shrink-0 border-t border-white/[0.08] bg-[#0f1117] px-3 py-3">
        <div className="flex items-end gap-2 rounded-xl bg-white/[0.05] px-3 py-2 ring-1 ring-white/[0.08] focus-within:ring-[#0058bc]/40">
          <textarea
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            rows={1}
            disabled={
              sending ||
              voiceState === "recording" ||
              voiceState === "transcribing"
            }
            className="min-h-[1.5rem] flex-1 resize-none bg-transparent text-sm text-white placeholder-white/30 outline-none disabled:opacity-50"
            style={{ maxHeight: "6rem" }}
            aria-label={t("marketing.assistantInputAria")}
          />
          <button
            type="button"
            onClick={onToggleRecording}
            disabled={sending || voiceState === "transcribing"}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all disabled:opacity-40 ${
              voiceState === "recording"
                ? "animate-pulse bg-red-500 text-white"
                : voiceState === "transcribing"
                  ? "bg-white/10 text-white/60"
                  : "text-white/40 hover:bg-white/10 hover:text-white/70"
            }`}
            aria-label={micAria}
          >
            {voiceState === "transcribing" ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : voiceState === "recording" ? (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm-1 17.93V21h2v-2.07A8.001 8.001 0 0 0 20 11h-2a6 6 0 0 1-12 0H4a8.001 8.001 0 0 0 7 7.93z" />
              </svg>
            )}
          </button>
          <button
            type="button"
            onClick={onSend}
            disabled={!draft.trim() || sending}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0058bc] text-white shadow-sm transition-all hover:bg-[#004a9e] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={t("marketing.assistantSend")}
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <ArrowUp className="h-4 w-4" aria-hidden />
            )}
          </button>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-white/20">
          {t("marketing.assistantFooter")}
        </p>
      </div>
    </motion.div>
  );
}
