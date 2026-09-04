"use client";

import { cn } from "@/lib/cn";
import { lightSectionClass } from "@/components/marketing/light/light-layout";
import { fadeUp } from "@/components/marketing/motion-variants";
import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";
import { motion, useReducedMotion } from "framer-motion";
import { Quote } from "lucide-react";

export function LightTestimonial(): React.ReactElement {
  const { t } = usePublicTranslations();
  const reduceMotion = useReducedMotion();

  return (
    <section className={cn("py-20 text-center sm:py-28", lightSectionClass)}>
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="mb-10 inline-flex text-transparent"
      >
        <Quote className="h-16 w-16 text-primary opacity-30" stroke="currentColor" />
      </motion.div>

      <motion.blockquote
        variants={fadeUp}
        custom={0}
        initial={reduceMotion ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true }}
        className="text-balance font-[family-name:var(--font-headline)] text-2xl font-bold leading-[1.1] tracking-tight text-[#1B1B1B] sm:text-4xl lg:text-[3.5rem]"
      >
        &ldquo;{t("marketing.testimonialMayaQuote")}&rdquo;
      </motion.blockquote>

      <motion.div
        variants={fadeUp}
        custom={1}
        initial={reduceMotion ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true }}
        className="mt-12 flex items-center justify-center gap-4"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-on-primary">
          M
        </div>
        <div className="text-left">
          <p className="text-sm font-bold text-[#1B1B1B]">Maya Chen</p>
          <p className="text-xs text-[#8C8880]">{t("marketing.testimonialMayaRole")}</p>
        </div>
      </motion.div>
    </section>
  );
}
