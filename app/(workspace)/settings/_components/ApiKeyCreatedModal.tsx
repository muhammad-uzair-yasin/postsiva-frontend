"use client";

import { useCallback, useEffect, useState, type ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { copyTextToClipboard } from "../_utils/copyTextToClipboard";

interface ApiKeyCreatedModalProps {
  open: boolean;
  secret: string;
  /** Optional label shown when the user named the key at creation time. */
  keyName?: string | null;
  onClose: () => void;
}

export function ApiKeyCreatedModal({
  open,
  secret,
  keyName = null,
  onClose,
}: ApiKeyCreatedModalProps): ReactElement | null {
  const { t } = useTranslations();
  const [copyFeedback, setCopyFeedback] = useState<"idle" | "copied" | "error">(
    "idle",
  );

  useEffect(() => {
    setCopyFeedback("idle");
  }, [secret, open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const copySecret = useCallback(async (): Promise<void> => {
    const ok = await copyTextToClipboard(secret);
    setCopyFeedback(ok ? "copied" : "error");
    if (ok) {
      window.setTimeout(() => {
        setCopyFeedback("idle");
      }, 2000);
    }
  }, [secret]);

  if (!open || !secret.trim()) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div aria-hidden className="absolute inset-0 z-[120] bg-black/60" />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="api-key-created-title"
        className="relative z-[121] w-full max-w-lg rounded-2xl border border-outline-variant/20 bg-surface p-6 shadow-2xl"
      >
        <h2
          id="api-key-created-title"
          className="text-lg font-extrabold text-on-surface"
        >
          {t("settings.apiKeysSaveTitle")}
        </h2>
        {keyName?.trim() ? (
          <p className="mt-2 text-sm font-medium text-on-surface">
            {t("settings.apiKeysNameLabel")}{" "}
            <span className="text-on-surface-variant">{keyName.trim()}</span>
          </p>
        ) : null}
        <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
          {t("settings.apiKeysSaveBody")}
        </p>
        <div className="mt-4 flex gap-2 rounded-xl border border-outline-variant/15 bg-surface-container-low p-3">
          <code className="min-w-0 flex-1 break-all font-mono text-xs leading-relaxed text-on-surface">
            {secret}
          </code>
          <button
            type="button"
            title={t("settings.apiKeysCopyKey")}
            aria-label={t("settings.apiKeysCopyKey")}
            className="shrink-0 self-start rounded-lg border border-outline-variant/25 bg-surface-container-high p-2 text-on-surface-variant transition-colors hover:border-secondary/35 hover:text-secondary"
            onClick={() => {
              void copySecret();
            }}
          >
            <span className="material-symbols-outlined text-xl" aria-hidden>
              content_copy
            </span>
          </button>
        </div>
        {copyFeedback === "error" ? (
          <p className="mt-2 text-xs text-error" role="status">
            {t("settings.apiKeysCopyError")}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              void copySecret();
            }}
            className="rounded-xl bg-primary-container px-5 py-2.5 text-sm font-bold text-on-primary-container"
          >
            {copyFeedback === "copied" ? t("common.copied") : t("settings.apiKeysCopyKey")}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-outline-variant/30 px-5 py-2.5 text-sm font-bold text-on-surface"
          >
            {t("settings.apiKeysDone")}
          </button>
        </div>
      </div>
    </div>
  );
}
