"use client";

import { fadeUp, staggerContainer } from "@/components/marketing/motion-variants";
import { LIGHT_USE_CASE_IMAGES } from "@/components/marketing/light/light-images";
import { LightScreenshotFrame } from "@/components/marketing/light/LightScreenshotFrame";
import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";
import { motion, useReducedMotion } from "framer-motion";

const CARDS = [
  {
    id: "composer",
    titleKey: "marketing.composePreviewTitlePrefix",
    bodyKey: "marketing.composePreviewBody",
    imageAltKey: "marketing.composePreviewImageAlt",
    imageKey: "composer" as const,
    className: "bg-white",
  },
  {
    id: "inbox",
    titleKey: "marketing.inboxTitlePrefix",
    bodyKey: "marketing.inboxBody",
    imageAltKey: "marketing.inboxImageAlt",
    imageKey: "inbox" as const,
    className: "bg-gradient-to-br from-[#E0EAFC] to-[#CFDEF3]",
  },
  {
    id: "calendar",
    titleKey: "marketing.highlightCalendarLabel",
    bodyKey: "marketing.lightCalendarBody",
    imageAltKey: "marketing.lightCalendarImageAlt",
    imageKey: "calendar" as const,
    className: "bg-white",
  },
  {
    id: "whatsapp",
    titleKey: "marketing.whatsappTitlePrefix",
    bodyKey: "marketing.whatsappBody",
    imageAltKey: "marketing.whatsappImageAlt",
    imageKey: "whatsapp" as const,
    className: "bg-[#181818]",
  },
] as const;

export function LightUseCases(): React.ReactElement {
  const { t } = usePublicTranslations();
  const reduceMotion = useReducedMotion();

  return (
    <section className="mx-auto max-w-[1728px] px-6 py-20 sm:px-10 sm:py-28">
      <motion.h2
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-12 text-center font-[family-name:var(--font-headline)] text-2xl font-bold tracking-tight text-[#1B1B1B] sm:text-[2rem]"
      >
        {t("marketing.lightUseCasesTitle")}
      </motion.h2>

      <motion.div
        variants={staggerContainer}
        initial={reduceMotion ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="grid gap-6 md:grid-cols-2 md:gap-8"
      >
        {CARDS.map((card, i) => (
          <motion.article
            key={card.id}
            variants={fadeUp}
            custom={i}
            whileHover={reduceMotion ? undefined : { y: -6, transition: { duration: 0.25 } }}
            className={`group relative flex flex-col gap-6 overflow-hidden rounded-[32px] border border-[#D9D7D0]/20 p-6 shadow-sm sm:p-8 ${card.className}`}
          >
            <div className="relative z-10">
              <h4
                className={`mb-2 text-xl font-bold ${card.id === "whatsapp" ? "text-white" : "text-[#1B1B1B]"}`}
              >
                {t(card.titleKey)}
              </h4>
              <p className={`text-[15px] ${card.id === "whatsapp" ? "text-white/70" : "text-[#8C8880]"}`}>
                {t(card.bodyKey)}
              </p>
            </div>
            <LightScreenshotFrame
              src={LIGHT_USE_CASE_IMAGES[card.imageKey]}
              alt={t(card.imageAltKey)}
              sizes="(max-width: 768px) 100vw, 400px"
              className="transition-transform duration-500 group-hover:-translate-x-1 group-hover:-translate-y-1"
            />
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}
