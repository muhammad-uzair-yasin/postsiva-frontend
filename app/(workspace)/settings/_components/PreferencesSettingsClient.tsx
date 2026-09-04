"use client";

import { type ReactElement } from "react";

import { DraftEditorSuccessToast } from "@/app/(workspace)/content-manager/draft/[id]/_components/DraftEditorSuccessToast";
import { useDraftActionSuccessToast } from "@/app/(workspace)/content-manager/draft/[id]/_hooks/useDraftActionSuccessToast";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { normalizeWorkspaceLocale } from "@/lib/i18n/locales";

import { useWorkspaceLanguagePreferences } from "../_hooks/useWorkspaceLanguagePreferences";
import { SettingsSectionPanel } from "./SettingsSectionPanel";

export function PreferencesSettingsClient(): ReactElement {
  const { t } = useTranslations();
  const {
    loading: langLoading,
    saving: langSaving,
    error: langError,
    selectedLocale,
    isOwner,
    setSelectedLocale,
    save: saveLanguage,
    localeOptions,
  } = useWorkspaceLanguagePreferences();
  const { toast, toastKey, dismissToast, showToast } =
    useDraftActionSuccessToast();

  return (
    <SettingsSectionPanel beta title={t("preferences.title")}>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-on-surface">{t("preferences.workspaceLanguage")}</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            {t("preferences.workspaceLanguageHint")}
          </p>
        </div>

        {langLoading ? <p className="text-sm text-on-surface-variant">{t("common.loading")}</p> : null}
        {langError ? <p className="text-sm text-error">{langError}</p> : null}

        {!langLoading ? (
          <>
            <label className="block">
              <span className="text-sm font-bold text-on-surface">{t("preferences.language")}</span>
              <select
                className="mt-1 w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2 text-sm"
                value={selectedLocale}
                disabled={!isOwner}
                onChange={(e) =>
                  setSelectedLocale(normalizeWorkspaceLocale(e.target.value))
                }
              >
                {localeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            {!isOwner ? (
              <p className="text-xs text-on-surface-variant">{t("preferences.ownerOnlyLanguage")}</p>
            ) : null}
            <button
              type="button"
              disabled={langSaving || !isOwner}
              className="rounded-xl bg-primary-container px-4 py-3 text-sm font-bold text-on-primary-container disabled:opacity-50"
              onClick={() => {
                void (async () => {
                  try {
                    await saveLanguage();
                    showToast(t("preferences.languageSaved"), t("preferences.languageSavedHint"));
                  } catch {
                    /* error on hook */
                  }
                })();
              }}
            >
              {langSaving ? t("common.saving") : t("preferences.saveLanguage")}
            </button>
          </>
        ) : null}
      </div>

      {toast ? (
        <DraftEditorSuccessToast
          key={toastKey}
          title={toast.title}
          subtitle={toast.subtitle}
          onDismiss={dismissToast}
        />
      ) : null}
    </SettingsSectionPanel>
  );
}
