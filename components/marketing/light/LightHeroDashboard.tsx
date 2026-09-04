"use client";

import { lightLandingHero } from "@/components/marketing/light/light-images";
import { LightScreenshotFrame } from "@/components/marketing/light/LightScreenshotFrame";
import { PostsivaLogoMark } from "@/components/marketing/PostsivaLogoMark";
import { SocialPlatformIcon } from "@/lib/social/SocialPlatformIcon";
import type { SocialPlatformIconId } from "@/lib/social/socialPlatformIconSrc";
import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";
import { motion, useReducedMotion } from "framer-motion";
import { Send } from "lucide-react";

const PLATFORM_CHIPS: readonly { id: SocialPlatformIconId; label: string }[] = [
  { id: "linkedin", label: "LinkedIn" },
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
];

export function LightHeroDashboard(): React.ReactElement {
  const { t } = usePublicTranslations();
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="group relative mx-auto mt-16 max-w-5xl sm:mt-20"
    >
      <div
        aria-hidden
        className="absolute -inset-2 rounded-2xl bg-[#0058bc]/30 opacity-90 blur-2xl"
      />
      <div className="relative overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-950 shadow-[0_24px_60px_rgba(0,0,0,0.55)] ring-1 ring-white/[0.06]">
        <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/90 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 overflow-hidden rounded-lg ring-1 ring-white/15">
              <PostsivaLogoMark size={32} className="h-full w-full" />
            </div>
            <div className="text-left">
              <p className="text-[11px] font-bold text-white">Postsiva</p>
              <p className="text-[9px] text-slate-400">Unified workspace</p>
            </div>
          </div>
          <Send className="h-4 w-4 text-[#0058bc]" aria-hidden />
        </div>
        <div className="relative bg-[#0c0e14] p-1 sm:p-1.5">
          <LightScreenshotFrame
            src={lightLandingHero}
            alt={t("marketing.statsDashboardImageAlt")}
            priority
            sizes="(max-width: 1280px) 100vw, 1024px"
            className="rounded-xl border-0 bg-transparent p-0 shadow-none ring-0 sm:rounded-2xl"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent sm:h-36" />
          <div className="absolute inset-x-0 bottom-0 z-10 p-3 sm:p-4">
            <div className="grid grid-cols-3 gap-2">
              {PLATFORM_CHIPS.map((ch) => (
                <div
                  key={ch.id}
                  className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-slate-900/90 py-2.5 backdrop-blur-md sm:py-3"
                >
                  <SocialPlatformIcon platform={ch.id} className="h-6 w-6 sm:h-7 sm:w-7" alt="" />
                  <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 sm:text-[9px]">
                    {ch.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
