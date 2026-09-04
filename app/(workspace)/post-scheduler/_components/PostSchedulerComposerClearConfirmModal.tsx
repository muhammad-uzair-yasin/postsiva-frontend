"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

interface PostSchedulerComposerClearConfirmModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onConfirm: () => void;
}

export function PostSchedulerComposerClearConfirmModal({
  open,
  onConfirm,
  onClose,
}: PostSchedulerComposerClearConfirmModalProps): React.ReactElement | null {
  const { t } = useTranslations();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!open || !mounted) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[1000] bg-black/55">
      <button
        type="button"
        aria-label={t("common.dismiss")}
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div className="pointer-events-none fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-5">
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="composer-clear-title"
          className="pointer-events-auto relative z-10 w-full rounded-2xl border border-outline-variant/20 bg-surface-container-high p-5 shadow-2xl"
        >
          <h2
            id="composer-clear-title"
            className="font-headline text-lg font-bold text-on-surface"
          >
            {t("composer.clearComposerTitle")}
          </h2>
          <p className="mt-3 whitespace-pre-line font-body text-sm leading-relaxed text-on-surface-variant">
            {t("composer.clearComposerMessage")}
          </p>
          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              className="rounded-xl px-4 py-3 font-body text-sm font-bold text-on-surface-variant hover:bg-surface-container"
              onClick={onClose}
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              className="rounded-xl bg-error px-5 py-3 font-body text-sm font-bold text-on-error transition-opacity hover:opacity-95"
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              {t("composer.clearComposerConfirm")}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
