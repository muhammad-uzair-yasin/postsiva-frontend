"use client";

import { fadeUp, staggerContainer } from "@/components/marketing/motion-variants";
import {
  LIGHT_COLLAGE_CARD_WIDTH,
  LIGHT_COLLAGE_CARDS,
  LIGHT_COLLAGE_IMAGE_HEIGHT,
} from "@/components/marketing/light/light-images";
import { lightSectionClass } from "@/components/marketing/light/light-layout";
import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";
import { cn } from "@/lib/cn";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";

const COLLAGE_FRAME =
  "overflow-hidden rounded-[24px] bg-[#F0EFEB] p-2.5 shadow-xl ring-1 ring-black/[0.04]";

function CollageImageCard({
  src,
  alt,
  title,
  className,
  index,
  reduceMotion,
  floating = false,
}: {
  src: (typeof LIGHT_COLLAGE_CARDS)[number]["src"];
  alt: string;
  title: string;
  className?: string;
  index: number;
  reduceMotion: boolean | null;
  floating?: boolean;
}): React.ReactElement {
  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      whileHover={reduceMotion || !floating ? undefined : { y: -4, transition: { duration: 0.2 } }}
      className={cn(floating && "absolute z-0", className)}
      style={floating ? { width: LIGHT_COLLAGE_CARD_WIDTH } : undefined}
    >
      <div className={COLLAGE_FRAME}>
        <p className="mb-2 truncate px-0.5 text-sm font-semibold tracking-tight text-[#1B1B1B]">
          {title}
        </p>
        <div
          className="relative overflow-hidden rounded-[18px] bg-[#0c0e14] ring-1 ring-black/10"
          style={{ height: LIGHT_COLLAGE_IMAGE_HEIGHT }}
        >
          <Image
            src={src}
            alt={alt}
            fill
            className="object-contain object-top p-1"
            sizes={`${LIGHT_COLLAGE_CARD_WIDTH}px`}
          />
        </div>
      </div>
    </motion.div>
  );
}

function CollageTitle({ className }: { className?: string }): React.ReactElement {
  const { t } = usePublicTranslations();

  return (
    <div className={cn("relative px-6 py-5 sm:px-10 sm:py-6", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 rounded-[2rem] bg-white/90 shadow-[0_0_60px_40px_rgba(255,255,255,0.85)] backdrop-blur-sm"
      />
      <h2 className="text-center font-[family-name:var(--font-headline)] text-4xl font-bold leading-[0.92] tracking-[-0.04em] text-[#1B1B1B] sm:text-5xl lg:text-[5rem] xl:text-[5.5rem]">
        {t("marketing.lightCollageTitleLine1")}
        <br />
        {t("marketing.lightCollageTitleLine2")}
      </h2>
    </div>
  );
}

export function LightCollage(): React.ReactElement {
  const { t } = usePublicTranslations();
  const reduceMotion = useReducedMotion();

  return (
    <section className={cn("relative overflow-visible py-10 sm:py-12 lg:py-14", lightSectionClass)}>
      {/* Mobile */}
      <div className="lg:hidden">
        <CollageTitle className="mb-8" />
        <motion.div
          variants={staggerContainer}
          initial={reduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          {LIGHT_COLLAGE_CARDS.map((card, i) => (
            <CollageImageCard
              key={`mobile-${card.className}`}
              src={card.src}
              alt={t(card.altKey)}
              title={t(card.titleKey)}
              index={i}
              reduceMotion={reduceMotion}
            />
          ))}
        </motion.div>
      </div>

      {/* Desktop */}
      <div className="relative hidden min-h-[880px] lg:block xl:min-h-[920px]">
        <motion.div
          variants={staggerContainer}
          initial={reduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="absolute inset-0"
        >
          {LIGHT_COLLAGE_CARDS.map((card, i) => (
            <CollageImageCard
              key={card.className}
              src={card.src}
              alt={t(card.altKey)}
              title={t(card.titleKey)}
              className={card.className}
              index={i}
              reduceMotion={reduceMotion}
              floating
            />
          ))}

          <motion.div
            variants={fadeUp}
            custom={8}
            className="absolute left-[36%] top-[84%] z-20 flex h-[56px] w-[280px] items-center gap-2.5 rounded-full border border-white/50 bg-white/90 px-3.5 py-2.5 shadow-md backdrop-blur-lg xl:w-[300px]"
          >
            <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full bg-[#E9E8E4]">
              <Image
                src="/postsiva-logo.jpeg"
                alt=""
                width={28}
                height={28}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 text-left">
              <p className="text-[10px] font-bold text-[#1B1B1B]">@postsiva</p>
              <p className="truncate text-xs leading-tight text-[#8C8880]">
                {t("marketing.lightCollageComment")}
              </p>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
        >
          <CollageTitle />
        </motion.div>
      </div>
    </section>
  );
}
