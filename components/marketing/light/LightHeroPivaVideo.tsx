"use client";

import { MARKETING_PIVA_VIDEO_SRC } from "@/components/marketing/marketingMedia";
import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

export function LightHeroPivaVideo(): React.ReactElement {
  const { t } = usePublicTranslations();
  const reduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (reduceMotion) {
      video.pause();
      return;
    }
    void video.play().catch(() => undefined);
  }, [reduceMotion]);

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.65, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
      className="relative mx-auto mt-12 w-full max-w-[360px] lg:mt-0 lg:max-w-none"
    >
      <div
        aria-hidden
        className="absolute -inset-3 rounded-2xl bg-[#0058bc]/35 blur-2xl"
      />
      <div className="relative overflow-hidden rounded-2xl border border-slate-600/80 bg-[#05070c] p-1.5 shadow-[0_24px_60px_rgba(0,0,0,0.55)] ring-2 ring-[#0058bc]/35">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-[#0c0e14] sm:aspect-square">
          <video
            ref={videoRef}
            className="h-full w-full object-cover object-center"
            autoPlay={!reduceMotion}
            muted
            loop
            playsInline
            preload="auto"
            aria-label={t("marketing.contactVideoAria")}
          >
            <source src={MARKETING_PIVA_VIDEO_SRC} type="video/mp4" />
          </video>
        </div>
        <p className="truncate px-3 py-2 text-center text-xs font-semibold text-slate-300">
          {t("marketing.pivaAgentTitlePrefix")} {t("marketing.pivaAgentTitleAccent")}
        </p>
      </div>
    </motion.div>
  );
}
