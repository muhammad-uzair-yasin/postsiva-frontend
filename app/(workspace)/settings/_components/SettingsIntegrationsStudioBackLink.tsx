"use client";

import Link from "next/link";
import type { ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

/**
 * In-app back control for routes opened from Integrations Studio (browser back /
 * profile link alone do not return users to the integrations list).
 */
export function SettingsIntegrationsStudioBackLink(): ReactElement {
  const { t } = useTranslations();

  return (
    <Link
      href="/integrations"
      className="-mt-1 mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
      aria-label={t("settings.integrationsBackAria")}
    >
      <span aria-hidden className="material-symbols-outlined text-[18px] leading-none">
        arrow_back
      </span>
      {t("settings.integrationsBack")}
    </Link>
  );
}
