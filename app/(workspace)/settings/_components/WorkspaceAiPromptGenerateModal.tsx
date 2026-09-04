"use client";

import { useEffect, useState, type ReactElement } from "react";
import { createPortal } from "react-dom";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { LOCALE_OPTIONS, normalizeWorkspaceLocale, type WorkspaceLocale } from "@/lib/i18n/locales";

interface WorkspaceAiPromptGenerateModalProps {
  readonly open: boolean;
  readonly generating: boolean;
  readonly error: string | null;
  readonly onClose: () => void;
  readonly onGenerate: (intent: string, language: WorkspaceLocale) => void | Promise<void>;
}

export function WorkspaceAiPromptGenerateModal({
  open,
  generating,
  error,
  onClose,
  onGenerate,
}: WorkspaceAiPromptGenerateModalProps): ReactElement | null {
  const { t } = useTranslations();
  const [intent, setIntent] = useState("");
  const [language, setLanguage] = useState<WorkspaceLocale>("en");
  const root = typeof document !== "undefined" ? document.body : null;

  useEffect(() => {
    if (open) {
      setIntent("");
      setLanguage("en");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape" && !generating) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, generating, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !root) return null;

  const canGenerate = intent.trim().length >= 8 && !generating;

  return createPortal(
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !generating) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-prompt-generate-title"
        className="flex max-h-[min(90vh,560px)] w-full max-w-lg flex-col rounded-2xl border border-outline-variant/15 bg-surface-container-low shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="border-b border-outline-variant/10 px-5 py-4">
          <h2 id="ai-prompt-generate-title" className="text-sm font-bold text-on-surface">
            {t("settings.aiPrompts.generateModalTitle")}
          </h2>
          <p className="mt-1 text-xs text-on-surface-variant">
            {t("settings.aiPrompts.generateModalHint")}
          </p>
        </div>
        <div className="custom-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {error ? (
            <p className="text-xs text-error" role="alert">
              {error}
            </p>
          ) : null}
          <label className="block">
            <span className="text-xs font-bold text-on-surface">
              {t("settings.aiPrompts.generateLanguageLabel")}
            </span>
            <select
              className="mt-1 w-full rounded-xl border border-outline-variant/20 bg-surface-container px-3 py-2 text-sm disabled:opacity-60"
              value={language}
              disabled={generating}
              onChange={(e) => {
                setLanguage(normalizeWorkspaceLocale(e.target.value));
              }}
            >
              {LOCALE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-bold text-on-surface">
              {t("settings.aiPrompts.generateIntentLabel")}
            </span>
            <textarea
              rows={5}
              maxLength={2000}
              value={intent}
              disabled={generating}
              placeholder={t("settings.aiPrompts.generateIntentPlaceholder")}
              onChange={(e) => setIntent(e.target.value)}
              className="mt-1 min-h-28 w-full rounded-xl border border-outline-variant/20 bg-surface-container px-3 py-2 text-sm disabled:opacity-60"
            />
          </label>
        </div>
        <div className="flex justify-end gap-2 border-t border-outline-variant/10 px-5 py-3">
          <button
            type="button"
            disabled={generating}
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container-high disabled:opacity-50"
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            disabled={!canGenerate}
            onClick={() => {
              void onGenerate(intent.trim(), language);
            }}
            className="rounded-lg bg-[#6B49D8] px-3 py-2 text-xs font-bold text-on-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {generating ? t("common.loading") : t("settings.aiPrompts.generateSubmit")}
          </button>
        </div>
      </div>
    </div>,
    root,
  );
}
