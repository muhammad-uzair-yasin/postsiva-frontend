"use client";

import { marketingImagePivaAgent } from "@/components/marketing/productScreens/pivaAgent";
import { fadeUp, staggerContainer } from "@/components/marketing/motion-variants";
import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Image from "next/image";

export function PivaAgentUnified(): React.ReactElement {
  const { t } = usePublicTranslations();

  const points: readonly string[] = [
    t("marketing.pivaAgentPointDraftPublish"),
    t("marketing.pivaAgentPointLiveData"),
    t("marketing.pivaAgentPointRemembersThread"),
    t("marketing.pivaAgentPointAutoComment"),
  ];

  return (
    <section
      id="piva-agent"
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
            className="order-2 lg:order-1"
          >
            <motion.div
              variants={fadeUp}
              custom={0}
              className="relative overflow-hidden rounded-3xl border border-white/12 bg-surface-container-low/80 shadow-[0_28px_70px_-32px_rgba(0,0,0,0.88)] ring-1 ring-white/[0.05]"
            >
              <div className="relative w-full bg-[#0c0e14] p-1 sm:p-1.5">
                <Image
                  src={marketingImagePivaAgent}
                  alt={t("marketing.pivaAgentImageAlt")}
                  width={marketingImagePivaAgent.width}
                  height={marketingImagePivaAgent.height}
                  className="block h-auto w-full rounded-lg"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  placeholder="blur"
                />
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
            className="order-1 text-center lg:order-2 lg:text-left"
          >
            <motion.p
              variants={fadeUp}
              custom={0}
              className="text-xs font-black uppercase tracking-[0.28em] text-secondary"
            >
              {t("marketing.pivaAgentEyebrow")}
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="mt-4 text-3xl font-black tracking-tight text-on-surface sm:text-4xl md:text-[2.65rem] md:leading-tight"
            >
              {t("marketing.pivaAgentTitlePrefix")}{" "}
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                {t("marketing.pivaAgentTitleAccent")}
              </span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="mt-5 text-base text-on-surface-variant sm:text-lg"
            >
              {t("marketing.pivaAgentBody")}
            </motion.p>
            <motion.div
              variants={fadeUp}
              custom={3}
              className="mt-6 flex justify-center lg:justify-start"
            >
              <ul className="w-full max-w-xl space-y-3 text-left text-sm text-on-surface-variant sm:text-base">
                {points.map((line) => (
                  <li key={line} className="flex gap-3">
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-secondary sm:h-[1.125rem] sm:w-[1.125rem]"
                      aria-hidden
                    />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
