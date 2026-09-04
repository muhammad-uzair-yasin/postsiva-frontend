"use client";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

/** User turned off live preview (mirrors mobile “Show” switch). */
export function PostSchedulerLivePreviewOffPlaceholder(): React.ReactElement {
  const { t } = useTranslations();

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-outline-variant/20 bg-surface-container-low/40 py-16 text-center">
      <span className="material-symbols-outlined text-5xl text-on-surface-variant/50">
        visibility_off
      </span>
      <p className="max-w-xs text-sm text-on-surface-variant">
        {t("postScheduler.preview.offHint")}
      </p>
    </div>
  );
}
