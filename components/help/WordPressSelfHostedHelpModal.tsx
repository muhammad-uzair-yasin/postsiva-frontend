"use client";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { WordPressSelfHostedHelpContent } from "./WordPressSelfHostedHelpContent";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function WordPressSelfHostedHelpModal({ open, onClose }: Props): React.ReactElement | null {
  const { t } = useTranslations();

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center bg-black/75 p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wordpress-self-hosted-help-title"
      onClick={onClose}
    >
      <div
        className="flex h-[min(88vh,920px)] w-[min(96vw,1280px)] max-h-[88vh] flex-col overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface text-on-surface shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="relative shrink-0 overflow-hidden border-b border-outline-variant/25 px-6 py-5 sm:px-8">
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-secondary/14 via-transparent to-transparent"
            aria-hidden
          />
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary/15 text-secondary ring-1 ring-secondary/25">
                <span className="material-symbols-outlined text-[28px]">menu_book</span>
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-secondary">
                  {t("adPlatform.wordpressSetupGuideEyebrow")}
                </p>
                <h2
                  id="wordpress-self-hosted-help-title"
                  className="mt-1 text-xl font-bold tracking-tight sm:text-2xl"
                >
                  {t("adPlatform.wordpressSetupGuideTitle")}
                </h2>
                <p className="mt-1 max-w-xl text-sm text-on-surface-variant">
                  {t("adPlatform.wordpressSetupGuideSubtitle")}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-outline-variant/30 bg-surface-container-low text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
              aria-label={t("adPlatform.wordpressSetupGuideClose")}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-8 sm:py-6">
          <WordPressSelfHostedHelpContent compact />
        </div>

        <footer className="flex shrink-0 flex-col gap-2 border-t border-outline-variant/25 bg-surface-container-low/50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="text-xs text-on-surface-variant">{t("adPlatform.wordpressSetupGuideFooterHint")}</p>
          <button
            type="button"
            onClick={onClose}
            className="h-11 shrink-0 rounded-xl bg-secondary px-8 text-sm font-semibold text-on-secondary shadow-sm transition hover:opacity-90 sm:min-w-[140px]"
          >
            {t("adPlatform.wordpressSetupGuideClose")}
          </button>
        </footer>
      </div>
    </div>
  );
}
