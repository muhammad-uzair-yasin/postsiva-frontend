"use client";

import { lightSectionClass } from "@/components/marketing/light/light-layout";
import { PostsivaLogoMark } from "@/components/marketing/PostsivaLogoMark";
import { fadeUp } from "@/components/marketing/motion-variants";
import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";
import { SocialPlatformIcon } from "@/lib/social/SocialPlatformIcon";
import type { SocialPlatformIconId } from "@/lib/social/socialPlatformIconSrc";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const PLATFORMS = [
  "linkedin",
  "instagram",
  "facebook",
  "tiktok",
  "youtube",
  "pinterest",
  "threads",
  "bluesky",
  "mastodon",
  "whatsapp",
] as const satisfies readonly SocialPlatformIconId[];

const PLATFORM_LABELS: Record<(typeof PLATFORMS)[number], string> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  youtube: "YouTube",
  pinterest: "Pinterest",
  threads: "Threads",
  bluesky: "Bluesky",
  mastodon: "Mastodon",
  whatsapp: "WhatsApp",
};

function PlatformStrip({ decorative = false }: { decorative?: boolean }): React.ReactElement {
  return (
    <div
      className="flex shrink-0 items-center gap-14 px-7"
      aria-hidden={decorative ? true : undefined}
    >
      {PLATFORMS.map((id) => (
        <span
          key={id}
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[#BFDBFE] bg-white shadow-[0_12px_28px_rgba(0,88,188,0.12)]"
        >
          <SocialPlatformIcon
            platform={id}
            className="h-9 w-9 transition-transform duration-300 hover:scale-110"
            alt={decorative ? "" : `${PLATFORM_LABELS[id]} logo`}
          />
        </span>
      ))}
      <ArrowRight className="h-6 w-6 shrink-0 text-[#0058bc]" aria-hidden />
      <span className="flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#BFDBFE] bg-white shadow-[0_14px_32px_rgba(0,88,188,0.16)]">
        <PostsivaLogoMark size={72} className="h-full w-full" />
      </span>
    </div>
  );
}

export function LightPlatformMarquee(): React.ReactElement {
  const { t } = usePublicTranslations();
  const reduceMotion = useReducedMotion();

  return (
    <section className="border-y border-[#D9D7D0]/40 py-12 sm:py-14">
      <div className={lightSectionClass}>
        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="mb-8 text-center text-[11px] font-bold uppercase tracking-[0.25em] text-[#8C8880]"
        >
          {t("marketing.platformMarqueeLabel")}
        </motion.p>

        <div className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#F9FAFB] to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#F9FAFB] to-transparent"
          />

          {reduceMotion ? (
            <div className="flex justify-center overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <PlatformStrip />
            </div>
          ) : (
            <div className="overflow-hidden">
              <div className="light-marquee-track flex w-max">
                <PlatformStrip />
                <PlatformStrip decorative />
              </div>
            </div>
          )}
        </div>

        <motion.p
          initial={reduceMotion ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-6 text-center text-sm text-[#8C8880]"
        >
          {t("marketing.platformMarqueeCaption")}
        </motion.p>
      </div>
    </section>
  );
}
