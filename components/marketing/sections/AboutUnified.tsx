"use client";

import { marketingImageDashboard } from "@/components/marketing/productScreens/dashboard";
import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";
import { motion } from "framer-motion";
import Image from "next/image";
import { HeartHandshake, Orbit, Satellite, type LucideIcon } from "lucide-react";

export function AboutUnified(): React.ReactElement {
  const { t } = usePublicTranslations();

  const pillars: readonly {
    title: string;
    body: string;
    icon: LucideIcon;
  }[] = [
    {
      title: t("marketing.aboutPillar1Title"),
      body: t("marketing.aboutPillar1Body"),
      icon: Orbit,
    },
    {
      title: t("marketing.aboutPillar2Title"),
      body: t("marketing.aboutPillar2Body"),
      icon: Satellite,
    },
    {
      title: t("marketing.aboutPillar3Title"),
      body: t("marketing.aboutPillar3Body"),
      icon: HeartHandshake,
    },
  ];

  return (
    <section className="pb-24">
      <div className="marketing-container">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-primary/10 via-surface-container to-secondary/10 p-8 shadow-2xl md:p-12"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-secondary">
            {t("marketing.aboutStoryEyebrow")}
          </p>
          <h2 className="mt-4 text-3xl font-extrabold text-on-surface sm:text-4xl">
            {t("marketing.aboutStoryTitle")}
          </h2>
          <p className="mt-6 max-w-3xl text-on-surface-variant">
            {t("marketing.aboutStoryBody")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative mt-12 overflow-hidden rounded-[2rem] border border-white/10 bg-[#0c0e14] shadow-2xl"
        >
          <div className="relative w-full p-1 sm:p-1.5">
            <Image
              src={marketingImageDashboard}
              alt={t("marketing.aboutDashboardAlt")}
              width={marketingImageDashboard.width}
              height={marketingImageDashboard.height}
              className="block h-auto w-full rounded-lg"
              sizes="(max-width: 1200px) 100vw, 1152px"
              placeholder="blur"
            />
          </div>
          <p className="border-t border-white/10 px-6 py-4 text-center text-sm text-on-surface-variant">
            {t("marketing.aboutDashboardCaption")}
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {pillars.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.07 * i }}
              className="rounded-3xl border border-white/10 bg-surface-container/85 p-6"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/20 text-secondary">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-on-surface">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{item.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
