"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { MessageCircle, Sparkles, TrendingUp } from "lucide-react";
import { useReducedMotion } from "framer-motion";

import { AnimatedMarketingStat } from "@/components/marketing/AnimatedMarketingStat";
import { lightLandingHero } from "@/components/marketing/light/light-images";
import { MARKETING_PIVA_VIDEO_SRC } from "@/components/marketing/marketingMedia";
import {
  fetchPublicPlatformStats,
  type PublicPlatformStats,
} from "@/lib/marketing/platformStatsApi";

export function LightHeroWindowVisual(): React.ReactElement {
  const reduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stats, setStats] = useState<PublicPlatformStats | null>(null);
  const published = stats?.posts_published ?? null;
  const generated =
    stats && stats.success ? stats.posts_created + stats.images_generated : null;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (reduceMotion) {
      video.pause();
      return;
    }
    void video.play().catch(() => undefined);
  }, [reduceMotion]);

  useEffect(() => {
    let cancelled = false;
    void fetchPublicPlatformStats().then((data) => {
      if (!cancelled && data?.success) setStats(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-xl pb-2 sm:min-h-[460px] sm:pb-0 lg:min-h-[560px] lg:max-w-none">
      <div
        aria-hidden
        className="absolute -inset-6 rounded-[2rem] bg-[#0058bc]/20 blur-3xl"
      />

      <div className="relative overflow-hidden rounded-2xl border border-slate-600/50 bg-slate-900/60 shadow-inner">
        <Image
          src={lightLandingHero}
          alt="Postsiva workspace dashboard with composer, calendar, and live publishing preview"
          width={lightLandingHero.width}
          height={lightLandingHero.height}
          priority
          className="h-auto w-full object-cover object-top"
          sizes="(max-width: 1024px) 100vw, 560px"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-slate-900/10 via-transparent to-[#0058bc]/15" />
      </div>

      <div className="relative z-20 mt-4 w-full overflow-hidden rounded-2xl border border-slate-500/70 bg-[#05070c] shadow-[0_16px_40px_rgba(0,0,0,0.5)] ring-2 ring-[#0058bc]/40 sm:absolute sm:bottom-10 sm:left-0 sm:mt-0 sm:w-[240px]">
        <video
          ref={videoRef}
          className="block aspect-[5/4] w-full object-cover object-top"
          autoPlay={!reduceMotion}
          muted
          loop
          playsInline
          preload="auto"
          aria-label="Piva AI agent"
        >
          <source src={MARKETING_PIVA_VIDEO_SRC} type="video/mp4" />
        </video>
      </div>

      <div className="relative z-20 mt-3 rounded-2xl border border-slate-600/80 bg-slate-800/95 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.32)] backdrop-blur-sm sm:absolute sm:bottom-32 sm:left-[34%] sm:mt-0 sm:w-[220px]">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Posts generated
          </p>
          <Sparkles className="h-4 w-4 text-cyan-300" aria-hidden />
        </div>
        <p className="font-[family-name:var(--font-headline)] text-3xl font-bold tabular-nums leading-none text-cyan-300">
          <AnimatedMarketingStat
            target={generated}
            showPlus
            delayMs={320}
            placeholder="—"
          />
        </p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-700">
          <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-cyan-400 to-[#0058bc]" />
        </div>
      </div>

      <div className="relative z-20 mt-3 rounded-2xl border border-slate-600/80 bg-slate-800/95 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.32)] backdrop-blur-sm sm:absolute sm:bottom-44 sm:right-4 sm:mt-0 sm:w-[220px]">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Comments posted
          </p>
          <MessageCircle className="h-4 w-4 text-sky-300" aria-hidden />
        </div>
        <p className="font-[family-name:var(--font-headline)] text-3xl font-bold tabular-nums leading-none text-sky-300">
          <AnimatedMarketingStat
            target={published ? Math.max(Math.round(published * 1.8), 1200) : null}
            showPlus
            delayMs={260}
            placeholder="—"
          />
        </p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-700">
          <div className="h-full w-[84%] rounded-full bg-gradient-to-r from-sky-500 to-cyan-300" />
        </div>
      </div>

      <div className="relative z-20 mt-3 rounded-2xl border border-slate-600/80 bg-slate-800/95 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:absolute sm:bottom-6 sm:right-0 sm:mt-0 sm:w-[260px]">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Posts published
          </p>
          <TrendingUp className="h-4 w-4 text-[#F97316]" aria-hidden />
        </div>
        <p className="font-[family-name:var(--font-headline)] text-4xl font-bold tabular-nums leading-none text-sky-400">
          <AnimatedMarketingStat target={published} showPlus delayMs={200} placeholder="—" />
        </p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-700">
          <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-[#0058bc] to-sky-400" />
        </div>
      </div>
    </div>
  );
}
