"use client";

import { type ReactElement } from "react";

import { DraftEditorSuccessToast } from "@/app/(workspace)/content-manager/draft/[id]/_components/DraftEditorSuccessToast";
import { useDraftActionSuccessToast } from "@/app/(workspace)/content-manager/draft/[id]/_hooks/useDraftActionSuccessToast";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { normalizeWorkspaceLocale } from "@/lib/i18n/locales";

import { useWorkspaceAiOutputLanguage } from "../_hooks/useWorkspaceAiOutputLanguage";
import { useWorkspaceLanguagePreferences } from "../_hooks/useWorkspaceLanguagePreferences";

export function WorkspaceAiOutputLanguageSection(): ReactElement {
  const { t } = useTranslations();
  const { isOwner, localeOptions } = useWorkspaceLanguagePreferences();
  const {
    loading: aiLoading,
    saving: aiSaving,
    error: aiError,
    selectedLocale: aiOutputLocale,
    isDirty: aiOutputLocaleDirty,
    setSelectedLocale: setAiOutputLocale,
    save: saveAiOutputLanguage,
  } = useWorkspaceAiOutputLanguage();
  const { toast, toastKey, dismissToast, showToast } =
    useDraftActionSuccessToast();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-on-surface">{t("preferences.aiOutputLanguage")}</h3>
        <p className="mt-1 text-sm text-on-surface-variant">
          {t("preferences.aiOutputLanguageHint")}
        </p>
      </div>

      {aiLoading ? <p className="text-sm text-on-surface-variant">{t("common.loading")}</p> : null}
      {aiError ? <p className="text-sm text-error">{aiError}</p> : null}

      {!aiLoading ? (
        <>
          <label className="block">
            <span className="text-sm font-bold text-on-surface">{t("preferences.aiOutputLanguage")}</span>
            <select
              className="mt-1 w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2 text-sm"
              value={aiOutputLocale}
              disabled={!isOwner}
              onChange={(e) =>
                setAiOutputLocale(normalizeWorkspaceLocale(e.target.value))
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
            <p className="text-xs text-on-surface-variant">{t("preferences.ownerOnlyAiOutputLanguage")}</p>
          ) : null}
          <button
            type="button"
            disabled={aiSaving || !isOwner}
            className={`rounded-xl px-4 py-3 text-sm font-bold transition-all disabled:opacity-50 ${
              aiOutputLocaleDirty
                ? "bg-secondary text-on-secondary shadow-md ring-2 ring-secondary/60 ring-offset-2 ring-offset-surface"
                : "bg-primary-container text-on-primary-container"
            }`}
            onClick={() => {
              void (async () => {
                try {
                  await saveAiOutputLanguage();
                  showToast(
                    t("preferences.aiOutputLanguageSaved"),
                    t("preferences.aiOutputLanguageSavedHint"),
                  );
                } catch {
                  /* error on hook */
                }
              })();
            }}
          >
            {aiSaving ? t("common.saving") : t("preferences.saveAiOutputLanguage")}
          </button>
        </>
      ) : null}

      {toast ? (
        <DraftEditorSuccessToast
          key={toastKey}
          title={toast.title}
          subtitle={toast.subtitle}
          onDismiss={dismissToast}
        />
      ) : null}
    </div>
  );
}
