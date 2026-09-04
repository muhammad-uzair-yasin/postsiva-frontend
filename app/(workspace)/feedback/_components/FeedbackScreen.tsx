"use client";

import { WorkspaceTopNav } from "../../_components/WorkspaceTopNav";
import { WorkspaceDashboardBottomNav } from "../../dashboard/_components/WorkspaceDashboardBottomNav";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { FeedbackMainColumn } from "./FeedbackMainColumn";
import { FeedbackSidebarPanel } from "./FeedbackSidebarPanel";

export function FeedbackScreen(): React.ReactElement {
  const { t } = useTranslations();

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface selection:bg-primary/30">
      <div
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        aria-hidden
      >
        <div className="hero-glow absolute inset-0" />
        <div className="absolute left-1/4 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary-container/10 blur-[120px]" />
      </div>
      <WorkspaceTopNav />
      <main className="workspace-dashboard-scroll min-h-screen w-full px-6 pb-40 pt-28 md:px-10 xl:px-12 2xl:px-16">
        <header className="mb-12">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-on-surface md:text-5xl">
            {t("feedback.title")}{" "}
            <span className="text-secondary">{t("feedback.titleAccent")}</span>
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-on-surface-variant">
            {t("feedback.subtitle")}
          </p>
        </header>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <FeedbackMainColumn />
          </div>
          <FeedbackSidebarPanel />
        </div>
      </main>
      <WorkspaceDashboardBottomNav />
    </div>
  );
}
