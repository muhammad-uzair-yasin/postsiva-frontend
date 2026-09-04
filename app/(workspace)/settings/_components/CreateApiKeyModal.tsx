"use client";

import { useEffect, type ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

interface CreateApiKeyModalProps {
  open: boolean;
  name: string;
  onNameChange: (value: string) => void;
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const MAX_NAME_LEN = 255;

/**
 * Collect optional display name before generating a workspace API key.
 */
export function CreateApiKeyModal({
  open,
  name,
  onNameChange,
  busy,
  onConfirm,
  onCancel,
}: CreateApiKeyModalProps): ReactElement | null {
  const { t } = useTranslations();

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        onCancel();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onCancel]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label={t("common.close")}
        className="absolute inset-0 z-[120] bg-black/60"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-api-key-title"
        className="relative z-[121] w-full max-w-md rounded-2xl border border-outline-variant/20 bg-surface p-6 shadow-2xl"
      >
        <h2
          id="create-api-key-title"
          className="text-lg font-extrabold text-on-surface"
        >
          {t("settings.apiKeysGenerate")}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
          {t("settings.apiKeysCreateBody")}
        </p>
        <label className="mt-5 block">
          <span className="text-sm font-bold text-on-surface">{t("settings.apiKeysKeyName")}</span>
          <span className="ml-1 text-xs font-normal text-on-surface-variant">
            {t("settings.apiKeysKeyNameOptional")}
          </span>
          <input
            type="text"
            maxLength={MAX_NAME_LEN}
            value={name}
            disabled={busy}
            placeholder={t("settings.apiKeysKeyNamePlaceholder")}
            className="mt-1.5 w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 disabled:opacity-50"
            onChange={(e) => {
              onNameChange(e.target.value);
            }}
          />
        </label>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="rounded-xl border border-outline-variant/30 px-5 py-2.5 text-sm font-bold text-on-surface transition-opacity disabled:opacity-60"
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="rounded-xl bg-primary-container px-5 py-2.5 text-sm font-bold text-on-primary-container transition-opacity disabled:opacity-60"
          >
            {busy ? t("settings.apiKeysGenerating") : t("settings.apiKeysGenerateKey")}
          </button>
        </div>
      </div>
    </div>
  );
}
