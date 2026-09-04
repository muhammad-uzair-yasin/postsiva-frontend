"use client";

import Link from "next/link";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { WorkspaceDashboardBottomNav } from "../../../dashboard/_components/WorkspaceDashboardBottomNav";
import { WorkspaceTopNav } from "../../../_components/WorkspaceTopNav";

const PREVIEW_TAB_KEYS = [
  "postScheduler.platforms.linkedin",
  "postScheduler.platforms.x",
  "postScheduler.platforms.instagram",
] as const;

export function PostSchedulerAiAssistantScreen(): React.ReactElement {
  const { t } = useTranslations();

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-x-hidden bg-background-dark font-display text-white">
      <WorkspaceTopNav />
      <main className="flex flex-1 min-h-0 flex-col overflow-hidden pt-20 pb-36 md:flex-row">
        <section className="flex w-full flex-col border-white/5 bg-[#0d121a] md:w-[420px] md:max-w-[40%] md:border-r">
          <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">
                auto_awesome
              </span>
              <span className="text-sm font-bold">{t("postScheduler.aiAssistant.title")}</span>
            </div>
            <Link
              href="/post-scheduler"
              className="text-xs font-bold text-white/50 hover:text-white"
            >
              {t("postScheduler.aiAssistant.composer")}
            </Link>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
            <p className="rounded-2xl rounded-tl-sm bg-white/5 p-3 text-white/80">
              {t("postScheduler.aiAssistant.demoUser")}
            </p>
            <p className="rounded-2xl rounded-tr-sm bg-primary/20 p-3 text-white/90">
              {t("postScheduler.aiAssistant.demoAssistant")}
            </p>
          </div>
          <div className="border-t border-white/5 p-3">
            <div className="flex gap-2 rounded-xl bg-black/40 p-2">
              <input
                type="text"
                placeholder={t("postScheduler.aiAssistant.inputPlaceholder")}
                className="min-w-0 flex-1 bg-transparent px-2 text-sm text-white placeholder:text-white/40 focus:outline-none"
              />
              <button
                type="button"
                className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-background-dark"
              >
                {t("postScheduler.aiAssistant.send")}
              </button>
            </div>
          </div>
        </section>
        <section className="flex flex-1 flex-col overflow-hidden bg-[#080b10]">
          <div className="flex gap-2 border-b border-white/5 px-4 py-2">
            {PREVIEW_TAB_KEYS.map((key, index) => (
              <button
                key={key}
                type="button"
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  index === 0
                    ? "bg-primary text-background-dark"
                    : "text-white/50 hover:text-white"
                }`}
              >
                {t(key)}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-lg rounded-2xl border border-white/10 bg-[#121822] p-6 shadow-2xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/10" />
                <div>
                  <p className="text-sm font-bold">
                    {t("postScheduler.previewMockups.yourBrand")}
                  </p>
                  <p className="text-xs text-white/50">
                    {t("postScheduler.previewMockups.justNowPublic")}
                  </p>
                </div>
              </div>
              <p className="text-base leading-relaxed text-white/90">
                {t("postScheduler.aiAssistant.demoPreviewBody")}
              </p>
            </div>
          </div>
        </section>
      </main>
      <WorkspaceDashboardBottomNav />
    </div>
  );
}
