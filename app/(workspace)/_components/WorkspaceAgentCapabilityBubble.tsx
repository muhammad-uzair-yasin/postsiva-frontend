"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ReactElement } from "react";

interface WorkspaceAgentCapabilityBubbleProps {
  message: string | null;
  reduceMotion: boolean | null;
  /** When FAB is near the top edge, show the tip below instead of above. */
  preferBelow?: boolean;
}

/** Renders on the FAB — parent must be the positioned FAB root / motion wrapper. */
export function WorkspaceAgentCapabilityBubble({
  message,
  reduceMotion,
  preferBelow = false,
}: WorkspaceAgentCapabilityBubbleProps): ReactElement | null {
  const show = Boolean(message);

  return (
    <AnimatePresence mode="wait">
      {show && message ? (
        <motion.div
          key={message}
          role="status"
          aria-live="polite"
          initial={
            reduceMotion
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: preferBelow ? -10 : 10 }
          }
          animate={{ opacity: 1, y: 0 }}
          exit={
            reduceMotion
              ? { opacity: 0 }
              : { opacity: 0, y: preferBelow ? -6 : 6 }
          }
          transition={{ duration: reduceMotion ? 0 : 0.18 }}
          className={`pointer-events-none absolute right-0 z-[2] w-max max-w-[min(19rem,calc(100vw-2.75rem))] rounded-2xl border border-white/12 bg-surface-container-high/95 px-3.5 py-2.5 text-[11px] leading-snug text-on-surface shadow-[0_12px_40px_-8px_rgba(0,0,0,0.65)] backdrop-blur-md sm:text-xs ${
            preferBelow
              ? "top-[calc(100%+0.75rem)]"
              : "bottom-[calc(100%+0.75rem)]"
          }`}
        >
          <span
            className={`absolute right-6 h-3 w-3 rotate-45 border-white/12 bg-surface-container-high/95 ${
              preferBelow
                ? "-top-1.5 border-l border-t"
                : "-bottom-1.5 border-b border-r"
            }`}
            aria-hidden
          />
          <p className="font-headline text-[10px] font-bold uppercase tracking-wide text-secondary">
            Piva — Your AI Companion
          </p>
          <p className="mt-1 text-on-surface-variant">{message}</p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
