"use client";

import {
  LANDING_INTEGRATION_CHANNELS,
  LANDING_INTEGRATION_FIELD_ICONS,
  LANDING_INTEGRATION_TOOLS,
} from "@/components/marketing/landingIntegrations";
import { fadeUp, staggerContainer } from "@/components/marketing/motion-variants";
import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const SIZE_CLASS = {
  sm: "h-11 w-11 sm:h-12 sm:w-12",
  md: "h-14 w-14 sm:h-16 sm:w-16",
  lg: "h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem]",
} as const;

const ICON_PAD = {
  sm: "p-2",
  md: "p-2.5",
  lg: "p-3",
} as const;

export function IntegrationsUnified(): React.ReactElement {
  const { t } = usePublicTranslations();
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="integrations"
      className="relative scroll-mt-28 overflow-hidden border-y border-white/[0.06] py-20 lg:py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in srgb, var(--color-outline-variant) 28%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--color-outline-variant) 28%, transparent) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 45%, black 20%, transparent 75%)",
        }}
      />
      <div className="marketing-section-aurora pointer-events-none absolute inset-0 opacity-30" />

      <div className="marketing-container relative">
        <div className="relative mx-auto min-h-[22rem] max-w-5xl sm:min-h-[26rem] lg:min-h-[30rem]">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            {LANDING_INTEGRATION_FIELD_ICONS.map((icon, index) => (
              <motion.div
                key={icon.id}
                initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.45,
                  delay: reduceMotion ? 0 : 0.04 * index,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 ${
                  icon.hideOnMobile ? "hidden md:block" : ""
                }`}
                style={{ left: icon.left, top: icon.top }}
              >
                <span
                  className={`flex ${SIZE_CLASS[icon.size]} ${ICON_PAD[icon.size]} items-center justify-center rounded-2xl border border-white/12 bg-surface-container-high/90 shadow-[0_12px_40px_-18px_rgba(0,0,0,0.85)] ring-1 ring-white/[0.04] backdrop-blur-sm`}
                >
                  <img
                    src={icon.src}
                    alt=""
                    className="h-full w-full object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                </span>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerContainer}
            className="relative z-10 flex h-full min-h-[22rem] flex-col items-center justify-center px-4 text-center sm:min-h-[26rem] lg:min-h-[30rem]"
          >
            <motion.p
              variants={fadeUp}
              custom={0}
              className="text-xs font-black uppercase tracking-[0.28em] text-secondary"
            >
              {t("marketing.integrationsEyebrow")}
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="mt-4 max-w-2xl text-balance font-[family-name:var(--font-headline)] text-3xl font-black tracking-tight text-on-surface sm:text-4xl md:text-[2.75rem] md:leading-tight"
            >
              {t("marketing.integrationsTitle")}
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="mt-5 max-w-lg text-base text-on-surface-variant sm:text-lg"
            >
              {t("marketing.integrationsBody")}
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="mt-8">
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-secondary px-8 py-3.5 text-sm font-bold text-on-primary shadow-xl shadow-primary/25 transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {t("marketing.integrationsCta")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-10 border-t border-white/[0.06] pt-12 md:grid-cols-[1.4fr_1fr] md:gap-14">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/80">
              {t("marketing.integrationsChannelsLabel")}
            </p>
            <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
              {LANDING_INTEGRATION_CHANNELS.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-2.5 text-sm font-semibold text-on-surface"
                >
                  <img
                    src={item.src}
                    alt=""
                    className="h-5 w-5 shrink-0 object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/80">
              {t("marketing.integrationsToolsLabel")}
            </p>
            <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3">
              {LANDING_INTEGRATION_TOOLS.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-2.5 text-sm font-semibold text-on-surface"
                >
                  <img
                    src={item.src}
                    alt=""
                    className="h-5 w-5 shrink-0 object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
