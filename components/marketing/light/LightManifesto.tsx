"use client";

import { lightSectionClass } from "@/components/marketing/light/light-layout";
import { cn } from "@/lib/cn";
import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";
import { motion, useReducedMotion } from "framer-motion";

export function LightManifesto(): React.ReactElement {
  const { t } = usePublicTranslations();
  const reduceMotion = useReducedMotion();

  return (
    <section className={cn("relative pb-12 pt-2 text-center sm:pb-16 sm:pt-4", lightSectionClass)}>
      <div
        aria-hidden
        className="pointer-events-none absolute right-[5%] top-8 h-64 w-64 opacity-10 sm:right-[10%] sm:h-[400px] sm:w-[400px]"
      >
        <svg className="h-full w-full" fill="none" stroke="url(#light-manifesto-grad)" strokeWidth="0.5" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="light-manifesto-grad" x1="0%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#1a56db" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="48" />
          <ellipse cx="50" cy="50" rx="24" ry="48" />
          <ellipse cx="50" cy="50" rx="48" ry="24" />
        </svg>
      </div>

      <motion.h2
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mx-auto max-w-[1080px] text-balance font-[family-name:var(--font-headline)] text-3xl font-bold leading-[1.28] tracking-tight text-[#111827] sm:text-4xl lg:text-[3.2rem]"
      >
        {t("marketing.lightManifesto")}
      </motion.h2>
    </section>
  );
}
