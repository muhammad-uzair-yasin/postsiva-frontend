"use client";

import type { ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

export function BillingPageLoading(): React.ReactElement {
  const { t } = useTranslations();
  return (
    <p className="p-6 text-sm text-on-surface-variant">{t("billing.loading")}</p>
  );
}
