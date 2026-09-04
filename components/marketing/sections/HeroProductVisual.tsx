"use client";

import { marketingImageHeroBanner } from "@/components/marketing/productScreens/heroBanner";
import { PostsivaLogoMark } from "@/components/marketing/PostsivaLogoMark";
import { SocialPlatformIcon } from "@/lib/social/SocialPlatformIcon";
import type { SocialPlatformIconId } from "@/lib/social/socialPlatformIconSrc";
import { motion } from "framer-motion";
import { CalendarDays, MessageCircle, Send } from "lucide-react";
import Image from "next/image";

export function HeroProductVisual(): React.ReactElement {
  return (
    <div className="relative mx-auto mt-14 w-full max-w-[420px] lg:mt-0 lg:max-w-none">
      <div
        aria-hidden
        className="marketing-orbit-slow absolute -left-16 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full border border-dashed border-primary/20 opacity-50"
      />
      <div
        aria-hidden
        className="absolute -right-8 top-8 h-40 w-40 rounded-full bg-secondary/25 blur-3xl"
      />
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-4 top-0 z-20 flex items-center gap-2 rounded-2xl border border-white/15 bg-surface-container/95 px-3 py-2 shadow-xl backdrop-blur-md"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#25D366]/20 text-[#25D366]">
          <MessageCircle className="h-4 w-4" />
        </span>
        <div className="text-left text-[10px] leading-tight">
          <p className="font-bold text-on-surface">WhatsApp</p>
          <p className="text-on-surface-variant">Live ops ping</p>
        </div>
      </motion.div>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute -left-2 bottom-24 z-20 flex items-center gap-2 rounded-2xl border border-white/15 bg-surface-container/95 px-3 py-2 shadow-xl backdrop-blur-md"
      >
        <CalendarDays className="h-4 w-4 text-primary" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface">
          Next slot
        </span>
      </motion.div>

      <div className="relative z-10 rounded-[2rem] border border-white/12 bg-gradient-to-b from-surface-container-high/90 to-surface-container-lowest p-2 shadow-[0_40px_100px_-24px_rgba(0,0,0,0.9)]">
        <div className="marketing-card-shine absolute inset-0 rounded-[2rem]" />
        <div className="relative overflow-hidden rounded-[1.6rem] bg-surface-container-lowest ring-1 ring-white/[0.07]">
          <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 overflow-hidden rounded-lg ring-1 ring-white/10">
                <PostsivaLogoMark size={32} className="h-full w-full" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-on-surface">Postsiva</p>
                <p className="text-[9px] text-on-surface-variant">Unified workspace</p>
              </div>
            </div>
            <Send className="h-4 w-4 text-secondary" aria-hidden />
          </div>
          <div className="relative w-full bg-[#0c0e14] p-1">
            <Image
              src={marketingImageHeroBanner}
              width={marketingImageHeroBanner.width}
              height={marketingImageHeroBanner.height}
              alt="Postsiva: automate social media across platforms from one workspace"
              placeholder="blur"
              className="block h-auto w-full rounded-md"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-surface-container-lowest/95 via-surface-container-lowest/35 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 z-10 p-3 sm:p-4">
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: "linkedin" as const, label: "LinkedIn" },
                    { id: "instagram" as const, label: "Instagram" },
                    { id: "tiktok" as const, label: "TikTok" },
                  ] satisfies readonly {
                    id: SocialPlatformIconId;
                    label: string;
                  }[]
                ).map((ch) => (
                  <motion.div
                    key={ch.id}
                    className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-surface-container-high/90 py-2.5 shadow-lg backdrop-blur-md sm:py-3"
                    whileHover={{ scale: 1.04 }}
                  >
                    <SocialPlatformIcon
                      platform={ch.id}
                      className="h-6 w-6 sm:h-7 sm:w-7"
                      alt=""
                    />
                    <span className="text-[8px] font-black uppercase tracking-wider text-on-surface-variant sm:text-[9px]">
                      {ch.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
