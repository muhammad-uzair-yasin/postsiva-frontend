"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import {
  AuthBrandAnchor,
  AuthPanelLanguageSwitcher,
  AuthSystemStatus,
} from "@/app/(auth)/_components/AuthBrandAnchor";
import { AuthDarkPanelDecor } from "@/app/(auth)/_components/AuthDarkPanelDecor";
import { SocialLoginButtons } from "@/app/(auth)/_components/SocialLoginButtons";
import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";
import {
  POSTSIVA_PRIVACY_POLICY_URL,
  POSTSIVA_TERMS_OF_SERVICE_URL,
} from "@/lib/legalLinks";

import { LoginEmailForm } from "./LoginEmailForm";

export function LoginFormPanel(): React.ReactElement {
  const { t } = usePublicTranslations();
  const next = useSearchParams().get("next");

  return (
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
        <header className="mb-10 text-center lg:text-left">
          <h2 className="mb-2 font-[family-name:var(--font-headline)] text-3xl font-semibold tracking-tight text-white">
            {t("auth.loginWelcomeTitle")}
          </h2>
          <p className="text-sm leading-6 text-slate-300">{t("auth.loginWelcomeSubtitle")}</p>
        </header>
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
        <LoginEmailForm />
        <footer className="mt-12 text-center">
          <p className="font-medium text-slate-300">
            {t("auth.newHere")}
            <Link
              className="ml-1 font-bold text-sky-300 underline-offset-4 transition-all hover:text-sky-200 hover:underline"
              href={next ? `/signup?${new URLSearchParams({ next }).toString()}` : "/signup"}
            >
              {t("auth.createAccount")}
            </Link>
          </p>
          <div className="mt-16 flex flex-wrap justify-center gap-x-6 gap-y-2 opacity-40 transition-opacity hover:opacity-100">
            <Link
              className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white"
              href={POSTSIVA_PRIVACY_POLICY_URL}
            >
              {t("auth.privacy")}
            </Link>
            <Link
              className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white"
              href={POSTSIVA_TERMS_OF_SERVICE_URL}
            >
              {t("auth.terms")}
            </Link>
          </div>
        </footer>
      </div>
      <AuthSystemStatus tone="dark" />
    </motion.section>
  );
}
