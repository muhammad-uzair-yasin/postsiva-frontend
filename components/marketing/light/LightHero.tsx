"use client";

import Link from "next/link";
import { ArrowRight, Rocket } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { fadeUp, staggerContainer } from "@/components/marketing/motion-variants";
import { LightHeroWindowVisual } from "@/components/marketing/light/LightHeroWindowVisual";
import { lightSectionClass } from "@/components/marketing/light/light-layout";
import {
  marketingHeroBg,
  marketingHeroPanel,
  marketingNavSurfaceSoft,
} from "@/components/marketing/light/light-tokens";
import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";
import { cn } from "@/lib/cn";

function WindowTitleBar(): React.ReactElement {
  return (
    <div
      className={cn(
        "flex items-center gap-3 border-b px-4 py-3 sm:px-6",
        marketingNavSurfaceSoft,
      )}
    >
      <div className="flex items-center gap-1.5" aria-hidden>
        <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
      </div>
      <p className="flex-1 truncate text-center text-xs font-bold tracking-wide text-slate-200 sm:text-sm">
        Postsiva Workspace — Your social command center
      </p>
      <span className="hidden w-[52px] sm:block" aria-hidden />
    </div>
  );
}

export function LightHero(): React.ReactElement {
  const { t } = usePublicTranslations();
  const reduceMotion = useReducedMotion();

  return (
    <div className={cn("relative overflow-hidden pb-20 pt-32 sm:pb-24 sm:pt-36 lg:min-h-[96vh] lg:pb-28 lg:pt-40", marketingHeroBg)}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(0,88,188,0.35),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 top-1/3 h-[420px] w-[420px] rounded-full bg-[#0058bc]/20 blur-3xl"
      />

      <section className={cn("relative z-10", lightSectionClass)}>
        <motion.div
          variants={staggerContainer}
          initial={reduceMotion ? false : "hidden"}
          animate="visible"
        >
          <motion.div
            variants={fadeUp}
            custom={0}
            className={cn("overflow-hidden rounded-3xl backdrop-blur-sm", marketingHeroPanel)}
          >
            <WindowTitleBar />
            <div className="grid gap-12 p-8 sm:p-10 lg:grid-cols-2 lg:items-center lg:gap-16 lg:p-14 xl:p-20">
              <div>
                <motion.div
                  variants={fadeUp}
                  custom={1}
                  className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#0058bc]/40 bg-[#0058bc]/15 px-4 py-2"
                >
                  <Rocket className="h-4 w-4 text-sky-400" aria-hidden />
                  <span className="text-xs font-semibold text-sky-300">Social OS v2.0</span>
                </motion.div>

                <motion.h1
                  variants={fadeUp}
                  custom={2}
                  className="max-w-2xl text-balance font-[family-name:var(--font-headline)] text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl"
                >
                  Master your{" "}
                  <span className="bg-gradient-to-r from-[#0058bc] to-sky-400 bg-clip-text text-transparent">
                    social
                  </span>{" "}
                  workflows.
                </motion.h1>

                <motion.p
                  variants={fadeUp}
                  custom={3}
                  className="mt-8 max-w-xl text-lg leading-relaxed text-slate-300 sm:text-xl"
                >
                  {t("marketing.heroLeadShort")}
                </motion.p>

                <motion.div
                  variants={fadeUp}
                  custom={4}
                  className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center"
                >
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0058bc] px-8 py-4 text-base font-semibold text-white shadow-[0_8px_32px_rgba(0,88,188,0.45)] transition-opacity hover:opacity-90"
                  >
                    Get Started
                    <ArrowRight className="h-5 w-5" aria-hidden />
                  </Link>
                  <Link
                    href="/help"
                    className="inline-flex items-center justify-center rounded-xl border border-slate-800 bg-slate-900/90 px-8 py-4 text-base font-semibold text-white transition-colors hover:border-slate-700 hover:bg-slate-900"
                  >
                    View Documentation
                  </Link>
                </motion.div>
              </div>

              <motion.div variants={fadeUp} custom={5} className="lg:min-h-[560px]">
                <LightHeroWindowVisual />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
