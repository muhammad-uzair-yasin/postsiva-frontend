"use client";

import { marketingImagePivaAgent } from "@/components/marketing/productScreens/pivaAgent";
import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, MessageCircle, Sparkles } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export function FAQUnified(): React.ReactElement {
  const { t } = usePublicTranslations();
  const [open, setOpen] = useState<number | null>(0);

  const faqs: readonly { q: string; a: string }[] = [
    { q: t("marketing.faqQ1"), a: t("marketing.faqA1") },
    { q: t("marketing.faqQ2"), a: t("marketing.faqA2") },
    { q: t("marketing.faqQ3"), a: t("marketing.faqA3") },
    { q: t("marketing.faqQ4"), a: t("marketing.faqA4") },
  ];

  return (
    <section id="faq" className="relative scroll-mt-28 overflow-hidden py-28">
      <div className="marketing-section-aurora pointer-events-none absolute inset-0 opacity-55" />
      <div className="marketing-container">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
            className="relative lg:sticky lg:top-28"
          >
            <p className="text-xs font-black uppercase tracking-[0.28em] text-secondary">
              {t("marketing.faqEyebrow")}
            </p>
            <h2 className="mt-4 text-3xl font-black text-on-surface sm:text-4xl md:text-[2.6rem] md:leading-tight">
              {t("marketing.faqTitlePrefix")}{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t("marketing.faqTitleAccent")}
              </span>
            </h2>
            <p className="mt-4 text-on-surface-variant">{t("marketing.faqBody")}</p>
            <div className="relative mt-10 hidden sm:block lg:block">
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                className="absolute left-0 top-4 flex w-48 items-center gap-3 rounded-2xl border border-white/10 bg-surface-container/90 p-4 shadow-xl backdrop-blur-md"
              >
                <MessageCircle className="h-8 w-8 text-[#25D366]" />
                <div>
                  <p className="text-xs font-bold text-on-surface">WhatsApp</p>
                  <p className="text-[10px] text-on-surface-variant">
                    {t("marketing.faqWaBubble")}
                  </p>
                </div>
              </motion.div>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                className="absolute right-0 top-12 flex w-48 items-center gap-3 rounded-2xl border border-white/10 bg-surface-container/90 p-4 shadow-xl backdrop-blur-md"
              >
                <Sparkles className="h-8 w-8 text-amber-300" />
                <div>
                  <p className="text-xs font-bold text-on-surface">ChatGPT</p>
                  <p className="text-[10px] text-on-surface-variant">
                    {t("marketing.faqGptBubble")}
                  </p>
                </div>
              </motion.div>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.25 }}
                className="absolute left-1/2 top-20 flex h-[9.5rem] w-[9.5rem] -translate-x-1/2 items-center justify-center overflow-hidden rounded-[1.35rem] border border-white/10 bg-surface-container-low/90 ring-2 ring-primary/30 shadow-2xl backdrop-blur-sm"
              >
                <Image
                  src={marketingImagePivaAgent}
                  alt={t("marketing.pivaAgentImageAlt")}
                  width={152}
                  height={152}
                  className="h-full w-full object-contain object-center p-1.5"
                  placeholder="blur"
                />
              </motion.div>
            </div>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((item, i) => {
              const isOpen = open === i;
              return (
                <motion.div
                  key={item.q}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 * i }}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-surface-container/80 shadow-lg backdrop-blur-sm"
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-white/[0.03]"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm font-bold text-on-surface">{item.q}</span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      className="shrink-0 text-primary"
                    >
                      <ChevronDown className="h-5 w-5" />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <p className="border-t border-white/5 px-5 pb-4 pt-3 text-sm leading-relaxed text-on-surface-variant">
                          {item.a}
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
