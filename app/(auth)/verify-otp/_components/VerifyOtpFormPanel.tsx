"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { PublicLanguageSwitcher } from "@/components/i18n/PublicLanguageSwitcher";
import { POSTSIVA_LOGO_SRC } from "@/lib/brandAssets";
import { clearLoginSession } from "@/lib/auth/session";
import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";

import { OtpDigitBoxes } from "./OtpDigitBoxes";
import { useVerifyOtpForm } from "../_hooks/useVerifyOtpForm";

export function VerifyOtpFormPanel(): React.ReactElement {
  const { t } = usePublicTranslations();
  const {
    otp,
    setOtp,
    error,
    info,
    isLoading,
    isResending,
    email,
    onSubmit,
    onResend,
  } = useVerifyOtpForm();

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
            {t("auth.verifyOtpTitle")}
          </h1>
          <p className="text-on-surface-variant">
            {t("auth.verifyOtpSubtitle")}{" "}
            <strong className="text-on-surface">{email || t("auth.yourEmail")}</strong>
          </p>
        </header>

        <form className="space-y-6" onSubmit={onSubmit} noValidate>
          {error ? (
            <p
              className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
              role="alert"
            >
              {error}
            </p>
          ) : null}
          {info ? (
            <p
              className="rounded-xl border border-secondary/25 bg-secondary/10 px-4 py-3 text-sm text-on-surface"
              role="status"
            >
              {info}
            </p>
          ) : null}

          <OtpDigitBoxes value={otp} onChange={setOtp} disabled={isLoading} />

          <button
            type="submit"
            disabled={isLoading || otp.length !== 6}
            className="w-full rounded-xl bg-primary-container py-4 font-bold text-on-primary-container shadow-[0_8px_32px_rgba(107,73,216,0.3)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
          >
            {isLoading ? t("auth.verifying") : t("auth.verify")}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-on-surface-variant lg:text-left">
          {t("auth.didntGetCode")}{" "}
          <button
            type="button"
            className="font-bold text-secondary hover:underline disabled:opacity-60"
            disabled={isResending}
            onClick={() => void onResend()}
          >
            {isResending ? t("auth.sending") : t("auth.resendCode")}
          </button>
        </p>
      </div>
    </motion.section>
  );
}
