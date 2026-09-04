"use client";

import type { ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { UnifiedMediaListItem } from "@/lib/social/unifiedMediaApi";
import { mediaDisplayFilename } from "@/lib/social/mediaDisplayFilename";

import { SaveToCloudControl } from "../../_components/cloud-save/SaveToCloudControl";
import type { CloudExportSource } from "@/lib/social/cloudStorageApi";

import { PostSchedulerMediaLibraryDeleteButton } from "./PostSchedulerMediaLibraryDeleteButton";
import { PostSchedulerMediaLibraryDownloadButton } from "./PostSchedulerMediaLibraryDownloadButton";
import { PostSchedulerVideoWithControls } from "./PostSchedulerVideoWithControls";
import { MediaLibraryEditInCanvaButton } from "./MediaLibraryEditInCanvaButton";

function SelectionBadge({
  isSelected,
  selectionMode,
}: {
  isSelected: boolean;
  selectionMode: boolean;
}): ReactElement | null {
  if (!selectionMode) {
    return null;
  }
  return (
    <span
      className={`pointer-events-none absolute left-2 top-2 z-[20] flex h-7 w-7 items-center justify-center rounded-full shadow-md ring-2 ${
        isSelected
          ? "bg-primary text-on-primary ring-white/25"
          : "bg-surface/90 text-on-surface ring-white/15"
      }`}
    >
      <span
        className="material-symbols-outlined text-base"
        style={{ fontVariationSettings: isSelected ? "'FILL' 1" : undefined }}
      >
        {isSelected ? "check_box" : "check_box_outline_blank"}
      </span>
    </span>
  );
}

function ScheduledLockBadge(): ReactElement {
  const { t } = useTranslations();
  return (
    <div className="pointer-events-none absolute bottom-1.5 left-1.5 right-1.5 z-[18] rounded-md bg-surface/95 px-1.5 py-0.5 text-center text-[8px] font-semibold leading-tight text-on-surface-variant shadow-sm ring-1 ring-outline-variant/20">
      {t("postScheduler.mediaLibrary.scheduled")}
    </div>
  );
}

function UseInPostBadge({ label }: { label: string }): ReactElement {
  return (
    <div className="pointer-events-none absolute inset-x-2 bottom-2 z-[16] flex justify-center opacity-0 transition-opacity group-hover:opacity-100">
      <span className="flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-on-primary shadow-md">
        <span className="material-symbols-outlined text-xs leading-none" aria-hidden>
          edit_square
        </span>
        {label}
      </span>
    </div>
  );
}

function UseInPostHoverOverlay({
  label,
  onUse,
}: {
  label: string;
  onUse: () => void;
}): ReactElement {
  return (
    <div className="absolute inset-0 z-[10] flex flex-col items-center justify-end gap-1.5 bg-gradient-to-t from-black/75 via-black/25 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onUse();
        }}
        className="inline-flex h-8 w-full items-center justify-center gap-1 rounded-lg bg-primary px-2 text-[11px] font-bold text-on-primary shadow-md transition-colors hover:bg-primary/90"
      >
        <span className="material-symbols-outlined text-sm leading-none" aria-hidden>
          edit_square
        </span>
        {label}
      </button>
    </div>
  );
}

export function PostSchedulerMediaLibraryTile({
  item,
  variant,
  isAttached,
  onPick,
  embedded = false,
  masonry = false,
  selectionMode = false,
  isSelected = false,
  isScheduledLocked = false,
  showDownload = false,
  showSaveToCloud = false,
  useInPostLabel,
  onToggleSelect,
  onRequestDelete,
}: {
  item: UnifiedMediaListItem;
  variant: "image" | "video" | "document";
  isAttached: boolean;
  onPick: () => void;
  embedded?: boolean;
  /** Stock-style natural height (library / modal). Embedded sidebar stays fixed aspect. */
  masonry?: boolean;
  selectionMode?: boolean;
  isSelected?: boolean;
  isScheduledLocked?: boolean;
  showDownload?: boolean;
  showSaveToCloud?: boolean;
  useInPostLabel?: string;
  onToggleSelect?: () => void;
  onRequestDelete?: () => void;
}): ReactElement {
  const { t } = useTranslations();
  const useStockHover = Boolean(useInPostLabel && !selectionMode);
  const cloudSource: CloudExportSource = {
    sourceType: "postsiva_media",
    mediaId: item.media_id,
    ...(item.media_type === "image" || item.media_type === "video"
      ? { mediaType: item.media_type }
      : {}),
    ...(item.filename ? { filename: item.filename } : {}),
    ...(item.public_url ? { downloadUrl: item.public_url } : {}),
  };
  const saveToCloud =
    showSaveToCloud && !selectionMode ? (
      <SaveToCloudControl
        source={cloudSource}
        cornerClassName={
          useStockHover
            ? "absolute right-2 top-2 z-[25]"
            : "absolute bottom-2 left-2 z-[26]"
        }
      />
    ) : null;
  const aspectClass = embedded
    ? "aspect-[4/3] w-full min-h-0"
    : "aspect-square w-full min-h-0";
  const sizeClass = masonry ? "w-full min-h-0" : aspectClass;

  const ringClass = selectionMode
    ? isSelected
      ? "ring-2 ring-primary shadow-[0_8px_24px_-12px_rgba(107,73,216,0.35)]"
      : "ring-outline-variant/20 hover:ring-primary/40"
    : isAttached
      ? "ring-2 ring-secondary shadow-[0_8px_24px_-12px_rgba(107,73,216,0.45)]"
      : "ring-outline-variant/20 hover:ring-secondary/50 hover:shadow-md";

  const shellClass = `group relative ${sizeClass} overflow-hidden rounded-xl ring-1 transition-all ${ringClass}`;

  const handleActivate = (): void => {
    if (selectionMode) {
      onToggleSelect?.();
      return;
    }
    onPick();
  };

  const pickLabel =
    !selectionMode && useInPostLabel
      ? useInPostLabel
      : selectionMode
      ? isSelected
        ? variant === "video"
          ? t("postScheduler.mediaLibrary.deselectVideo")
          : variant === "document"
            ? t("postScheduler.mediaLibrary.deselectDocument")
            : t("postScheduler.mediaLibrary.deselectImage")
        : variant === "video"
          ? t("postScheduler.mediaLibrary.selectVideo")
          : variant === "document"
            ? t("postScheduler.mediaLibrary.selectDocument")
            : t("postScheduler.mediaLibrary.selectImage")
      : isAttached
        ? variant === "video"
          ? t("postScheduler.mediaLibrary.removeVideo")
          : variant === "document"
            ? t("postScheduler.mediaLibrary.removeDocument")
            : t("postScheduler.mediaLibrary.removeImage")
        : variant === "video"
          ? t("postScheduler.mediaLibrary.addVideo")
          : variant === "document"
            ? t("postScheduler.mediaLibrary.addDocument")
            : t("postScheduler.mediaLibrary.addImage");

  if (variant === "document") {
    const displayName = mediaDisplayFilename(item);
    const thumbUrl = item.thumbnail_url?.trim();
    return (
      <button
        type="button"
        aria-label={pickLabel}
        onClick={handleActivate}
        className={`${shellClass} flex flex-col overflow-hidden bg-surface-container-high text-center ${masonry ? "min-h-[8rem]" : ""}`}
      >
        <div className={`relative min-h-0 w-full flex-1 bg-surface-container-highest ${masonry ? "min-h-[6rem]" : ""}`}>
          {thumbUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- storage CDN thumbnail
            <img
              alt=""
              className={masonry ? "block h-auto w-full" : "h-full w-full object-cover object-top"}
              src={thumbUrl}
            />
          ) : (
            <div className="flex h-full min-h-[72px] items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-outline/50" aria-hidden>
                description
              </span>
            </div>
          )}
        </div>
        <span className="line-clamp-2 w-full px-2 py-1.5 text-[10px] font-semibold text-on-surface">
          {displayName}
        </span>
        <SelectionBadge isSelected={isSelected} selectionMode={selectionMode} />
        {!selectionMode ? <MediaLibraryEditInCanvaButton item={item} /> : null}
        {isScheduledLocked ? <ScheduledLockBadge /> : null}
        {showDownload && !selectionMode && !useStockHover ? (
          <PostSchedulerMediaLibraryDownloadButton item={item} embedded={embedded} />
        ) : null}
        {saveToCloud}
        {!selectionMode && onRequestDelete ? (
          <PostSchedulerMediaLibraryDeleteButton
            embedded={embedded}
            disabled={isScheduledLocked}
            disabledReason={
              isScheduledLocked
                ? t("postScheduler.mediaLibrary.deleteBlockedScheduled")
                : undefined
            }
            onDelete={onRequestDelete}
          />
        ) : null}
        {!selectionMode && useInPostLabel && useStockHover ? (
          <UseInPostHoverOverlay label={useInPostLabel} onUse={onPick} />
        ) : !selectionMode && useInPostLabel ? (
          <UseInPostBadge label={useInPostLabel} />
        ) : null}
      </button>
    );
  }

  if (variant === "video") {
    const thumbUrl = item.thumbnail_url?.trim();
    return (
      <div className={`${shellClass} bg-black text-left`}>
        {masonry ? (
          <>
            {thumbUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- storage CDN thumbnail
              <img alt="" className="block h-auto w-full" src={thumbUrl} />
            ) : (
              <video
                className="block h-auto w-full"
                src={item.public_url}
                muted
                playsInline
                preload="metadata"
              />
            )}
            <span className="pointer-events-none absolute left-2 top-2 z-[5] flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">
              <span className="material-symbols-outlined text-xs leading-none" aria-hidden>
                play_arrow
              </span>
              {t("postScheduler.mediaLibrary.filterVideos")}
            </span>
          </>
        ) : (
          <PostSchedulerVideoWithControls
            src={item.public_url}
            size="compact"
            className="h-full w-full"
          />
        )}
        <SelectionBadge isSelected={isSelected} selectionMode={selectionMode} />
        {!selectionMode ? <MediaLibraryEditInCanvaButton item={item} /> : null}
        {!selectionMode && !useStockHover ? (
          <span className="pointer-events-none absolute right-2 top-2 z-[15] flex h-8 w-8 items-center justify-center rounded-full bg-surface/95 shadow-lg ring-1 ring-white/20">
            {isAttached ? (
              <span
                className="material-symbols-outlined text-base text-secondary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
            ) : (
              <span className="material-symbols-outlined text-base text-on-surface">add</span>
            )}
          </span>
        ) : null}
        {showDownload && !selectionMode && !useStockHover ? (
          <PostSchedulerMediaLibraryDownloadButton item={item} embedded={embedded} />
        ) : null}
        {saveToCloud}
        {!selectionMode && onRequestDelete ? (
          <PostSchedulerMediaLibraryDeleteButton
            embedded={embedded}
            disabled={isScheduledLocked}
            disabledReason={
              isScheduledLocked
                ? t("postScheduler.mediaLibrary.deleteBlockedScheduled")
                : undefined
            }
            onDelete={onRequestDelete}
          />
        ) : null}
        {isScheduledLocked ? <ScheduledLockBadge /> : null}
        {!selectionMode && isAttached ? (
          <div className="pointer-events-none absolute bottom-2 left-2 z-[5] rounded-md bg-secondary/95 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-on-secondary shadow-md">
            {t("postScheduler.mediaLibrary.added")}
          </div>
        ) : null}
        {!selectionMode && useInPostLabel && useStockHover ? (
          <UseInPostHoverOverlay label={useInPostLabel} onUse={onPick} />
        ) : !selectionMode && useInPostLabel ? (
          <UseInPostBadge label={useInPostLabel} />
        ) : null}
        {!useStockHover ? (
          <button
            type="button"
            onClick={handleActivate}
            className="absolute inset-0 z-[10] cursor-pointer rounded-xl"
            aria-pressed={selectionMode ? isSelected : isAttached}
            aria-label={pickLabel}
          />
        ) : selectionMode ? (
          <button
            type="button"
            onClick={handleActivate}
            className="absolute inset-0 z-[10] cursor-pointer rounded-xl"
            aria-pressed={isSelected}
            aria-label={pickLabel}
          />
        ) : null}
      </div>
    );
  }

  const imgFitClass = masonry
    ? "block h-auto w-full transition-transform duration-300 group-hover:scale-[1.02]"
    : embedded
      ? "h-full w-full object-contain"
      : "h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]";

  return (
    <div className={`${shellClass} bg-surface-container-highest text-left`} title={item.filename || t("postScheduler.mediaLibrary.mediaFallback")}>
      {/* eslint-disable-next-line @next/next/no-img-element -- library CDN URL */}
      <img alt="" className={imgFitClass} src={item.public_url} />
      <SelectionBadge isSelected={isSelected} selectionMode={selectionMode} />
      {!selectionMode ? <MediaLibraryEditInCanvaButton item={item} /> : null}
      {!selectionMode && isAttached ? (
        <>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 via-black/35 to-transparent px-2 py-2 pt-8">
            <p className="text-center text-[10px] font-bold uppercase tracking-wide text-white">
              {t("postScheduler.mediaLibrary.added")}
            </p>
          </div>
          <span className="pointer-events-none absolute right-2 top-2 z-[15] flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-on-secondary shadow-lg ring-2 ring-white/20">
            <span
              className="material-symbols-outlined text-lg"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
          </span>
        </>
      ) : !selectionMode && !useStockHover ? (
        <span className="pointer-events-none absolute right-2 top-2 z-[15] flex h-8 w-8 items-center justify-center rounded-full bg-surface/90 text-on-surface opacity-0 shadow-md ring-1 ring-white/15 transition-opacity group-hover:opacity-100">
          <span className="material-symbols-outlined text-base">add</span>
        </span>
      ) : null}
      {showDownload && !selectionMode && !useStockHover ? (
        <PostSchedulerMediaLibraryDownloadButton item={item} embedded={embedded} />
      ) : null}
      {saveToCloud}
      {!selectionMode && onRequestDelete ? (
        <PostSchedulerMediaLibraryDeleteButton
          embedded={embedded}
          disabled={isScheduledLocked}
          disabledReason={
            isScheduledLocked
              ? t("postScheduler.mediaLibrary.deleteBlockedScheduled")
              : undefined
          }
          onDelete={onRequestDelete}
        />
      ) : null}
      {isScheduledLocked ? <ScheduledLockBadge /> : null}
      {!selectionMode && useInPostLabel && useStockHover ? (
        <UseInPostHoverOverlay label={useInPostLabel} onUse={onPick} />
      ) : !selectionMode && useInPostLabel ? (
        <UseInPostBadge label={useInPostLabel} />
      ) : null}
      {!useStockHover ? (
        <button
          type="button"
          onClick={handleActivate}
          className="absolute inset-0 z-[10] cursor-pointer rounded-xl"
          aria-pressed={selectionMode ? isSelected : isAttached}
          aria-label={pickLabel}
        />
      ) : selectionMode ? (
        <button
          type="button"
          onClick={handleActivate}
          className="absolute inset-0 z-[10] cursor-pointer rounded-xl"
          aria-pressed={isSelected}
          aria-label={pickLabel}
        />
      ) : null}
    </div>
  );
}
