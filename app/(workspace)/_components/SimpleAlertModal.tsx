"use client";

import { useEffect, useId, type ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

interface SimpleAlertModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onClose: () => void;
}

/**
 * Single-action modal to replace window.alert with app-styled UI.
 */
export function SimpleAlertModal({
  open,
  title,
  message,
  confirmLabel,
  onClose,
}: SimpleAlertModalProps): ReactElement | null {
  const { t } = useTranslations();
  const resolvedConfirmLabel = confirmLabel ?? t("common.ok");
  const titleId = useId();
  const descId = useId();

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
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="relative z-[121] flex max-h-[min(80vh,32rem)] w-full max-w-md flex-col rounded-2xl border border-outline-variant/20 bg-surface p-6 shadow-2xl"
      >
        <h2
          id={titleId}
          className="shrink-0 text-lg font-extrabold text-on-surface"
        >
          {title}
        </h2>
        <p
          id={descId}
          className="mt-3 min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-on-surface-variant"
        >
          {message}
        </p>
        <div className="mt-6 flex shrink-0 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-primary-container px-5 py-2.5 text-sm font-bold text-on-primary-container"
          >
            {resolvedConfirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
