"use client";

import type { ComposerPublishProgressRow } from "@/lib/post-composer/composerPublishProgressRows";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

interface PostSchedulerPublishResultRowProps {
  readonly row: ComposerPublishProgressRow;
}

/** Compact tile: platform label, spinner or status (matches mobile overlay cards). */
export function PostSchedulerPublishResultRow({
  row,
}: PostSchedulerPublishResultRowProps): React.ReactElement {
  const { t } = useTranslations();
  const showLoader = row.phase === "pending" || row.phase === "posting";
  const statusText = showLoader
    ? t("postScheduler.publish.posting")
    : row.success
      ? t("postScheduler.publish.posted")
      : t("postScheduler.publish.failed");

  return (
    <div className="relative flex min-w-0 flex-col items-center overflow-hidden rounded-lg border border-outline-variant/15 bg-surface-container-low/90 px-1.5 py-2">
      <p className="w-full text-center text-[10px] font-bold leading-tight text-on-surface line-clamp-2">
        {row.label}
      </p>
      <div className="mt-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-container/15">
        {showLoader ? (
          <span
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-container border-t-transparent"
            aria-hidden
          />
        ) : row.success ? (
          <span className="material-symbols-outlined text-lg text-green-400">
            check_circle
          </span>
        ) : (
          <span className="material-symbols-outlined text-lg text-red-400">
            error
          </span>
        )}
      </div>
      <p
        className={`mt-0.5 w-full text-center text-[9px] font-bold ${
          !showLoader && !row.success ? "text-red-400" : "text-on-surface-variant"
        }`}
      >
        {statusText}
      </p>
    </div>
  );
}
