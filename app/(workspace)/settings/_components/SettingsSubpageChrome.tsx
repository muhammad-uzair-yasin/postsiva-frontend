"use client";

import type { ReactElement, ReactNode } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { WORKSPACE_SIDEBAR_SUBPAGE_TITLE_CLASS } from "../../_components/shell/WorkspaceAccountRailPageLayout";

interface SettingsSubpageChromeProps {
  readonly titleKey: string;
  readonly children: ReactNode;
}

export function SettingsSubpageChrome({
  titleKey,
  children,
}: SettingsSubpageChromeProps): ReactElement {
  const { t } = useTranslations();

  return (
    <div className="w-full">
      <h1 className={`mb-6 ${WORKSPACE_SIDEBAR_SUBPAGE_TITLE_CLASS}`}>{t(titleKey)}</h1>
      {children}
    </div>
  );
}
