"use client";

import { motion } from "framer-motion";
import { Suspense } from "react";

import {
  AuthBrandAnchor,
  AuthPanelLanguageSwitcher,
  AuthSystemStatus,
} from "@/app/(auth)/_components/AuthBrandAnchor";
import { AuthDarkPanelDecor } from "@/app/(auth)/_components/AuthDarkPanelDecor";
import { SocialLoginButtons } from "@/app/(auth)/_components/SocialLoginButtons";
import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";

import { SignupEmailForm } from "./SignupEmailForm";

export function SignupFormPanel(): React.ReactElement {
  const { t } = usePublicTranslations();

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-10 flex min-h-screen w-full items-center justify-center overflow-y-auto bg-[#07162e] p-6 shadow-[4px_0_24px_rgba(0,0,0,0.18)] md:p-12 lg:w-[45%] lg:p-20 xl:p-24"
    >
      <AuthDarkPanelDecor />
      <AuthBrandAnchor tone="dark" />
      <AuthPanelLanguageSwitcher />
      <div className="relative z-10 mt-20 w-full max-w-[420px] lg:mt-0">
        <div className="mb-10 text-center lg:text-left">
          <h2 className="mb-2 font-[family-name:var(--font-headline)] text-3xl font-semibold tracking-tight text-white">
            {t("auth.signupTitle")}
          </h2>
          <p className="text-sm leading-6 text-slate-300">{t("auth.signupSubtitle")}</p>
        </div>
        <div className="mb-8">
          <SocialLoginButtons />
        </div>
        <div className="relative mb-8 flex items-center">
          <div className="flex-grow border-t border-white/15" />
          <span className="mx-4 flex-shrink font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            {t("auth.orWithEmail")}
          </span>
          <div className="flex-grow border-t border-white/15" />
        </div>
        <Suspense fallback={<p className="text-sm text-slate-300">…</p>}>
          <SignupEmailForm />
        </Suspense>
      </div>
      <AuthSystemStatus tone="dark" />
    </motion.section>
  );
}
