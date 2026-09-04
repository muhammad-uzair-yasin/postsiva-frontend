"use client";

import { Loader2 } from "lucide-react";
import { useEffect, type ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

type BillingPlanConfirmModalProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  isDanger?: boolean;
  isBusy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function BillingPlanConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  isDanger = false,
  isBusy = false,
  onConfirm,
  onCancel,
}: BillingPlanConfirmModalProps): ReactElement | null {
  const { t } = useTranslations();

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape" && !isBusy) {
        onCancel();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [open, isBusy, onCancel]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-scrim/60 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isBusy) {
          onCancel();
        }
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="billing-plan-confirm-title"
        aria-describedby="billing-plan-confirm-desc"
        className="relative w-full max-w-md rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-xl"
      >
        <h2 id="billing-plan-confirm-title" className="text-lg font-bold text-on-surface">
          {title}
        </h2>
        <p
          id="billing-plan-confirm-desc"
          className="mt-3 text-sm leading-relaxed text-on-surface-variant"
        >
          {description}
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            disabled={isBusy}
            onClick={onCancel}
            className="rounded-xl border border-outline-variant/30 px-4 py-2.5 text-sm font-bold text-on-surface transition-opacity disabled:opacity-50"
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            disabled={isBusy}
            onClick={onConfirm}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-opacity disabled:opacity-50 ${
              isDanger
                ? "border border-error/40 bg-error/15 text-error hover:bg-error/25"
                : "bg-primary text-on-primary"
            }`}
          >
            {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isBusy ? t("billing.pleaseWait") : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
