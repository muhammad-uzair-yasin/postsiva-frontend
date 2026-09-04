"use client";

import { useSyncExternalStore, type ReactElement, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

const subscribeToClient = () => () => undefined;

/** Almost full-screen composer media modal frame (library, stock, etc.). */
export const COMPOSER_MEDIA_MODAL_PANEL_CLASS =
  "pointer-events-auto relative z-10 flex h-[min(94vh,60rem)] w-full max-w-[min(100%,88rem)] flex-col overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-high shadow-2xl";

export function PostSchedulerComposerMediaModalShell({
  visible,
  title,
  titleId,
  overlayClassName = "z-[1090]",
  panelClassName,
  onClose,
  onBack,
  children,
}: {
  readonly visible: boolean;
  readonly title: ReactNode;
  readonly titleId: string;
  readonly overlayClassName?: string;
  readonly panelClassName?: string;
  readonly onClose: () => void;
  readonly onBack?: () => void;
  readonly children: ReactNode;
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
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black/55 p-3 sm:p-4 ${overlayClassName}`}
    >
      <button
        type="button"
        aria-label={t("common.dismiss")}
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={panelClassName ?? COMPOSER_MEDIA_MODAL_PANEL_CLASS}
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-outline-variant/15 px-4 py-3.5 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                aria-label={t("common.back")}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]" aria-hidden>
                  arrow_back
                </span>
              </button>
            ) : null}
            <h2 id={titleId} className="truncate font-headline text-base font-bold text-on-surface sm:text-lg">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-xl bg-primary px-4 py-2 font-body text-xs font-bold text-on-primary shadow-md transition-colors hover:bg-primary/90"
          >
            {t("postScheduler.mediaLibrary.modalDone")}
          </button>
        </header>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-4 sm:p-6">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
