"use client";

import { motion } from "framer-motion";

interface AmbientBackgroundProps {
  readonly variant?: "marketing" | "auth";
}

/**
 * Shared soft gradient orbs for marketing and auth shells — pointer-events none, decorative only.
 */
export function AmbientBackground({
  variant = "marketing",
}: AmbientBackgroundProps): React.ReactElement {
  const isAuth = variant === "auth";
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 bg-surface-container-lowest"
      />
      <div
        className={
          isAuth
            ? "absolute -top-32 left-1/2 h-[min(70vh,480px)] w-[min(90vw,520px)] -translate-x-1/2 rounded-full bg-primary/[0.09] blur-3xl"
            : "absolute -top-40 left-1/4 h-[min(85vh,560px)] w-[min(90vw,560px)] -translate-x-1/2 rounded-full bg-primary/[0.12] blur-3xl"
        }
      />
      <div className="absolute bottom-[-10%] right-[-5%] h-80 w-80 rounded-full bg-secondary/[0.10] blur-3xl md:h-96 md:w-96" />
      <div className="absolute top-1/2 left-0 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/[0.06] blur-3xl" />
    </div>
  );
}
