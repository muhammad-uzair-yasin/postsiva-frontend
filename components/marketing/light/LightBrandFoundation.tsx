"use client";

import { fadeUp, staggerContainer } from "@/components/marketing/motion-variants";
import { lightSectionClass, lightRadiusXl } from "@/components/marketing/light/light-layout";
import { lightAccentBar } from "@/components/marketing/light/LightScreenshotFrame";
import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";
import { cn } from "@/lib/cn";
import { motion, useReducedMotion } from "framer-motion";
import { BarChart3, FileText, FolderOpen, ImageIcon, MoreHorizontal } from "lucide-react";

const FILE_ROWS = [
  { icon: FolderOpen, color: "#0058bc", labelKey: "marketing.lightFoundationFile1" },
  { icon: FileText, color: "#0058bc", labelKey: "marketing.lightFoundationFile2" },
  { icon: ImageIcon, color: "#2563eb", labelKey: "marketing.lightFoundationFile3" },
  { icon: BarChart3, color: "#1d4ed8", labelKey: "marketing.lightFoundationFile4" },
] as const;

const FEATURE_KEYS = [
  {
    titleKey: "marketing.lightFoundationFeature1Title",
    bodyKey: "marketing.lightFoundationFeature1Body",
    active: true,
  },
  {
    titleKey: "marketing.lightFoundationFeature2Title",
    bodyKey: "marketing.lightFoundationFeature2Body",
  },
  {
    titleKey: "marketing.lightFoundationFeature3Title",
    bodyKey: "marketing.lightFoundationFeature3Body",
  },
] as const;

function FilesMockup(): React.ReactElement {
  const { t } = usePublicTranslations();

  return (
    <div className={cn("flex h-full min-h-[420px] items-center justify-center border border-[#cbd5e1] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.12)] sm:min-h-[520px] sm:p-8 lg:min-h-[620px]", lightRadiusXl)}>
      <div className="w-full max-w-md rounded-2xl border border-[#cbd5e1] bg-white p-7 shadow-[0_18px_45px_rgba(15,23,42,0.14)]">
        <div className="mb-8 flex items-center justify-between">
          <span className="text-base font-bold text-[#111827]">{t("marketing.lightFoundationFilesLabel")}</span>
          <MoreHorizontal className="h-5 w-5 text-[#111827]" aria-hidden />
        </div>
        <ul className="space-y-2">
          {FILE_ROWS.map(({ icon: Icon, color, labelKey }) => (
            <li
              key={labelKey}
              className="flex items-center gap-4 rounded-xl border border-transparent p-3 transition-colors hover:border-[#bfdbfe] hover:bg-[#f8fafc]"
            >
              <Icon className="h-5 w-5 shrink-0" style={{ color }} aria-hidden />
              <span className="text-base font-semibold text-[#111827]">{t(labelKey)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function LightBrandFoundation(): React.ReactElement {
  const { t } = usePublicTranslations();
  const reduceMotion = useReducedMotion();

  return (
    <section className={cn("py-16 sm:py-20 lg:py-24", lightSectionClass)}>
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-[100px]">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <FilesMockup />
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial={reduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="rounded-3xl border border-[#cbd5e1] bg-white p-8 shadow-[0_24px_60px_rgba(15,23,42,0.12)] sm:p-10"
        >
          <motion.h2
            variants={fadeUp}
            custom={0}
            className="mb-10 max-w-xl font-[family-name:var(--font-headline)] text-4xl font-bold tracking-tight text-[#111827] sm:text-5xl lg:mb-12"
          >
            {t("marketing.lightFoundationHeading")}
          </motion.h2>

          <div className="relative max-w-xl space-y-8 border-l-[4px] border-[#bfdbfe] pl-8 lg:space-y-10">
            <div className={cn("absolute left-[-4px] top-0 h-full w-[4px]", lightAccentBar)} aria-hidden />
            {FEATURE_KEYS.map((item, i) => (
              <motion.div
                key={item.titleKey}
                variants={fadeUp}
                custom={i + 1}
                className="rounded-2xl bg-[#f8fafc] p-5 ring-1 ring-[#e2e8f0]"
              >
                <p className="mb-3 text-2xl font-bold text-[#111827]">{t(item.titleKey)}</p>
                <p className="text-base font-medium leading-relaxed text-[#334155]">{t(item.bodyKey)}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
