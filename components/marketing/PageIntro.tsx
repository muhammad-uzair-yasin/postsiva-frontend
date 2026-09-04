"use client";

import { motion } from "framer-motion";

interface PageIntroProps {
  eyebrow: string;
  title: string;
  description: string;
}

/**
 * Marketing page hero intro. Title stays visible on first paint (no opacity-0
 * entrance) to avoid a blank H1 flash; eyebrow/description may still fade in.
 */
export function PageIntro({
  eyebrow,
  title,
  description,
}: PageIntroProps): React.ReactElement {
  return (
    <div className="marketing-container-narrow pb-12 pt-28 text-center sm:pt-32 md:pt-40">
      <div className="border-b border-outline-variant/10 pb-10">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-xs font-bold uppercase tracking-widest text-secondary"
        >
          {eyebrow}
        </motion.p>
        <h1 className="mt-4 text-4xl font-extrabold text-on-surface sm:text-5xl">
          {title}
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4 text-balance text-on-surface-variant"
        >
          {description}
        </motion.p>
      </div>
    </div>
  );
}
