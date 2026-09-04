"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { AuthOnboardingGate } from "@/lib/auth/AuthSessionGate";
import { AuthPageFrame } from "@/app/(auth)/_components/AuthPageFrame";
import { PublicLanguageSwitcher } from "@/components/i18n/PublicLanguageSwitcher";
import { POSTSIVA_LOGO_SRC } from "@/lib/brandAssets";
import { clearLoginSession } from "@/lib/auth/session";
import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";

import { useSetupPasswordForm } from "../_hooks/useSetupPasswordForm";

import { PasswordField } from "./PasswordField";

function SetupPasswordHero(): React.ReactElement {
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
          {t("auth.setupHeroTitle")} <br />
          <span className="text-secondary">{t("auth.setupHeroTitleAccent")}</span>
        </h1>
        <p className="text-xl leading-relaxed text-on-surface-variant opacity-80">
          {t("auth.setupHeroBody")}
        </p>
      </div>
    </motion.section>
  );
}

function SetupPasswordFormPanel(): React.ReactElement {
  const { t } = usePublicTranslations();
  const {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    isLoading,
    onSubmit,
  } = useSetupPasswordForm();

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
          onClick={clearLoginSession}
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          {t("auth.backToLogin")}
        </Link>
        <div className="mb-8 flex justify-center lg:hidden">
          <Link href="/" aria-label={t("auth.backHomeAria")}>
            <img
              alt=""
              className="h-10 w-10 rounded-xl object-cover"
              src={POSTSIVA_LOGO_SRC}
            />
          </Link>
        </div>
        <header className="mb-8 text-center lg:text-left">
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-on-surface">
            {t("auth.setupPasswordTitle")}
          </h1>
          <p className="text-on-surface-variant">{t("auth.setupPasswordSubtitle")}</p>
        </header>

        <form className="space-y-5" onSubmit={onSubmit} noValidate>
          {error ? (
            <p
              className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <PasswordField
            id="password"
            label={t("auth.password")}
            value={password}
            onChange={setPassword}
            disabled={isLoading}
            autoComplete="new-password"
          />
          <PasswordField
            id="confirm-password"
            label={t("auth.confirmPassword")}
            value={confirmPassword}
            onChange={setConfirmPassword}
            disabled={isLoading}
            autoComplete="new-password"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full rounded-xl bg-primary-container py-4 font-bold text-on-primary-container shadow-[0_8px_32px_rgba(107,73,216,0.3)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
          >
            {isLoading ? t("auth.saving") : t("auth.continue")}
          </button>
        </form>
      </div>
    </motion.section>
  );
}

export function SetupPasswordScreen(): React.ReactElement {
  return (
    <AuthOnboardingGate requiredPath="/setup-password">
      <AuthPageFrame>
        <div className="flex min-h-0 flex-1 flex-col items-stretch lg:flex-row">
          <SetupPasswordHero />
          <SetupPasswordFormPanel />
        </div>
      </AuthPageFrame>
    </AuthOnboardingGate>
  );
}
