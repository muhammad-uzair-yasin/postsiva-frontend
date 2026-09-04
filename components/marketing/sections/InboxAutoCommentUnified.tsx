"use client";

import { marketingImageAutoComment } from "@/components/marketing/productScreens/autoComment";
import { fadeUp, staggerContainer } from "@/components/marketing/motion-variants";
import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";
import { motion } from "framer-motion";
import Image from "next/image";

export function InboxAutoCommentUnified(): React.ReactElement {
  const { t } = usePublicTranslations();

  return (
    <section
      id="inbox-auto-comment"
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
              {t("marketing.inboxEyebrow")}
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="mt-4 text-3xl font-black tracking-tight text-on-surface sm:text-4xl md:text-[2.65rem] md:leading-tight"
            >
              {t("marketing.inboxTitlePrefix")}{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t("marketing.inboxTitleAccent")}
              </span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="mt-5 text-base text-on-surface-variant sm:text-lg"
            >
              {t("marketing.inboxBody")}
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
          >
            <motion.div
              variants={fadeUp}
              custom={0}
              className="relative overflow-hidden rounded-3xl border border-white/12 bg-surface-container-low/80 shadow-[0_28px_70px_-32px_rgba(0,0,0,0.88)] ring-1 ring-white/[0.05]"
            >
              <div className="relative w-full bg-[#0c0e14] p-1 sm:p-1.5">
                <Image
                  src={marketingImageAutoComment}
                  alt={t("marketing.inboxImageAlt")}
                  width={marketingImageAutoComment.width}
                  height={marketingImageAutoComment.height}
                  className="block h-auto w-full rounded-lg"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  placeholder="blur"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
