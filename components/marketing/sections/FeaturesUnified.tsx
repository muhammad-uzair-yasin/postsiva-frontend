"use client";

import { FeaturesIntegrationBento } from "@/components/marketing/sections/FeaturesIntegrationBento";
import { fadeUp, staggerContainer } from "@/components/marketing/motion-variants";
import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";
import { motion } from "framer-motion";
import {
  CalendarClock,
  FolderKanban,
  Inbox,
  PenLine,
  Sparkles,
  Waypoints,
  type LucideIcon,
} from "lucide-react";

type CoreFeature = {
  title: string;
  body: string;
  icon: LucideIcon;
  href: string;
};

export function FeaturesUnified(): React.ReactElement {
  const { t } = usePublicTranslations();

  const core: readonly CoreFeature[] = [
    {
      title: t("marketing.featuresCoreComposerTitle"),
      body: t("marketing.featuresCoreComposerBody"),
      icon: PenLine,
      href: "/#compose-preview",
    },
    {
      title: t("marketing.featuresCorePublishTitle"),
      body: t("marketing.featuresCorePublishBody"),
      icon: CalendarClock,
      href: "/#all-in-one",
    },
    {
      title: t("marketing.featuresCoreInboxTitle"),
      body: t("marketing.featuresCoreInboxBody"),
      icon: Inbox,
      href: "/#inbox-auto-comment",
    },
    {
      title: t("marketing.featuresCoreWorkspacesTitle"),
      body: t("marketing.featuresCoreWorkspacesBody"),
      icon: FolderKanban,
      href: "/#choose-workspace",
    },
    {
      title: t("marketing.featuresCorePivaTitle"),
      body: t("marketing.featuresCorePivaBody"),
      icon: Sparkles,
      href: "/#piva-agent",
    },
    {
      title: t("marketing.featuresCoreIntegrationsTitle"),
      body: t("marketing.featuresCoreIntegrationsBody"),
      icon: Waypoints,
      href: "/integrations-explore",
    },
  ];

  return (
    <section id="features" className="relative scroll-mt-28 overflow-hidden py-24 lg:py-28">
      <div className="marketing-section-aurora pointer-events-none absolute inset-0 opacity-70" />
      <div className="marketing-container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.p
            variants={fadeUp}
            custom={0}
            className="text-xs font-black uppercase tracking-[0.25em] text-secondary"
          >
            {t("marketing.featuresEyebrow")}
          </motion.p>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="mt-5 text-3xl font-black tracking-tight text-on-surface sm:text-4xl md:text-[2.75rem] md:leading-tight"
          >
            {t("marketing.featuresTitlePrefix")}{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t("marketing.featuresTitleAccent")}
            </span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={2}
            className="mt-5 text-base text-on-surface-variant sm:text-lg"
          >
            {t("marketing.featuresBody")}
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={staggerContainer}
          className="mt-14"
        >
          <motion.p
            variants={fadeUp}
            custom={0}
            className="mb-5 text-[11px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/75"
          >
            {t("marketing.featuresCoreLabel")}
          </motion.p>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {core.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.li key={item.title} variants={fadeUp} custom={i + 1}>
                  <a
                    href={item.href}
                    className="group flex h-full gap-3.5 rounded-2xl border border-white/10 bg-surface-container-lowest/40 px-4 py-4 transition-[border-color,background-color] duration-300 hover:border-primary/30 hover:bg-surface-container-low/60 sm:px-5 sm:py-5"
                  >
                    <span
                      className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-white/10 bg-white/[0.04] text-on-surface/85 transition-colors group-hover:border-primary/30 group-hover:bg-primary/12 group-hover:text-primary"
                      aria-hidden
                    >
                      <Icon className="h-[18px] w-[18px]" strokeWidth={2} absoluteStrokeWidth />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[15px] font-semibold text-on-surface">
                        {item.title}
                      </span>
                      <span className="mt-1.5 block text-sm leading-snug text-on-surface-variant">
                        {item.body}
                      </span>
                    </span>
                  </a>
                </motion.li>
              );
            })}
          </ul>
        </motion.div>

        <FeaturesIntegrationBento />
      </div>
    </section>
  );
}
