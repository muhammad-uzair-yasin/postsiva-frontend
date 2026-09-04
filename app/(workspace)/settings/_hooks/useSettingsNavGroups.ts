"use client";

import { useMemo } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import type { SettingsNavGroup } from "../_data/settingsNav";

export function useSettingsNavGroups(): readonly SettingsNavGroup[] {
  const { t } = useTranslations();

  return useMemo(
    // User-global settings (Profile, Billing, AI Usage, Appearance) live in the
    // `(account)` group under `/account/*`; only workspace-scoped items here.
    (): readonly SettingsNavGroup[] => [
      {
        id: "workspace",
        title: t("settings.workspace"),
        items: [
          { href: "/settings/connections", label: t("settings.connections") },
          { href: "/settings/notifications", label: t("notifications.title") },
        ],
      },
      {
        id: "beta",
        title: t("settings.beta"),
        items: [
          { href: "/settings/preferences", label: t("settings.preferences") },
          { href: "/settings/ai", label: t("settings.aiSettings.nav") },
          { href: "/settings/comment-categories", label: t("settings.commentCategories") },
          { href: "/settings/persona", label: t("settings.persona") },
        ],
      },
    ],
    [t],
  );
}
