"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { formatPublishFailureMessage } from "@/lib/post-composer/formatPublishFailureMessage";
import type { ComposerPublishOverlayState } from "../_types/postSchedulerUnifiedPostTypes";
import { PostSchedulerPublishResultRow } from "./PostSchedulerPublishResultRow";

interface PostSchedulerPublishOverlayProps {
  readonly overlay: ComposerPublishOverlayState | null;
  readonly onDismiss: () => void;
}

export function PostSchedulerPublishOverlay({
  overlay,
  onDismiss,
}: PostSchedulerPublishOverlayProps): React.ReactElement | null {
  const { t } = useTranslations();
  const [mounted, setMounted] = useState(false);
  const visible = overlay !== null;
  const isSummary = overlay?.mode === "summary";
  const variant = overlay?.variant ?? "partial";

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!visible || !overlay) {
    return null;
  }
  if (!mounted) {
    return null;
  }

  const failedRows = overlay.rows.filter(
    (row) => row.phase === "done" && !row.success,
  );
  const liveRows = overlay.rows.filter(
    (row) => row.phase === "done" && row.success && row.urls.length > 0,
  );

  const title =
    overlay.mode === "progress"
      ? t("postScheduler.publish.overlayPublishing")
      : variant === "success"
        ? t("postScheduler.publish.overlayAllSet")
        : t("postScheduler.publish.overlayResults");

  const subtitle =
    overlay.mode === "progress"
      ? t("postScheduler.publish.overlayProgressSubtitle")
      : variant === "success"
        ? t("postScheduler.publish.overlaySuccessSubtitle")
        : t("postScheduler.publish.overlayPartialSubtitle");

  return createPortal(
    <div className="fixed inset-0 z-[210] bg-black/65">
      <button
        type="button"
        aria-label={isSummary ? t("common.dismiss") : undefined}
        className="absolute inset-0 cursor-default"
        disabled={!isSummary}
        onClick={isSummary ? onDismiss : undefined}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="fixed left-1/2 top-1/2 z-10 flex max-h-[min(72vh,560px)] w-[min(92vw,28rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-high shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-outline-variant/15 px-5 pb-4 pt-5">
          <div className="flex items-center gap-2.5">
            <span
              className={`material-symbols-outlined text-[28px] ${
                overlay.mode === "progress"
                  ? "text-primary-container"
                  : variant === "success"
                    ? "text-green-400"
                    : "text-amber-400"
              }`}
            >
              {overlay.mode === "progress"
                ? "cloud_upload"
                : variant === "success"
                  ? "check_circle"
                  : "info"}
            </span>
            <h2 className="font-headline text-xl font-bold text-on-surface">
              {title}
            </h2>
          </div>
          <p className="mt-2 font-body text-sm leading-relaxed text-on-surface-variant">
            {subtitle}
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-3">
          {overlay.warnings.length > 0 ? (
            <div className="mb-3 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2.5">
              {overlay.warnings.map((w, i) => (
                <p
                  key={`w-${i}`}
                  className="font-body text-xs leading-snug text-on-surface"
                >
                  {w}
                </p>
              ))}
            </div>
          ) : null}

          <div className="grid grid-cols-4 gap-1.5 pb-3">
            {overlay.rows.map((row) => (
              <PostSchedulerPublishResultRow key={row.id} row={row} />
            ))}
          </div>

          {liveRows.length > 0 ? (
            <div className="space-y-2 pb-4">
              {liveRows.map((row) => (
                <a
                  key={`live-${row.id}`}
                  href={row.urls[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-secondary/30 bg-secondary/10 px-4 py-3 font-body text-sm font-bold text-secondary transition-colors hover:bg-secondary/20"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    open_in_new
                  </span>
                  {t("postScheduler.publish.seePost", { label: row.label })}
                </a>
              ))}
            </div>
          ) : null}

          {failedRows.length > 0 ? (
            <div className="space-y-2.5 pb-4">
              {failedRows.map((row) => (
                <div
                  key={`fail-${row.id}`}
                  className="rounded-xl border border-red-500/25 bg-red-500/10 px-3.5 py-3"
                >
                  <p className="flex items-center gap-1.5 font-body text-xs font-bold text-red-400">
                    <span className="material-symbols-outlined text-[16px]">
                      error
                    </span>
                    {t("postScheduler.publish.failedDetailTitle", {
                      label: row.label,
                    })}
                  </p>
                  <p className="mt-1.5 whitespace-pre-wrap break-words font-body text-[13px] leading-relaxed text-on-surface">
                    {formatPublishFailureMessage(row.message, row.error) ||
                      t("postScheduler.publish.failed")}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {isSummary ? (
          <div className="flex flex-shrink-0 items-center justify-end border-t border-outline-variant/15 bg-surface-container/90 px-5 py-3.5">
            <button
              type="button"
              className="rounded-xl bg-primary-container px-6 py-2.5 font-body text-sm font-bold text-on-primary-container transition-opacity hover:opacity-95"
              onClick={onDismiss}
            >
              {t("postScheduler.publish.done")}
            </button>
          </div>
        ) : (
          <div className="flex-shrink-0 border-t border-outline-variant/15 bg-surface-container/90 px-5 py-3.5">
            <p className="text-center font-body text-xs text-on-surface-variant">
              {t("postScheduler.publish.stayOnScreen")}
            </p>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
