"use client";

import type { ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { DashboardInspirationsCard } from "./DashboardInspirationsCard";

export function DashboardInspirations(): ReactElement {
  const { t } = useTranslations();

  return (
    <section aria-label={t("dashboard.inspirationsTitle")} className="mt-10">
      <h2 className="mb-5 text-2xl font-extrabold text-on-surface">
        {t("dashboard.inspirationsTitle")}
      </h2>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
        <DashboardInspirationsCard initialSource="news" />
        <DashboardInspirationsCard initialSource="trending" />
      </div>
    </section>
  );
}
