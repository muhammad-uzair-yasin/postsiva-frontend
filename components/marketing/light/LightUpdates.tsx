"use client";

import { cn } from "@/lib/cn";
import { lightSectionClass } from "@/components/marketing/light/light-layout";
import { fadeUp, staggerContainer } from "@/components/marketing/motion-variants";
import { LIGHT_UPDATE_IMAGES } from "@/components/marketing/light/light-images";
import { LightScreenshotFrame } from "@/components/marketing/light/LightScreenshotFrame";
import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

const UPDATES = [
  {
    href: "/features",
    imageKey: "features" as const,
    tagKey: "marketing.lightUpdateFeaturesTag",
    titleKey: "marketing.navFeatures",
    descKey: "marketing.featuresSeeAll",
  },
  {
    href: "/pricing",
    imageKey: "pricing" as const,
    tagKey: "marketing.pricingEyebrow",
    titleKey: "marketing.lightUpdatePricingTitle",
    descKey: "marketing.pricingSubtitle",
  },
  {
    href: "/help",
    imageKey: "help" as const,
    tagKey: "marketing.navHelp",
    titleKey: "marketing.lightUpdateHelpTitle",
    descKey: "marketing.lightUpdateHelpDesc",
  },
] as const;

export function LightUpdates(): React.ReactElement {
  const { t } = usePublicTranslations();
  const reduceMotion = useReducedMotion();

  return (
    <section className={cn("py-16 sm:py-24", lightSectionClass)}>
      <div className="mb-10 flex items-end justify-between gap-4">
        <h2 className="font-[family-name:var(--font-headline)] text-2xl font-bold tracking-tight text-[#1B1B1B] sm:text-[2rem]">
          {t("marketing.lightUpdatesTitle")}
        </h2>
        <Link
          href="/help"
          className="shrink-0 border-b border-[#181818] pb-1 text-xs font-bold uppercase tracking-wide text-[#1B1B1B] transition-colors hover:border-primary hover:text-primary"
        >
          {t("marketing.lightUpdatesViewAll")}
        </Link>
      </div>

      <motion.div
        variants={staggerContainer}
        initial={reduceMotion ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="grid gap-8 md:grid-cols-3"
      >
        {UPDATES.map((item, i) => (
          <motion.div key={item.href} variants={fadeUp} custom={i}>
            <Link
              href={item.href}
              className="group relative z-30 block h-full cursor-pointer rounded-[36px] p-2 transition hover:bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#0058bc] focus:ring-offset-4"
              aria-label={`${t(item.titleKey)} - ${t(item.descKey)}`}
            >
              <div className="mb-5 overflow-hidden rounded-[32px] bg-[#F0EFEB] p-3 shadow-md transition-transform duration-500 group-hover:-translate-y-1">
                <LightScreenshotFrame
                  src={LIGHT_UPDATE_IMAGES[item.imageKey]}
                  alt={t(item.titleKey)}
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              </div>
              <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-[#8C8880]">
                {t(item.tagKey)}
              </p>
              <p className="px-1 text-xl font-bold text-[#1B1B1B] transition-colors group-hover:text-primary">
                {t(item.titleKey)}
              </p>
              <p className="mt-2 line-clamp-2 px-1 text-sm text-[#8C8880]">
                {t(item.descKey)}
              </p>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
