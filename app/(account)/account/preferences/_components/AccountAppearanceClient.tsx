"use client";

import { type ReactElement } from "react";

import { SettingsSectionPanel } from "@/app/(workspace)/settings/_components/SettingsSectionPanel";
import { useTheme } from "@/lib/theme/useTheme";
import { APP_THEMES } from "@/lib/theme/themeConstants";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

/**
 * User-global appearance preferences (theme). These persist to
 * `user_appearance` and are account-scoped — split out of the workspace
 * Preferences page, which keeps only per-workspace language.
 */
export function AccountAppearanceClient(): ReactElement {
  const { t } = useTranslations();
  const { theme, setTheme } = useTheme();

  return (
    <SettingsSectionPanel title={t("preferences.appearance")}>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-on-surface">{t("preferences.appearance")}</h2>
          <p className="mt-1 text-sm text-on-surface-variant">{t("preferences.appearanceHint")}</p>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-outline-variant/15 bg-surface-container-low p-4 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex-1">
            <p className="text-sm font-bold text-on-surface">{t("preferences.theme")}</p>
            <p className="mt-0.5 text-xs text-on-surface-variant">{t("preferences.themeHint")}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            {APP_THEMES.map((themeId) => (
              <button
                key={themeId}
                type="button"
                onClick={() => setTheme(themeId)}
                className={`rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
                  theme === themeId
                    ? "bg-primary text-on-primary shadow"
                    : "border border-outline-variant/20 bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                {t(`themes.${themeId}`)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </SettingsSectionPanel>
  );
}
