"use client";

import { Loader2 } from "lucide-react";
import type { ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

export function OnboardingGateLoadingScreen({
  fullPage = true,
}: {
  readonly fullPage?: boolean;
}): ReactElement {
  const { t } = useTranslations();

  return (
    <div
      className={
        fullPage
          ? "flex min-h-dvh flex-col items-center justify-center gap-3 bg-surface px-4"
          : "flex min-h-[280px] flex-col items-center justify-center gap-3 py-16"
      }
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
      <p className="text-sm font-medium text-on-surface-variant">
        {t("workspaces.onboardingCheckingConnections")}
      </p>
    </div>
  );
}
