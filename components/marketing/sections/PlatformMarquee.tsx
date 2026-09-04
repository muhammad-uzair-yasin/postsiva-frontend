"use client";

import { PostsivaLogoMark } from "@/components/marketing/PostsivaLogoMark";
import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";
import { SocialPlatformIcon } from "@/lib/social/SocialPlatformIcon";
import type { SocialPlatformIconId } from "@/lib/social/socialPlatformIconSrc";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const PLATFORMS: readonly SocialPlatformIconId[] = [
  "linkedin",
  "threads",
  "pinterest",
  "bluesky",
  "youtube",
  "instagram",
  "mastodon",
  "tiktok",
  "facebook",
  "whatsapp",
];

function PlatformTrail(): React.ReactElement {
  return (
    <div className="relative flex shrink-0 items-center gap-3.5 px-2 sm:gap-4">
      <div
        aria-hidden
        className="pointer-events-none absolute left-6 right-[4.5rem] top-1/2 h-px -translate-y-1/2 border-t border-dashed border-white/25 sm:right-20"
      />

      {PLATFORMS.map((id) => (
        <span
          key={id}
          className="relative z-[1] flex h-12 w-12 shrink-0 items-center justify-center rounded-[13px] border border-white/10 bg-surface-container-high/90 shadow-md shadow-black/25 sm:h-14 sm:w-14 sm:rounded-[15px]"
        >
          <SocialPlatformIcon
            platform={id}
            className="h-6 w-6 sm:h-7 sm:w-7"
            alt=""
          />
        </span>
      ))}

      <ArrowRight
        className="relative z-[1] mx-0.5 h-5 w-5 shrink-0 text-on-surface-variant sm:mx-1.5 sm:h-6 sm:w-6"
        strokeWidth={2}
        aria-hidden
      />

      <span
        className="relative z-[1] flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[15px] border border-primary/35 bg-surface-container-high shadow-lg shadow-primary/15 ring-1 ring-primary/20 sm:h-16 sm:w-16 sm:rounded-[17px]"
        title="Postsiva"
      >
        <PostsivaLogoMark size={64} className="h-full w-full" />
      </span>
    </div>
  );
}

export function PlatformMarquee(): React.ReactElement {
  const { t } = usePublicTranslations();
  const reduceMotion = useReducedMotion();

  return (
    <section className="border-y border-white/5 bg-surface-container/30 py-10 sm:py-12">
      <div className="marketing-container">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
          }
          className="flex flex-col items-stretch gap-6 rounded-[1.35rem] border border-white/10 bg-surface-container-lowest/55 px-5 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:px-8 sm:py-7 lg:flex-row lg:items-center lg:gap-8"
        >
          <p className="shrink-0 text-center text-base font-semibold tracking-tight text-on-surface sm:text-lg lg:max-w-[13.5rem] lg:text-left">
            {t("marketing.platformMarqueeLabel")}
          </p>

          <div className="relative min-w-0 flex-1 overflow-hidden">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-surface-container-lowest/90 to-transparent sm:w-14"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-surface-container-lowest/90 to-transparent sm:w-14"
            />

            {reduceMotion ? (
              <div className="flex justify-center overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <PlatformTrail />
              </div>
            ) : (
              <motion.div
                aria-hidden
                className="flex w-max"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
              >
                <PlatformTrail />
                <PlatformTrail />
              </motion.div>
            )}
          </div>
        </motion.div>

        <p className="mt-5 text-center text-sm text-on-surface-variant">
          {t("marketing.platformMarqueeCaption")}
        </p>
      </div>
    </section>
  );
}
