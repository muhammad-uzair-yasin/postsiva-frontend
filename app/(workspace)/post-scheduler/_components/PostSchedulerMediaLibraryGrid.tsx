"use client";

import type { ReactElement } from "react";

import {
  MediaMasonryGrid,
  MediaMasonryItem,
} from "@/components/media/MediaMasonryGrid";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { UnifiedMediaListItem } from "@/lib/social/unifiedMediaApi";

import type { WorkspaceUnifiedMediaFilter } from "../_hooks/useWorkspaceUnifiedMediaLibrary";
import type { ComposerAttachedMedia } from "../_types/composerDraftTypes";
import { PostSchedulerMediaLibraryTile } from "./PostSchedulerMediaLibraryTile";

function isVideoItem(item: UnifiedMediaListItem): boolean {
  return item.media_type === "video";
}

function isDocumentItem(item: UnifiedMediaListItem): boolean {
  return item.media_type === "document";
}

const SCROLL_NO_BAR =
  "max-h-[min(24rem,50vh)] space-y-5 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";

interface PostSchedulerMediaLibraryGridProps {
  readonly embedded?: boolean;
  readonly filter: WorkspaceUnifiedMediaFilter;
  readonly items: readonly UnifiedMediaListItem[];
  readonly editorMedia: readonly ComposerAttachedMedia[];
  readonly hasMore: boolean;
  readonly loadingMore: boolean;
  readonly onPickItem: (item: UnifiedMediaListItem) => void;
  readonly onLoadMore: () => void;
  readonly selectionMode?: boolean;
  readonly selectedIds?: ReadonlySet<string>;
  readonly scheduledMediaIds?: ReadonlySet<string>;
  readonly onToggleSelect?: (mediaId: string) => void;
  readonly showDownload?: boolean;
  readonly showSaveToCloud?: boolean;
  readonly useInPostLabel?: string;
  /** Full-page layout: no internal max-height/scroll cap on the list. */
  readonly fullPage?: boolean;
  /** Force stock-style masonry (e.g. almost-fullscreen media modal). */
  readonly masonry?: boolean;
  readonly onRequestDelete?: (item: UnifiedMediaListItem) => void;
}

export function PostSchedulerMediaLibraryGrid({
  embedded = false,
  filter,
  items,
  editorMedia,
  hasMore,
  loadingMore,
  onPickItem,
  onLoadMore,
  selectionMode = false,
  selectedIds,
  scheduledMediaIds,
  onToggleSelect,
  showDownload = false,
  showSaveToCloud = false,
  useInPostLabel,
  fullPage = false,
  masonry: masonryProp = false,
  onRequestDelete,
}: PostSchedulerMediaLibraryGridProps): ReactElement {
  const { t } = useTranslations();
  const imageItems = items.filter((i) => i.media_type === "image");
  const videoItems = items.filter(isVideoItem);
  const documentItems = items.filter(isDocumentItem);
  const masonry = masonryProp || fullPage || !embedded;

  const isAttached = (id: string): boolean =>
    editorMedia.some((m) => m.mediaId === id);

  const listClass = embedded
    ? "w-full min-w-0 space-y-3"
    : fullPage
      ? "w-full min-w-0 space-y-5"
      : `${SCROLL_NO_BAR} pr-0.5`;

  /** Compact sidebar keeps a dense 2-col grid; library / modal use stock-style masonry. */
  const compactGridClass = "grid w-full min-w-0 grid-cols-2 gap-2.5 sm:gap-3";

  const renderTile = (item: UnifiedMediaListItem, variant: "image" | "video" | "document") => (
    <PostSchedulerMediaLibraryTile
      key={item.media_id}
      embedded={embedded}
      masonry={masonry}
      item={item}
      variant={variant}
      isAttached={isAttached(item.media_id)}
      selectionMode={selectionMode}
      isSelected={selectedIds?.has(item.media_id) ?? false}
      isScheduledLocked={scheduledMediaIds?.has(item.media_id) ?? false}
      showDownload={showDownload}
      showSaveToCloud={showSaveToCloud}
      useInPostLabel={useInPostLabel}
      onToggleSelect={() => {
        onToggleSelect?.(item.media_id);
      }}
      onRequestDelete={
        onRequestDelete
          ? () => {
              onRequestDelete(item);
            }
          : undefined
      }
      onPick={() => {
        onPickItem(item);
      }}
    />
  );

  const renderItems = (
    list: readonly UnifiedMediaListItem[],
    variant: "image" | "video" | "document",
  ): ReactElement => {
    if (masonry) {
      return (
        <MediaMasonryGrid>
          {list.map((item) => (
            <MediaMasonryItem key={item.media_id}>
              {renderTile(item, variant)}
            </MediaMasonryItem>
          ))}
        </MediaMasonryGrid>
      );
    }
    return (
      <div className={compactGridClass}>
        {list.map((item) => renderTile(item, variant))}
      </div>
    );
  };

  return (
    <div
      className={
        embedded
          ? "flex h-full min-h-0 w-full min-w-0 flex-1 flex-col gap-2"
          : "flex min-h-0 min-w-0 flex-1 flex-col gap-4"
      }
    >
      <div className={listClass}>
        {filter === "all" ? (
          <>
            {imageItems.length > 0 ? (
              <section
                aria-label={t("postScheduler.mediaLibrary.imagesSection")}
                className="min-w-0"
              >
                {embedded ? null : (
                  <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-on-surface-variant/90">
                    {t("postScheduler.mediaLibrary.imagesSection")}
                  </p>
                )}
                {renderItems(imageItems, "image")}
              </section>
            ) : null}
            {imageItems.length > 0 && videoItems.length > 0 ? (
              <div
                className="border-t border-outline-variant/12 pt-1"
                role="separator"
                aria-hidden
              />
            ) : null}
            {videoItems.length > 0 ? (
              <section
                aria-label={t("postScheduler.mediaLibrary.videosSection")}
                className="min-w-0"
              >
                <p
                  className={`font-bold uppercase tracking-[0.14em] text-on-surface-variant/90 ${embedded ? "mb-1 text-[9px]" : "mb-2.5 text-[10px]"}`}
                >
                  {t("postScheduler.mediaLibrary.videosSection")}
                </p>
                {renderItems(videoItems, "video")}
              </section>
            ) : null}
            {documentItems.length > 0 ? (
              <section aria-label="Documents" className="min-w-0">
                <p
                  className={`font-bold uppercase tracking-[0.14em] text-on-surface-variant/90 ${embedded ? "mb-1 text-[9px]" : "mb-2.5 text-[10px]"}`}
                >
                  {t("postScheduler.mediaLibrary.documentsSection")}
                </p>
                {renderItems(documentItems, "document")}
              </section>
            ) : null}
          </>
        ) : (
          renderItems(
            filter === "image"
              ? imageItems
              : filter === "document"
                ? documentItems
                : videoItems,
            filter === "video" ? "video" : filter === "document" ? "document" : "image",
          )
        )}
      </div>
      {hasMore ? (
        <button
          type="button"
          disabled={loadingMore}
          onClick={() => {
            onLoadMore();
          }}
          className="flex w-full min-w-0 items-center justify-center gap-2 rounded-xl border border-outline-variant/20 bg-surface-container-high/60 py-3 text-xs font-bold text-on-surface shadow-sm transition-colors hover:border-secondary/35 hover:bg-surface-container-high hover:text-secondary disabled:opacity-60"
        >
          {loadingMore ? (
            <>
              <span className="material-symbols-outlined animate-spin text-base">
                progress_activity
              </span>
              {t("common.loading")}
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-base">expand_more</span>
              {t("postScheduler.mediaLibrary.loadMore")}
            </>
          )}
        </button>
      ) : null}
    </div>
  );
}
