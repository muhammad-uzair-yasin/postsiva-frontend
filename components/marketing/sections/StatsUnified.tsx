"use client";

import { marketingImageDashboard } from "@/components/marketing/productScreens/dashboard";
import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";
import { SocialPlatformIcon } from "@/lib/social/SocialPlatformIcon";
import type { SocialPlatformIconId } from "@/lib/social/socialPlatformIconSrc";
import { motion } from "framer-motion";
import { Activity, CalendarClock, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";

type StatCard =
  | {
      value: string;
      label: string;
      sub: string;
      networkStrip: readonly SocialPlatformIconId[];
      icon?: undefined;
    }
  | {
      value: string;
      label: string;
      sub: string;
      icon: LucideIcon;
      networkStrip?: undefined;
    };

const NETWORK_STRIP: readonly SocialPlatformIconId[] = [
  "linkedin",
  "facebook",
  "instagram",
  "tiktok",
  "youtube",
  "threads",
  "pinterest",
  "bluesky",
];

export function StatsUnified(): React.ReactElement {
  const { t } = usePublicTranslations();

  const stats: readonly StatCard[] = [
    {
      value: "7+",
      label: t("marketing.statsNetworksLabel"),
      sub: t("marketing.statsNetworksSub"),
      networkStrip: NETWORK_STRIP,
    },
    {
      value: "1",
      label: t("marketing.statsWorkspaceLabel"),
      sub: t("marketing.statsWorkspaceSub"),
      icon: Sparkles,
    },
    {
      value: "∞",
      label: t("marketing.statsAiPassesLabel"),
      sub: t("marketing.statsAiPassesSub"),
      icon: Activity,
    },
    {
      value: "24/7",
      label: t("marketing.statsScheduleLabel"),
      sub: t("marketing.statsScheduleSub"),
      icon: CalendarClock,
    },
  ];

  return (
    <section id="stats" className="relative scroll-mt-28 overflow-hidden py-24">
      <div className="marketing-section-aurora pointer-events-none absolute inset-0 opacity-70" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(107,73,216,0.08)_0%,_transparent_65%)]" />
      <div className="marketing-container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          <p className="text-xs font-black uppercase tracking-[0.28em] text-secondary">
            {t("marketing.statsEyebrow")}
          </p>
          <h2 className="mt-4 text-3xl font-black text-on-surface sm:text-4xl md:text-[2.5rem] md:leading-tight">
            {t("marketing.statsTitlePrefix")}{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t("marketing.statsTitleAccent")}
            </span>
          </h2>
          <p className="mt-4 text-on-surface-variant">{t("marketing.statsBody")}</p>
        </motion.div>
        <div className="mt-12 grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="relative mx-auto w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-[#0c0e14] shadow-2xl ring-1 ring-white/[0.06] lg:mx-0 lg:max-w-none">
            <div className="relative w-full p-1 sm:p-1.5">
              <Image
                src={marketingImageDashboard}
                alt={t("marketing.statsDashboardImageAlt")}
                width={marketingImageDashboard.width}
                height={marketingImageDashboard.height}
                className="block h-auto w-full rounded-lg"
                sizes="(max-width: 1024px) 100vw, 50vw"
                placeholder="blur"
              />
            </div>
            <p className="border-t border-white/10 px-4 py-3 text-center text-xs text-on-surface-variant">
              {t("marketing.statsDashboardCaption")}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 36, scale: 0.94 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: 0.06 * i, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -10, transition: { type: "spring", stiffness: 380, damping: 22 } }}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-surface-container/75 p-6 text-center shadow-[0_28px_70px_-32px_rgba(0,0,0,0.9)] backdrop-blur-md"
              >
                <div className="marketing-card-shine rounded-3xl opacity-40" />
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/20 blur-2xl transition-transform duration-500 group-hover:scale-150" />
                <div className="relative z-10">
                  {s.networkStrip ? (
                    <div className="mx-auto flex max-w-[210px] flex-wrap items-center justify-center gap-1.5 rounded-xl bg-gradient-to-br from-primary/30 to-secondary/15 px-2 py-2 ring-1 ring-white/10 sm:max-w-[240px]">
                      {s.networkStrip.map((pid) => (
                        <SocialPlatformIcon
                          key={pid}
                          platform={pid}
                          className="h-6 w-6 sm:h-7 sm:w-7"
                          alt=""
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-secondary/15 text-primary ring-1 ring-white/10">
                      <s.icon className="h-5 w-5" strokeWidth={2.2} />
                    </div>
                  )}
                  <p className="mt-5 text-3xl font-black text-primary sm:text-4xl md:text-5xl">
                    {s.value}
                  </p>
                  <p className="mt-2 text-sm font-bold text-on-surface">{s.label}</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
                    {s.sub}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
