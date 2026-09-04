"use client";

import { type ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

export interface SocialInboxCategoryOption {
  readonly key: string;
  readonly label: string;
}

interface SocialInboxCategoryEditModalProps {
  readonly open: boolean;
  readonly value: string;
  readonly options: readonly SocialInboxCategoryOption[];
  readonly busy: boolean;
  readonly error: string | null;
  readonly onChange: (value: string) => void;
  readonly onSave: () => void;
  readonly onClose: () => void;
}

export function SocialInboxCategoryEditModal({
  open,
  value,
  options,
  busy,
  error,
  onChange,
  onSave,
  onClose,
}: SocialInboxCategoryEditModalProps): ReactElement | null {
  const { t } = useTranslations();

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label={t("common.dismiss")}
        className="absolute inset-0 z-[120] bg-black/60"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-[121] flex w-full max-w-sm flex-col rounded-2xl border border-outline-variant/20 bg-surface p-5 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-on-surface">
              {t("inbox.categoryEditTitle")}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">
              {t("inbox.categoryEditHint")}
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg p-1 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
            aria-label={t("common.close")}
            onClick={onClose}
          >
            <span className="material-symbols-outlined text-lg" aria-hidden>
              close
            </span>
          </button>
        </div>
        <label className="mt-5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-on-surface-variant">
          {t("inbox.categorySet")}
        </label>
        <select
          className="mt-2 h-10 rounded-xl border border-outline-variant/20 bg-surface-container-high px-3 text-sm font-bold text-on-surface outline-none transition-colors focus:border-primary/60 disabled:opacity-50"
          value={value}
          disabled={busy}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">{t("inbox.categorySet")}</option>
          {options.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>
        {error ? (
          <p className="mt-3 text-xs font-bold text-error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-xl border border-outline-variant/20 px-4 py-2 text-sm font-bold text-on-surface-variant hover:bg-surface-container-high"
            disabled={busy}
            onClick={onClose}
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-on-primary disabled:opacity-60"
            disabled={busy || !value}
            onClick={onSave}
          >
            {busy ? t("common.saving") : t("common.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
