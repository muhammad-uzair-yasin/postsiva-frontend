"use client";

import { motion } from "framer-motion";
import type { ReactElement } from "react";

import { AI_PIPELINE_STARTER_PROMPTS } from "../_constants/aiPipelineStarterPrompts";
import { useAiPipelineChat } from "../_context/AiPipelineChatContext";

export function AiPipelineChatStarterPrompts({
  embed,
}: {
  embed: boolean;
}): ReactElement {
  const { send, sending, clearing, error } = useAiPipelineChat();
  const disabled = sending || clearing || error !== null;

  return (
    <div
      className={`space-y-4 ${embed ? "text-left" : "text-center md:text-left"}`}
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-secondary/90">
        Try asking
      </p>
      <div
        className={`flex flex-col gap-2.5 ${embed ? "sm:flex-col" : "sm:flex-row sm:flex-wrap"}`}
      >
        {AI_PIPELINE_STARTER_PROMPTS.map((label, index) => (
          <motion.button
            key={label}
            type="button"
            disabled={disabled}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 380,
              damping: 28,
              delay: Math.min(index * 0.05, 0.35),
            }}
            whileHover={disabled ? undefined : { scale: 1.02, y: -2 }}
            whileTap={disabled ? undefined : { scale: 0.99 }}
            onClick={() => {
              void send(label);
            }}
            className={`group flex items-start gap-3 rounded-2xl border border-outline-variant/20 bg-surface-container-high/90 px-4 py-3.5 text-left shadow-sm ring-1 ring-white/[0.03] transition-shadow hover:border-secondary/35 hover:shadow-[0_10px_28px_-12px_rgba(107,73,216,0.25)] disabled:opacity-50 ${
              embed ? "w-full" : "sm:max-w-md sm:flex-1"
            }`}
          >
            <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-secondary/15 text-sm font-bold text-secondary transition-colors group-hover:bg-secondary/25">
              →
            </span>
            <span className="min-w-0 text-sm font-medium leading-snug text-on-surface transition-colors group-hover:text-secondary">
              {label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
