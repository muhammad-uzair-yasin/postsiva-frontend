"use client";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { PostSchedulerAiPanelBody } from "./PostSchedulerAiPanelBody";

interface PostSchedulerAiDrawerPanelContentProps {
  onClose: () => void;
}

export function PostSchedulerAiDrawerPanelContent({
  onClose,
}: PostSchedulerAiDrawerPanelContentProps): React.ReactElement {
  const { t } = useTranslations();

  return (
    <>
      <div className="mb-3 flex shrink-0 items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-[0_0_20px_rgba(107,73,216,0.4)]">
            <span
              className="material-symbols-outlined text-on-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
          </div>
          <div>
            <h2 className="font-headline text-base font-black uppercase leading-none text-primary">
              {t("postScheduler.aiToolkit.title")}
            </h2>
            <span className="text-[10px] font-medium uppercase tracking-tighter text-secondary">
              {t("postScheduler.aiToolkit.version")}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-white/5 hover:text-on-surface"
          aria-label={t("postScheduler.aiToolkit.closePanelAria")}
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
      </div>
      <PostSchedulerAiPanelBody />
    </>
  );
}
