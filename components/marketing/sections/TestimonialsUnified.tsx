"use client";

import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";

export function TestimonialsUnified(): React.ReactElement {
  const { t } = usePublicTranslations();

  const reviews: readonly {
    name: string;
    role: string;
    quote: string;
    initials: string;
    ring: string;
  }[] = [
    {
      name: "Maya Chen",
      role: t("marketing.testimonialMayaRole"),
      quote: t("marketing.testimonialMayaQuote"),
      initials: "MC",
      ring: "from-fuchsia-400/60 to-primary/40",
    },
    {
      name: "Jordan Ellis",
      role: t("marketing.testimonialJordanRole"),
      quote: t("marketing.testimonialJordanQuote"),
      initials: "JE",
      ring: "from-secondary to-cyan-400/50",
    },
    {
      name: "Samira Patel",
      role: t("marketing.testimonialSamiraRole"),
      quote: t("marketing.testimonialSamiraQuote"),
      initials: "SP",
      ring: "from-primary to-amber-300/50",
    },
  ];

  return (
    <section id="reviews" className="relative scroll-mt-28 overflow-hidden py-28">
      <div className="marketing-section-aurora pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute left-1/2 top-20 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/15 blur-[100px]" />
      <div className="marketing-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-black uppercase tracking-[0.28em] text-secondary">
            {t("marketing.testimonialsEyebrow")}
          </p>
          <h2 className="mt-4 text-3xl font-black text-on-surface sm:text-4xl md:text-[2.65rem] md:leading-tight">
            {t("marketing.testimonialsTitlePrefix")}{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t("marketing.testimonialsTitleAccent")}
            </span>
          </h2>
          <p className="mt-4 text-on-surface-variant">{t("marketing.testimonialsBody")}</p>
        </motion.div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {reviews.map((r, i) => (
            <motion.article
              key={r.name}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 * i, duration: 0.55 }}
              whileHover={{ y: -12, transition: { type: "spring", stiffness: 350, damping: 22 } }}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-surface-container-low/85 p-7 shadow-[0_28px_70px_-32px_rgba(0,0,0,0.88)] backdrop-blur-md"
            >
              <div className="marketing-card-shine rounded-3xl opacity-35" />
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl transition-transform duration-500 group-hover:scale-125" />
              <div className="relative z-10 flex items-start gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${r.ring} text-sm font-black text-white shadow-lg ring-2 ring-white/10`}
                >
                  {r.initials}
                </div>
                <Quote className="h-7 w-7 shrink-0 text-primary/35" aria-hidden />
              </div>
              <p className="relative z-10 mt-5 text-sm leading-relaxed text-on-surface">
                &ldquo;{r.quote}&rdquo;
              </p>
              <p className="relative z-10 mt-6 text-sm font-bold text-on-surface">{r.name}</p>
              <p className="relative z-10 text-xs text-on-surface-variant">{r.role}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
