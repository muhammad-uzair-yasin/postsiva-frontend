"use client";

import { motion, useReducedMotion } from "framer-motion";

import { useTypewriter } from "@/lib/ui/useTypewriter";
import { formatAgentChannelLabel } from "../_utils/formatAgentChannelLabel";
import { AiPipelineMarkdownContent } from "./AiPipelineMarkdownContent";

interface AiPipelineAiDeliveredMessageProps {
  readonly body: string;
  readonly channel?: string;
  /** Live reply from this session (animate in). Archived history uses static card. */
  readonly animate: boolean;
}

export function AiPipelineAiDeliveredMessage({
  body,
  channel,
  animate,
}: AiPipelineAiDeliveredMessageProps): React.ReactElement {
  const reduceMotion = useReducedMotion();
  const shouldStream = animate && !reduceMotion;
  const { displayed, done } = useTypewriter(body, shouldStream);
  const visibleBody = shouldStream ? displayed : body;

  if (!animate || reduceMotion) {
    return (
      <div className="rounded-2xl rounded-tl-sm bg-white/[0.06] p-5 ring-1 ring-white/[0.06]">
        {channel ? (
          <div className="mb-2">
            <span className="inline-flex max-w-full items-center rounded-md border border-outline-variant/25 bg-surface-container-high px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-secondary">
              {formatAgentChannelLabel(channel)}
            </span>
          </div>
        ) : null}
        <AiPipelineMarkdownContent content={body} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl rounded-tl-sm bg-white/[0.06] p-5 ring-1 ring-white/[0.06]"
    >
      {channel ? (
        <motion.div
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.08, duration: 0.25 }}
          className="mb-2"
        >
          <span className="inline-flex max-w-full items-center rounded-md border border-outline-variant/25 bg-surface-container-high px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-secondary">
            {formatAgentChannelLabel(channel)}
          </span>
        </motion.div>
      ) : null}
      <div className="min-w-0">
        <AiPipelineMarkdownContent content={visibleBody} />
        {!done ? (
          <span
            className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[1px] animate-pulse rounded-sm bg-secondary align-middle"
            aria-hidden
          />
        ) : null}
      </div>
    </motion.div>
  );
}
