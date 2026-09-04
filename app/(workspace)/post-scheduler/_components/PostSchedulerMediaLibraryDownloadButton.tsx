"use client";

import { useState, type MouseEvent, type ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import { downloadWorkspaceMediaFile } from "@/lib/social/downloadWorkspaceMediaFile";
import { mediaDisplayFilename } from "@/lib/social/mediaDisplayFilename";
import type { UnifiedMediaListItem } from "@/lib/social/unifiedMediaApi";

export function PostSchedulerMediaLibraryDownloadButton({
  item,
  embedded = false,
}: {
  item: UnifiedMediaListItem;
  embedded?: boolean;
}): ReactElement {
  const { t } = useTranslations();
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDownload = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    event.stopPropagation();
    if (downloading) {
      return;
    }

    const token = getStoredAccessToken();
    const workspaceId = getStoredActiveWorkspaceId();
    if (!token?.trim() || !workspaceId?.trim()) {
      setError(t("common.signInSelectWorkspace"));
      return;
    }

    setDownloading(true);
    setError(null);
    void downloadWorkspaceMediaFile(
      token,
      workspaceId,
      item.media_id,
      mediaDisplayFilename(item),
      item.media_type,
    )
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : t("common.downloadFailed"));
      })
      .finally(() => {
        setDownloading(false);
      });
  };

  const sizeClass = embedded ? "h-7 w-7" : "h-8 w-8";
  const iconClass = embedded ? "text-[15px]" : "text-base";

  const fileLabel = mediaDisplayFilename(item);
  const downloadLabel = t("common.downloadFile", { name: fileLabel });

  return (
    <>
      <button
        type="button"
        disabled={downloading}
        onClick={onDownload}
        title={downloadLabel}
        aria-label={downloadLabel}
        className={`absolute bottom-2 right-2 z-[25] flex ${sizeClass} items-center justify-center rounded-full bg-surface/95 text-on-surface shadow-lg ring-1 ring-white/20 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 hover:bg-surface-container-high disabled:cursor-wait disabled:opacity-100`}
      >
        <span
          className={`material-symbols-outlined ${iconClass} ${downloading ? "animate-spin" : ""}`}
          aria-hidden
        >
          {downloading ? "progress_activity" : "download"}
        </span>
      </button>
      {error ? (
        <span className="sr-only" role="alert">
          {error}
        </span>
      ) : null}
    </>
  );
}
