"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Suspense } from "react";

import { AuthPageFrame } from "@/app/(auth)/_components/AuthPageFrame";
import { PublicLanguageSwitcher } from "@/components/i18n/PublicLanguageSwitcher";
import { POSTSIVA_LOGO_SRC } from "@/lib/brandAssets";
import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";

import { useVerifyEmail } from "../_hooks/useVerifyEmail";

import { VerifyEmailHero } from "./VerifyEmailHero";

function VerifyEmailBody(): React.ReactElement {
  const { t } = usePublicTranslations();
  const { status, message } = useVerifyEmail();

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex w-full flex-1 flex-col items-center justify-center overflow-y-auto bg-surface-container-lowest/95 p-6 backdrop-blur-[2px] md:p-12 lg:w-1/2 lg:p-24"
    >
      <div className="absolute right-6 top-6 z-10">
        <PublicLanguageSwitcher compact />
      </div>
      <div className="w-full max-w-md">
        <Link
          className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:underline"
          href="/login"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          {t("auth.backToLogin")}
        </Link>
        <div className="mb-8 flex justify-center lg:hidden">
          <Link
            href="/"
            className="inline-block rounded-xl outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-lowest"
            aria-label={t("auth.backHomeAria")}
          >
            <img
              alt=""
              className="h-10 w-10 rounded-xl object-cover"
              src={POSTSIVA_LOGO_SRC}
            />
          </Link>
        </div>
        <header className="mb-8 text-center lg:text-left">
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-on-surface">
            {t("auth.verifyEmailTitle")}
          </h1>
          <p className="text-on-surface-variant">{t("auth.verifyEmailSubtitle")}</p>
        </header>

        {status === "loading" ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center lg:items-start lg:text-left">
            <div
              className="h-10 w-10 animate-spin rounded-full border-2 border-outline-variant border-t-primary"
              aria-hidden
            />
            <p className="text-on-surface-variant">{t("auth.verifyingEmail")}</p>
          </div>
        ) : null}

        {status === "success" ? (
          <div className="space-y-6 text-center lg:text-left">
            <div className="flex justify-center lg:justify-start">
              <span className="material-symbols-outlined text-5xl text-primary">
                check_circle
              </span>
            </div>
            <p className="font-medium text-on-surface">{message}</p>
            <Link
              className="inline-flex rounded-xl bg-primary-container px-6 py-3 font-bold text-on-primary-container"
              href="/login"
            >
              {t("auth.goToLogin")}
            </Link>
          </div>
        ) : null}

        {status === "error" ? (
          <div className="space-y-6 text-center lg:text-left">
            <div className="flex justify-center lg:justify-start">
              <span className="material-symbols-outlined text-5xl text-error">
                error
              </span>
            </div>
            <p className="font-medium text-on-surface">{message}</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                className="rounded-xl border border-outline-variant/20 px-6 py-3 text-center font-semibold text-on-surface"
                href="/login"
              >
                {t("auth.backToLogin")}
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </motion.section>
  );
}

export function VerifyEmailScreen(): React.ReactElement {
  return (
    <AuthPageFrame>
      <div className="flex min-h-0 flex-1 flex-col items-stretch lg:flex-row">
        <VerifyEmailHero />
        <Suspense
          fallback={
            <div className="flex w-full flex-1 items-center justify-center bg-surface-container-lowest/95 p-6 lg:w-1/2">
              <p className="text-on-surface-variant">…</p>
            </div>
          }
        >
          <VerifyEmailBody />
        </Suspense>
      </div>
    </AuthPageFrame>
  );
}
