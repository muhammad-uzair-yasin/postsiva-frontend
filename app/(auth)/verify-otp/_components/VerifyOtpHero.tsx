"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { POSTSIVA_LOGO_SRC } from "@/lib/brandAssets";
import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";

export function VerifyOtpHero(): React.ReactElement {
  const { t } = usePublicTranslations();

  return (
    <motion.section
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="relative hidden w-1/2 items-center justify-center overflow-hidden p-12 mesh-gradient lg:flex"
    >
      <div className="absolute left-20 top-20 h-64 w-64 rounded-full bg-primary-container/10 blur-[120px]" />
      <div className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-secondary-container/10 blur-[150px]" />
      <div className="relative z-10 flex max-w-lg flex-col items-start">
        <div className="mb-12">
          <Link
            href="/"
            className="inline-block rounded-xl outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            aria-label={t("auth.backHomeAria")}
          >
            <img
              alt=""
              className="h-12 w-12 rounded-xl object-cover"
              src={POSTSIVA_LOGO_SRC}
            />
          </Link>
        </div>
        <h1 className="mb-6 text-6xl font-extrabold leading-tight tracking-tight text-on-surface">
          {t("auth.otpHeroTitle")} <br />
          <span className="text-secondary">{t("auth.otpHeroTitleAccent")}</span>
        </h1>
        <p className="text-xl leading-relaxed text-on-surface-variant opacity-80">
          {t("auth.otpHeroBody")}
        </p>
        <div className="mt-16 flex items-center gap-4">
          <div className="flex -space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-surface bg-surface-container-high">
              <span className="material-symbols-outlined text-xs text-secondary">
                pin
              </span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-surface bg-surface-container-high">
              <span className="material-symbols-outlined text-xs text-primary">
                verified
              </span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-surface bg-surface-container-high">
              <span className="material-symbols-outlined text-xs text-secondary-container">
                schedule
              </span>
            </div>
          </div>
          <span className="text-sm font-medium text-on-surface-variant">
            {t("auth.otpHeroFoot")}
          </span>
        </div>
      </div>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(#CAC3D6 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
    </motion.section>
  );
}
