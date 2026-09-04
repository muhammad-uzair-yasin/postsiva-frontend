"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

interface LogoutConfirmModalProps {
  readonly open: boolean;
  readonly busy: boolean;
  readonly apiError: string | null;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
}

export function LogoutConfirmModal({
  open,
  busy,
  apiError,
  onCancel,
  onConfirm,
}: LogoutConfirmModalProps): React.ReactElement | null {
  const { t } = useTranslations();
  const root = typeof document !== "undefined" ? document.body : null;

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape" && !busy) {
        onCancel();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, [open, busy, onCancel]);

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

  if (!open || !root) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[300] flex min-h-dvh items-center justify-center bg-black/55 p-4 sm:p-5"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) {
          onCancel();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-confirm-title"
        className="relative z-[1] w-full max-w-md shrink-0 rounded-2xl border border-outline-variant/20 bg-surface-container-high p-5 shadow-2xl"
      >
        <h2
          id="logout-confirm-title"
          className="font-headline text-lg font-bold text-on-surface"
        >
          {t("common.logout.title")}
        </h2>
        <p className="mt-3 font-body text-sm leading-relaxed text-on-surface-variant">
          {t("common.logout.body")}
        </p>
        {apiError ? (
          <p className="mt-3 text-sm text-error" role="alert">
            {apiError}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            className="rounded-xl px-5 py-3 font-body text-sm font-bold text-on-surface-variant transition-opacity hover:opacity-90 disabled:opacity-50"
            disabled={busy}
            onClick={onCancel}
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            className="rounded-xl border border-error/40 bg-error/15 px-5 py-3 font-body text-sm font-bold text-error transition-opacity hover:bg-error/25 disabled:opacity-60"
            disabled={busy}
            onClick={() => {
              void onConfirm();
            }}
          >
            {busy ? t("common.logout.busy") : t("common.logout.confirm")}
          </button>
        </div>
      </div>
    </div>,
    root,
  );
}
