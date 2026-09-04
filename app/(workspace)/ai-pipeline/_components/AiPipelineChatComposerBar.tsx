"use client";

import { motion } from "framer-motion";
import { type FormEvent, useCallback, useState, type ReactElement } from "react";

import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { transcribeWorkspaceAudio } from "@/lib/userAgentChat/userAgentChatApi";
import { useVoiceRecorder } from "@/lib/ui/useVoiceRecorder";
import { AI_PIPELINE_STARTER_PROMPTS } from "../_constants/aiPipelineStarterPrompts";
import { useAiPipelineChat } from "../_context/AiPipelineChatContext";
import { AiPipelineMediaAttachModal } from "./AiPipelineMediaAttachModal";
import { AiPipelinePendingAttachmentRow } from "./AiPipelinePendingAttachmentRow";

export function AiPipelineChatComposerBar({
  embed = false,
}: {
  embed?: boolean;
}): ReactElement {
  const {
    sending,
    loading,
    clearing,
    draft,
    setDraft,
    send,
    pendingAttachment,
    setPendingAttachment,
  } = useAiPipelineChat();
  const { t } = useTranslations();
  const [mediaModalOpen, setMediaModalOpen] = useState(false);

  const onSubmit = useCallback(
    (e?: FormEvent<HTMLFormElement>): void => {
      e?.preventDefault();
      void send();
    },
    [send],
  );

  const transcribe = useCallback(async (blob: Blob): Promise<string> => {
    const token = getStoredAccessToken();
    const ws = getStoredActiveWorkspaceId();
    if (!token || !ws) throw new Error("Not authenticated.");
    return transcribeWorkspaceAudio(blob, token, ws);
  }, []);

  const voice = useVoiceRecorder({
    transcribe,
    onTranscript: (text) => { void send(text); },
  });

  const busy = sending || loading || clearing;
  const canSend = !busy && (!!draft.trim() || pendingAttachment !== null);

  // Format elapsed seconds as m:ss
  const elapsedLabel = `${Math.floor(voice.elapsed / 60)}:${String(voice.elapsed % 60).padStart(2, "0")}`;

  return (
    <>
      <AiPipelineMediaAttachModal
        open={mediaModalOpen}
        onClose={() => {
          setMediaModalOpen(false);
        }}
        onSelect={setPendingAttachment}
        currentPending={pendingAttachment}
      />
      <div
        className={`relative border-t border-white/[0.08] bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/90 to-transparent backdrop-blur-xl ${
          embed ? "p-3" : "p-6"
        }`}
      >
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent`}
          aria-hidden
        />
        <div className={`mx-auto space-y-4 ${embed ? "max-w-none" : "max-w-4xl"}`}>
          <div className="no-scrollbar -mx-1 flex min-w-0 flex-nowrap gap-2 overflow-x-auto px-1 pb-1">
            {AI_PIPELINE_STARTER_PROMPTS.map((label) => (
              <motion.button
                key={label}
                type="button"
                disabled={sending || clearing}
                whileHover={{ scale: sending || clearing ? 1 : 1.04, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setDraft(label);
                }}
                className="shrink-0 whitespace-nowrap rounded-full border border-outline-variant/20 bg-surface-container-high/95 px-3 py-2 text-left text-[9px] font-bold uppercase leading-snug tracking-widest text-on-surface-variant shadow-sm transition-shadow hover:border-secondary/40 hover:shadow-[0_6px_20px_-8px_rgba(84,220,191,0.35)] hover:text-secondary disabled:opacity-50 sm:px-4 sm:text-[10px] motion-reduce:transform-none"
              >
                {label}
              </motion.button>
            ))}
          </div>
          {pendingAttachment ? (
            <AiPipelinePendingAttachmentRow
              attachment={pendingAttachment}
              onRemove={() => {
                setPendingAttachment(null);
              }}
            />
          ) : null}
          <form onSubmit={onSubmit}>
            <div className="relative">
              <div className="group flex items-center rounded-2xl border border-outline-variant/15 bg-surface-container-lowest/95 p-2 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.55)] ring-1 ring-white/[0.04] transition-[border-color,box-shadow] focus-within:border-primary/35 focus-within:shadow-[0_14px_44px_-14px_rgba(107,73,216,0.35)]">
                <motion.button
                  type="button"
                  className="p-3 text-on-surface-variant transition-colors hover:text-primary disabled:opacity-50"
                  aria-label={t("aiPipeline.addMediaAria")}
                  disabled={sending || loading || clearing}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => {
                    setMediaModalOpen(true);
                  }}
                >
                  <span className="material-symbols-outlined">add_circle</span>
                </motion.button>
                <input
                  value={draft}
                  onChange={(ev) => {
                    setDraft(ev.target.value);
                  }}
                  disabled={busy || voice.state === "recording" || voice.state === "transcribing"}
                  className="min-w-0 flex-1 border-none bg-transparent py-3 text-sm text-on-surface outline-none ring-0 placeholder:text-on-surface-variant/50 focus:border-0 focus:ring-0 disabled:opacity-60"
                  placeholder={
                    voice.state === "recording"
                      ? t("aiPipeline.placeholderRecording", { time: elapsedLabel })
                      : voice.state === "transcribing"
                      ? t("aiPipeline.placeholderTranscribing")
                      : pendingAttachment
                      ? t("aiPipeline.placeholderCaption")
                      : t("aiPipeline.placeholderAsk")
                  }
                  aria-label={t("aiPipeline.messageAria")}
                />
                <div className="flex items-center gap-1 pr-2">
                  {/* Mic button — click to start, click again to stop */}
                  <motion.button
                    type="button"
                    onClick={() => voice.toggleRecording()}
                    disabled={busy || voice.state === "transcribing"}
                    whileHover={{ scale: busy ? 1 : 1.06 }}
                    whileTap={{ scale: 0.94 }}
                    className={`p-3 transition-colors disabled:opacity-50 motion-reduce:transform-none ${
                      voice.state === "recording"
                        ? "animate-pulse text-red-400"
                        : voice.state === "transcribing"
                        ? "text-on-surface-variant/60"
                        : "text-on-surface-variant hover:text-primary"
                    }`}
                    aria-label={
                      voice.state === "recording"
                        ? t("aiPipeline.stopRecordingAria", { time: elapsedLabel })
                        : voice.state === "transcribing"
                        ? t("aiPipeline.placeholderTranscribing")
                        : t("aiPipeline.startRecordingAria")
                    }
                  >
                    <span className="material-symbols-outlined">
                      {voice.state === "recording"
                        ? "stop_circle"
                        : voice.state === "transcribing"
                        ? "hourglass_empty"
                        : "mic"}
                    </span>
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={!canSend}
                    whileHover={{ scale: canSend ? 1.06 : 1 }}
                    whileTap={{ scale: canSend ? 0.95 : 1 }}
                    className="rounded-xl bg-gradient-to-br from-primary-container to-[#5435b8] p-3 text-on-primary-container shadow-lg shadow-primary/30 transition-shadow hover:shadow-[0_0_24px_rgba(107,73,216,0.45)] disabled:opacity-50 motion-reduce:transform-none"
                    aria-label={t("aiPipeline.sendAria")}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {sending ? "hourglass_empty" : "send"}
                    </span>
                  </motion.button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
