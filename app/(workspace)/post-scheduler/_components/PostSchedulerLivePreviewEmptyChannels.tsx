"use client";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

/** No channels selected — prompt user to pick destinations. */
export function PostSchedulerLivePreviewEmptyChannels(): React.ReactElement {
  const { t } = useTranslations();

  return (
    <div className="relative flex min-h-[min(320px,50vh)] min-w-0 flex-1 flex-col overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-surface-container-high/45 via-surface-container/88 to-surface-container-low/75 p-5 shadow-[0_24px_64px_-28px_rgba(0,0,0,0.5)] ring-1 ring-white/[0.05] sm:p-6 lg:p-7">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-secondary/35 to-transparent"
        aria-hidden
      />
      <div className="relative mb-4 space-y-1 sm:mb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-secondary/90">
          {t("postScheduler.preview.title")}
        </p>
        <h2 className="font-headline text-xl font-bold tracking-tight text-on-surface sm:text-2xl">
          {t("postScheduler.preview.livePreview")}
        </h2>
      </div>
      <div className="relative flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-outline-variant/20 bg-surface-container-low/30 py-14 text-center">
        <span className="material-symbols-outlined text-5xl text-on-surface-variant/35">
          hub
        </span>
        <p className="max-w-sm px-4 text-sm leading-relaxed text-on-surface-variant">
          {t("postScheduler.preview.emptyChannelsHint")}
        </p>
      </div>
    </div>
  );
}
