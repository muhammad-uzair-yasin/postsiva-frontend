"use client";

import { useSyncExternalStore, type ReactElement } from "react";
import { createPortal } from "react-dom";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

const subscribeToClient = () => () => undefined;

export function PostSchedulerMediaLibraryDeleteConfirmModal({
  visible,
  deleting,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  deleting?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}): ReactElement | null {
  const { t } = useTranslations();
  const mounted = useSyncExternalStore(
    subscribeToClient,
    () => true,
    () => false,
  );

  if (!visible || !mounted) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[1100] bg-black/55">
      <button
        type="button"
        aria-label={t("common.dismiss")}
        className="absolute inset-0 cursor-default"
        onClick={deleting ? undefined : onCancel}
      />
      <div className="pointer-events-none fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-5">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="media-library-delete-title"
          className="pointer-events-auto relative z-10 w-full rounded-2xl border border-outline-variant/20 bg-surface-container-high p-5 shadow-2xl"
        >
          <h2
            id="media-library-delete-title"
            className="font-headline text-lg font-bold text-on-surface"
          >
            {t("postScheduler.mediaLibrary.deleteConfirmTitle")}
          </h2>
          <p className="mt-3 font-body text-sm leading-relaxed text-on-surface-variant">
            {t("postScheduler.mediaLibrary.deleteConfirmBody")}
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              disabled={deleting}
              className="rounded-xl px-5 py-3 font-body text-sm font-bold text-on-surface-variant transition-opacity hover:opacity-90 disabled:opacity-50"
              onClick={onCancel}
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              disabled={deleting}
              className="rounded-xl bg-error px-5 py-3 font-body text-sm font-bold text-on-error transition-opacity hover:opacity-95 disabled:opacity-50"
              onClick={onConfirm}
            >
              {deleting ? t("common.saving") : t("common.ok")}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
