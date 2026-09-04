"use client";

import type { ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { normalizeWorkspaceLocale } from "@/lib/i18n/locales";

import { useWorkspaceAiOutputLanguage } from "@/app/(workspace)/settings/_hooks/useWorkspaceAiOutputLanguage";

interface PostSchedulerAiToolkitOutputLanguageProps {
  readonly compact?: boolean;
}

export function PostSchedulerAiToolkitOutputLanguage({
  compact = false,
}: PostSchedulerAiToolkitOutputLanguageProps): ReactElement {
  const { t } = useTranslations();
  const {
    loading,
    saving,
    error,
    selectedLocale,
    isDirty,
    isOwner,
    setSelectedLocale,
    save,
    localeOptions,
  } = useWorkspaceAiOutputLanguage();

  return (
    <div
      className={`shrink-0 rounded-lg border border-outline-variant/15 bg-surface-container-low/80 ${
        compact ? "p-2.5" : "p-3"
      }`}
    >
      <label className="block">
        <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
          {t("postScheduler.aiToolkit.outputLanguage")}
        </span>
        <select
          className="w-full rounded-lg border border-outline-variant/25 bg-surface-container px-2.5 py-2 text-xs text-on-surface disabled:opacity-60"
          value={selectedLocale}
          disabled={loading || !isOwner}
          onChange={(e) => {
            setSelectedLocale(normalizeWorkspaceLocale(e.target.value));
          }}
        >
          {localeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
      {!isOwner ? (
        <p className="mt-1.5 text-[10px] text-on-surface-variant">
          {t("preferences.ownerOnlyAiOutputLanguage")}
        </p>
      ) : null}
      {error ? <p className="mt-1.5 text-[10px] text-error">{error}</p> : null}
      {isOwner ? (
        <button
          type="button"
          disabled={loading || saving}
          onClick={() => {
            void save();
          }}
          className={`mt-2 w-full rounded-lg py-2 text-[11px] font-bold transition-all disabled:opacity-50 ${
            isDirty
              ? "bg-secondary text-on-secondary shadow-md ring-2 ring-secondary/60 ring-offset-2 ring-offset-surface-container-low"
              : "bg-primary-container/90 text-on-primary-container"
          }`}
        >
          {saving ? t("common.saving") : t("postScheduler.aiToolkit.saveOutputLanguage")}
        </button>
      ) : null}
    </div>
  );
}
