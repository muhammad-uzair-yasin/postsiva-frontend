"use client";

import { marketingImageContentManager } from "@/components/marketing/productScreens/contentManager";
import { marketingImagePostComposer } from "@/components/marketing/productScreens/postComposer";
import { marketingImageWorkspaces } from "@/components/marketing/productScreens/workspaces";
import { fadeUp, staggerContainer } from "@/components/marketing/motion-variants";
import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";
import { SocialPlatformIcon } from "@/lib/social/SocialPlatformIcon";
import type { SocialPlatformIconId } from "@/lib/social/socialPlatformIconSrc";
import { motion } from "framer-motion";
import { Plug, Rocket, Wand2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { StaticImageData } from "next/image";
import Image from "next/image";

const CONNECT_PREVIEW_PLATFORMS: readonly SocialPlatformIconId[] = [
  "linkedin",
  "facebook",
  "instagram",
  "tiktok",
  "youtube",
  "bluesky",
];

export function HowItWorksUnified(): React.ReactElement {
  const { t } = usePublicTranslations();

  const steps: readonly {
    title: string;
    body: string;
    icon: LucideIcon;
    hue: string;
    screen: StaticImageData;
  }[] = [
    {
      title: t("marketing.howStep1Title"),
      body: t("marketing.howStep1Body"),
      icon: Plug,
      hue: "from-primary/40 to-primary/5",
      screen: marketingImageWorkspaces,
    },
    {
      title: t("marketing.howStep2Title"),
      body: t("marketing.howStep2Body"),
      icon: Wand2,
      hue: "from-secondary/35 to-secondary/5",
      screen: marketingImagePostComposer,
    },
    {
      title: t("marketing.howStep3Title"),
      body: t("marketing.howStep3Body"),
      icon: Rocket,
      hue: "from-cyan-400/25 to-primary/10",
      screen: marketingImageContentManager,
    },
  ];

  return (
    <section id="how-it-works" className="relative scroll-mt-28 overflow-hidden py-28">
      <div className="marketing-section-aurora pointer-events-none absolute inset-0 opacity-50" />
      <div className="marketing-container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="mx-auto max-w-2xl text-center"
        >
          <motion.p
            variants={fadeUp}
            custom={0}
            className="text-xs font-black uppercase tracking-[0.28em] text-secondary"
          >
            {t("marketing.howEyebrow")}
          </motion.p>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="mt-4 text-3xl font-black text-on-surface sm:text-4xl md:text-[2.65rem] md:leading-tight"
          >
            {t("marketing.howTitle")}
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="mt-4 text-on-surface-variant">
            {t("marketing.howBody")}
          </motion.p>
        </motion.div>

        <div className="relative mx-auto mt-14 max-w-5xl md:mt-16">
          <div
            aria-hidden
            className="absolute left-[8%] right-[8%] top-[1.375rem] hidden h-0.5 bg-gradient-to-r from-primary/40 via-secondary/30 to-primary/40 md:block"
          />
          <div className="grid gap-6 md:grid-cols-3 md:items-stretch md:gap-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 * i }}
                className="relative mx-auto flex h-full w-full max-w-[300px] flex-col md:max-w-none"
              >
                <motion.div
                  className="relative z-10 mx-auto mb-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-container-high text-base font-black text-primary ring-2 ring-primary/40 shadow-[0_0_28px_-8px_rgba(107,73,216,0.5)] md:mb-5"
                  whileHover={{ scale: 1.08 }}
                  transition={{ type: "spring", stiffness: 400, damping: 18 }}
                >
                  {i + 1}
                </motion.div>
                <div
                  className={`relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b ${step.hue} to-surface-container-low/95 p-5 shadow-xl backdrop-blur-md sm:p-5 md:rounded-3xl`}
                >
                  <div className="marketing-card-shine rounded-2xl opacity-30 md:rounded-3xl" />
                  <div className="relative z-10 flex min-h-0 flex-1 flex-col">
                    <div className="inline-flex shrink-0 rounded-xl bg-surface-container-high/90 p-2 text-primary ring-1 ring-white/10">
                      <step.icon className="h-5 w-5" strokeWidth={2.2} />
                    </div>
                    <h3 className="mt-4 shrink-0 text-base font-black text-on-surface sm:text-lg">
                      {step.title}
                    </h3>
                    <p className="mt-2 flex-1 text-xs leading-relaxed text-on-surface-variant sm:text-[0.8125rem]">
                      {step.body}
                    </p>
                    <div className="relative mt-3 w-full shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#0c0e14] p-1 ring-1 ring-white/[0.06] sm:p-1">
                      <Image
                        src={step.screen}
                        alt=""
                        width={step.screen.width}
                        height={step.screen.height}
                        className="block h-auto w-full rounded-md"
                        sizes="(max-width:768px) 100vw, 280px"
                        placeholder="blur"
                      />
                    </div>
                    <div className="mt-3 flex min-h-0 flex-wrap content-start gap-1.5 border-t border-white/10 pt-3 md:min-h-[2.75rem]">
                      {i === 0
                        ? CONNECT_PREVIEW_PLATFORMS.map((pid) => (
                            <span
                              key={pid}
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container-high/80 ring-1 ring-white/10"
                            >
                              <SocialPlatformIcon
                                platform={pid}
                                className="h-4 w-4"
                                alt=""
                              />
                            </span>
                          ))
                        : null}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
