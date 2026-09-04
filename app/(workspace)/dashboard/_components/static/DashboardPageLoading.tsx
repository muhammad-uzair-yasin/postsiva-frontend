"use client";

import { Loader2 } from "lucide-react";
import type { ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

export function DashboardPageLoading(): ReactElement {
  const { t } = useTranslations();

  return (
    <div
      className="flex min-h-[min(70vh,640px)] w-full flex-col items-center justify-center gap-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2
        className="h-10 w-10 animate-spin text-primary"
        aria-hidden
      />
      <span className="sr-only">{t("dashboard.loadingAria")}</span>
    </div>
  );
}
