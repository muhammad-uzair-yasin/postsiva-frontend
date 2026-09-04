"use client";

import type { UnifiedMediaUploadWebResult } from "@/lib/social/unifiedMediaUploadWeb";
import type { ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { usePostSchedulerDeviceMediaUpload } from "../_hooks/usePostSchedulerDeviceMediaUpload";

interface PostSchedulerMediaLibraryUploadTriggerProps {
  readonly disabled?: boolean;
  readonly onUploaded: (result: UnifiedMediaUploadWebResult) => void;
  readonly onListRefresh: () => Promise<void>;
  /**
   * `embedded`: full-width pill (legacy).
   * `toolbar`: compact control for filter row (sidebar).
   * `standalone`: compact for non-embedded card.
   */
  readonly variant?: "embedded" | "toolbar" | "standalone";
}

export function PostSchedulerMediaLibraryUploadTrigger({
  disabled = false,
  onUploaded,
  onListRefresh,
  variant = "embedded",
}: PostSchedulerMediaLibraryUploadTriggerProps): ReactElement {
  const { t } = useTranslations();
  const {
    fileInputRef,
    uploading,
    progress,
    hint,
    openFilePicker,
    onFileInputChange,
  } = usePostSchedulerDeviceMediaUpload(onUploaded, onListRefresh);

  const inputDisabled = disabled || uploading;

  const buttonClass =
    variant === "embedded"
      ? "inline-flex w-full min-w-[8.5rem] items-center justify-center gap-2 rounded-xl border border-secondary/35 bg-gradient-to-br from-secondary/15 to-secondary/5 px-4 py-2.5 text-xs font-bold text-secondary shadow-sm transition-colors hover:border-secondary/55 hover:from-secondary/25 hover:to-secondary/10 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      : variant === "toolbar"
        ? "inline-flex h-8 max-h-8 min-h-8 shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-lg border border-secondary/35 bg-gradient-to-br from-secondary/15 to-secondary/5 px-2 py-0 text-[10px] font-bold leading-none text-secondary shadow-sm transition-colors hover:border-secondary/55 hover:from-secondary/25 hover:to-secondary/10 disabled:cursor-not-allowed disabled:opacity-50"
        : "inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-secondary/35 bg-secondary/10 px-3 text-xs font-bold text-secondary transition-colors hover:bg-secondary/20 disabled:cursor-not-allowed disabled:opacity-50";

  const outerClass =
    variant === "embedded"
      ? "flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:min-w-[10rem]"
      : variant === "toolbar"
        ? "flex min-w-0 shrink-0 flex-col items-center justify-center gap-1.5"
        : "flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:min-w-[10rem]";

  return (
    <div className={outerClass}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*,.pdf,.ppt,.pptx,.doc,.docx,application/pdf"
        multiple
        className="hidden"
        aria-hidden
        disabled={inputDisabled}
        onChange={onFileInputChange}
      />
      <button
        type="button"
        disabled={inputDisabled}
        onClick={openFilePicker}
        className={buttonClass}
        aria-label={t("postScheduler.mediaLibrary.uploadAria")}
      >
        <span
          className={`material-symbols-outlined leading-none ${variant === "toolbar" ? "text-base" : "text-xl"} ${uploading ? "animate-spin" : ""}`}
          aria-hidden
        >
          {uploading ? "progress_activity" : "cloud_upload"}
        </span>
        <span className={uploading ? "animate-pulse" : undefined}>
          {uploading ? "…" : t("postScheduler.mediaLibrary.upload")}
        </span>
      </button>
      {uploading ? (
        <div className="w-full min-w-0 rounded-lg border border-outline-variant/20 bg-surface-container-low/90 px-2 py-1.5 shadow-inner">
          <div className="mb-1 h-1 overflow-hidden rounded-full bg-outline-variant/20">
            <div
              className="h-full rounded-full bg-secondary transition-[width] duration-200"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
          <p className="truncate text-[10px] font-medium tabular-nums text-on-surface-variant">
            {progress}%
            {hint ? ` · ${hint}` : ""}
          </p>
        </div>
      ) : null}
      {hint && !uploading ? (
        <p className="max-w-[12rem] text-[10px] leading-snug text-amber-700 dark:text-amber-300/90">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
