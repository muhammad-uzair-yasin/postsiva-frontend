"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import {
  AuthBrandAnchor,
  AuthPanelLanguageSwitcher,
  AuthSystemStatus,
} from "@/app/(auth)/_components/AuthBrandAnchor";
import { AuthDarkPanelDecor } from "@/app/(auth)/_components/AuthDarkPanelDecor";
import { AuthPageFrame } from "@/app/(auth)/_components/AuthPageFrame";
import { AuthSideVisual } from "@/app/(auth)/_components/AuthSideVisual";
import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";

import { useResetPasswordForm } from "../_hooks/useResetPasswordForm";

import { ResetPasswordReadyForm } from "./ResetPasswordReadyForm";

export function ResetPasswordScreen(): React.ReactElement {
  const { t } = usePublicTranslations();
  const {
    gate,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    isLoading,
    onSubmit,
  } = useResetPasswordForm();

  return (
    <AuthPageFrame>
      <div className="flex min-h-screen w-full flex-col items-stretch lg:flex-row">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center overflow-y-auto bg-[#07162e] p-6 shadow-[4px_0_24px_rgba(0,0,0,0.18)] md:p-12 lg:w-[45%] lg:p-20 xl:p-24"
        >
          <AuthDarkPanelDecor />
          <AuthBrandAnchor tone="dark" />
          <AuthPanelLanguageSwitcher />
          <div className="relative z-10 mt-20 w-full max-w-[420px] lg:mt-0">
            <Link
              className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-sky-300 hover:text-sky-200 hover:underline"
              href="/login"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              {t("auth.backToLogin")}
            </Link>

            {gate === "checking" ? (
              <p className="text-center text-slate-300 lg:text-left">
                {t("auth.checkingResetLink")}
              </p>
            ) : null}

            {gate === "invalid" ? (
              <div className="space-y-6 text-center lg:text-left">
                <h1 className="text-2xl font-bold text-white">
                  {t("auth.linkInvalid")}
                </h1>
                <p className="text-slate-300">{t("auth.linkInvalidBody")}</p>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                  <Link
                    className="rounded-xl bg-[#0058bc] px-6 py-3 text-center font-bold text-white"
                    href="/forgot-password"
                  >
                    {t("auth.requestNewLink")}
                  </Link>
                  <Link
                    className="rounded-xl border border-white/20 px-6 py-3 text-center font-semibold text-white hover:bg-white/10"
                    href="/login"
                  >
                    {t("auth.login")}
                  </Link>
                </div>
              </div>
            ) : null}

            {gate === "ready" ? (
              <ResetPasswordReadyForm
                password={password}
                setPassword={setPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                error={error}
                isLoading={isLoading}
                onSubmit={onSubmit}
              />
            ) : null}
          </div>
          <AuthSystemStatus tone="dark" />
        </motion.section>
        <AuthSideVisual />
      </div>
    </AuthPageFrame>
  );
}
