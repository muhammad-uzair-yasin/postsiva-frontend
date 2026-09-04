"use client";

import { marketingImagePostsivaMobile } from "@/components/marketing/productScreens/postsivaMobile";
import { fadeUp, staggerContainer } from "@/components/marketing/motion-variants";
import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";
import { motion } from "framer-motion";
import Image from "next/image";

const mobileHero = marketingImagePostsivaMobile;

export function MobileAppUnified(): React.ReactElement {
  const { t } = usePublicTranslations();

  return (
    <section
      id="mobile-app"
      className="relative scroll-mt-28 overflow-hidden border-b border-white/[0.06] py-20 lg:py-24"
    >
      <div className="marketing-section-aurora pointer-events-none absolute inset-0 opacity-40" />
      <div className="marketing-container">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
            className="text-center lg:text-left"
          >
            <motion.p
              variants={fadeUp}
              custom={0}
              className="text-xs font-black uppercase tracking-[0.28em] text-secondary"
            >
              {t("marketing.mobileAppEyebrow")}
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="mt-4 text-3xl font-black tracking-tight text-on-surface sm:text-4xl md:text-[2.65rem] md:leading-tight"
            >
              {t("marketing.mobileAppTitlePrefix")}{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t("marketing.mobileAppTitleAccent")}
              </span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="mt-5 text-base text-on-surface-variant sm:text-lg"
            >
              {t("marketing.mobileAppBody")}
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
            className="flex justify-center lg:justify-end"
          >
            <motion.div
              variants={fadeUp}
              custom={0}
              className="relative mx-auto w-full max-w-[220px] overflow-hidden rounded-2xl border border-white/12 bg-surface-container-low/80 p-1 shadow-[0_20px_50px_-28px_rgba(0,0,0,0.85)] ring-1 ring-white/[0.05] sm:max-w-[240px] lg:mx-0 lg:ml-auto lg:mr-0 lg:max-w-[260px]"
            >
              <Image
                src={mobileHero}
                alt={t("marketing.mobileAppImageAlt")}
                width={mobileHero.width}
                height={mobileHero.height}
                className="block h-auto w-full rounded-lg"
                sizes="(max-width: 1024px) 240px, 260px"
                placeholder="blur"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
