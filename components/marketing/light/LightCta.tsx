"use client";

import { PostsivaLogoMark } from "@/components/marketing/PostsivaLogoMark";
import { fadeUp } from "@/components/marketing/motion-variants";
import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

export function LightCta(): React.ReactElement {
  const { t } = usePublicTranslations();
  const reduceMotion = useReducedMotion();

  return (
    <section className="mx-auto flex max-w-[1728px] flex-col items-center px-6 py-20 text-center sm:px-10 sm:py-28">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="mb-10 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-[#181818] sm:h-[120px] sm:w-[120px]"
      >
        <PostsivaLogoMark size={120} className="h-full w-full" />
      </motion.div>

      <motion.h2
        variants={fadeUp}
        custom={0}
        initial={reduceMotion ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-3xl text-balance font-[family-name:var(--font-headline)] text-3xl font-bold leading-[1.1] tracking-tight text-[#1B1B1B] sm:text-5xl"
      >
        {t("marketing.lightCtaTitle")}
      </motion.h2>

      <motion.div
        variants={fadeUp}
        custom={1}
        initial={reduceMotion ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true }}
      >
        <Link
          href="/signup"
          className="mt-8 inline-flex rounded-full bg-[#181818] px-10 py-5 text-xs font-bold uppercase tracking-wider text-[#FAF9F5] shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#181818]/90 hover:shadow-xl"
        >
          {t("marketing.heroCtaStart")}
        </Link>
      </motion.div>
    </section>
  );
}
