"use client";

import { fadeUp, staggerContainer } from "@/components/marketing/motion-variants";
import { lightLandingPiva } from "@/components/marketing/light/light-images";
import { marketingImageComposeWithPreview } from "@/components/marketing/productScreens/composeWithPreview";
import { marketingImageInbox } from "@/components/marketing/productScreens/inbox";
import { LightScreenshotFrame } from "@/components/marketing/light/LightScreenshotFrame";
import { lightSectionClass, lightRadiusLg } from "@/components/marketing/light/light-layout";
import { lightShadowElevated } from "@/components/marketing/light/light-tokens";
import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";
import { cn } from "@/lib/cn";
import { motion, useReducedMotion } from "framer-motion";
import { Bot, Edit, LayoutGrid, MessageSquare } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { StaticImageData } from "next/image";

interface BentoCardProps {
  readonly icon: LucideIcon;
  readonly title: string;
  readonly body: string;
  readonly className?: string;
  readonly variant?: "glass" | "white";
  readonly image?: { src: StaticImageData; alt: string };
  readonly imageClassName?: string;
}

function BentoCard({
  icon: Icon,
  title,
  body,
  className,
  variant = "glass",
  image,
  imageClassName,
}: BentoCardProps): React.ReactElement {
  const isGlass = variant === "glass";

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden p-8 transition-transform duration-300 hover:scale-[1.01] sm:p-10",
        lightRadiusLg,
        lightShadowElevated,
        isGlass
          ? "border border-white/20 bg-white/10 text-white"
          : "border border-white bg-white text-[#111827]",
        className,
      )}
    >
      {isGlass ? (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      ) : null}
      <div
        className={cn(
          "relative z-10 mb-6 flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg",
          isGlass ? "bg-white text-[#0058bc]" : "bg-[#0058bc] text-white shadow-[#0058bc]/30",
        )}
      >
        <Icon className="h-7 w-7" aria-hidden />
      </div>
      <h3
        className={cn(
          "relative z-10 mb-3 text-2xl font-bold tracking-tight sm:text-3xl",
          isGlass ? "text-white" : "text-[#111827]",
        )}
      >
        {title}
      </h3>
      <p
        className={cn(
          "relative z-10 mb-8 max-w-lg text-base leading-relaxed sm:text-lg",
          isGlass ? "text-white/80" : "text-[#4B5563]",
        )}
      >
        {body}
      </p>
      {image ? (
        <div
          className={cn(
            "relative z-10 mt-auto overflow-hidden rounded-2xl border border-white/30 bg-white shadow-inner transition-transform duration-500 group-hover:-translate-y-2",
            imageClassName,
          )}
        >
          <LightScreenshotFrame src={image.src} alt={image.alt} sizes="(max-width: 768px) 100vw, 600px" />
        </div>
      ) : null}
    </article>
  );
}

export function LightBentoStack(): React.ReactElement {
  const { t } = usePublicTranslations();
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative bg-[#f8fafc] py-12">
      <div className={cn("relative z-10", lightSectionClass)}>
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="mb-3 font-[family-name:var(--font-headline)] text-4xl font-bold tracking-tight text-[#111827] sm:text-5xl">
            {t("marketing.lightStackTitle")}
          </h2>
          <p className="mx-auto max-w-2xl text-base font-medium text-[#667085] md:text-lg">
            {t("marketing.lightStackSubtitle")}
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial={reduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8"
        >
          <motion.div variants={fadeUp} custom={0} className="md:col-span-2">
            <BentoCard
              icon={Edit}
              variant="white"
              title={`${t("marketing.composePreviewTitlePrefix")} ${t("marketing.composePreviewTitleAccent")}`}
              body={t("marketing.composePreviewBody")}
              className="min-h-[420px]"
              image={{
                src: marketingImageComposeWithPreview,
                alt: t("marketing.composePreviewImageAlt"),
              }}
              imageClassName="h-56 sm:h-64"
            />
          </motion.div>

          <motion.div variants={fadeUp} custom={1}>
            <BentoCard
              icon={MessageSquare}
              variant="white"
              title={`${t("marketing.inboxTitlePrefix")} ${t("marketing.inboxTitleAccent")}`}
              body={t("marketing.inboxBody")}
              className="min-h-[420px]"
              image={{
                src: marketingImageInbox,
                alt: t("marketing.inboxImageAlt"),
              }}
              imageClassName="h-40"
            />
          </motion.div>

          <motion.div variants={fadeUp} custom={2}>
            <BentoCard
              icon={LayoutGrid}
              variant="white"
              title={`${t("marketing.workspacesTitlePrefix")} ${t("marketing.workspacesTitleAccent")}`}
              body={t("marketing.workspacesBody")}
              className="min-h-[280px]"
            />
          </motion.div>

          <motion.div variants={fadeUp} custom={3} className="md:col-span-2">
            <article
              className={cn(
                "group relative flex flex-col gap-8 overflow-hidden border border-white bg-white p-8 transition-transform duration-300 hover:scale-[1.01] sm:flex-row sm:items-center sm:p-10",
                lightRadiusLg,
                lightShadowElevated,
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ffdbcc] text-[#9e3d00] shadow-lg">
                  <Bot className="h-7 w-7" aria-hidden />
                </div>
                <h3 className="mb-4 text-3xl font-bold tracking-tight text-[#111827] md:text-4xl">
                  {t("marketing.pivaAgentTitlePrefix")} {t("marketing.pivaAgentTitleAccent")}
                </h3>
                <p className="text-lg leading-relaxed text-[#4B5563]">{t("marketing.pivaAgentBody")}</p>
              </div>
              <div className="relative h-48 w-full shrink-0 transition-transform duration-700 group-hover:scale-105 sm:h-[220px] sm:w-2/5">
                <LightScreenshotFrame
                  src={lightLandingPiva}
                  alt={t("marketing.pivaAgentImageAlt")}
                  sizes="320px"
                />
              </div>
            </article>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
