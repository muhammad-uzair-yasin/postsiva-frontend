"use client";

import Link from "next/link";

import { POSTSIVA_LOGO_SRC } from "@/lib/brandAssets";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

export function DeleteWorkspaceTopChrome(): React.ReactElement {
  const { t } = useTranslations();

  return (
    <header className="fixed top-0 w-full z-50 bg-[#11131E]/70 backdrop-blur-xl font-body tracking-tight shadow-[0_8px_32px_0_rgba(107,73,216,0.08)]">
      <div className="flex justify-between items-center w-full px-8 py-4">
        <div className="flex items-center gap-8">
          <Link className="flex items-center gap-3" href="/workspaces">
            <img
              alt={t("nav.brandPostsiva")}
              className="h-8 w-8 rounded-lg object-cover"
              src={POSTSIVA_LOGO_SRC}
            />
            <span className="text-2xl font-bold text-[#E1E1F1] tracking-tighter">
              {t("nav.brandPostsiva")}
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <span className="text-[#CAC3D6]">{t("workspaces.deleteChromeDashboard")}</span>
            <span className="text-[#CAC3D6]">{t("workspaces.deleteChromeAnalytics")}</span>
            <span className="text-[#CAC3D6]">{t("workspaces.deleteChromeSchedules")}</span>
            <span className="text-[#CAC3D6]">{t("workspaces.deleteChromeAssets")}</span>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="p-2 text-[#CAC3D6] hover:bg-[#1D1F2A] transition-all duration-200 rounded-full active:scale-95"
          >
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button
            type="button"
            className="p-2 text-[#CAC3D6] hover:bg-[#1D1F2A] transition-all duration-200 rounded-full active:scale-95"
          >
            <span className="material-symbols-outlined">settings</span>
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-container to-secondary overflow-hidden border border-outline-variant/15">
            <img
              alt={t("workspaces.deleteChromeUserProfile")}
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-5mo-L1Hc_AwjTccgbj2b7mt_EDsB69QviyP9RYpzdwFxe1Hrr4oi6noGu3wzuBXXZ8x-tJuz0NRVmJBlqImqwokj9JdX035CarfDGENfQ5ApBO19FQbAdjcJ2zEasagA9HB0HC8fkYluTtHHvVZeMqtYVvewoKQseSPiesP8HwQaqT6-80OPHKVpbWIR4cu2Anu9xhimUZodFJ63qSDGpiOGgR54mZyFpeZpAfW4RiVcOXbVSxkRkH_Kp4kTWNhuU2-NBYmdzNqa"
            />
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-b from-[#1D1F2A] to-transparent h-px" />
    </header>
  );
}
