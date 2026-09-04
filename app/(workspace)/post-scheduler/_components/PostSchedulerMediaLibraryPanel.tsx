"use client";

import { useCallback, useEffect, useState, type ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { UnifiedMediaUploadWebResult } from "@/lib/social/unifiedMediaUploadWeb";

import { useOptionalPostSchedulerComposerDraft } from "../_context/PostSchedulerComposerDraftContext";
import { useOptionalPostSchedulerComposerChannels } from "../_context/PostSchedulerComposerChannelsContext";
import { usePostSchedulerMediaLibraryDelete } from "../_hooks/usePostSchedulerMediaLibraryDelete";
import { useScheduledPostMediaIds } from "../_hooks/useScheduledPostMediaIds";
import {
  useWorkspaceUnifiedMediaLibrary,
  type WorkspaceUnifiedMediaFilter,
} from "../_hooks/useWorkspaceUnifiedMediaLibrary";
import type { ComposerAttachedMedia } from "../_types/composerDraftTypes";
import { mergeAttachedMediaOnPick } from "../_utils/postSchedulerComposerMediaPick";
import {
  isEmptyForFilter,
  mediaLibraryEmptyCopy,
} from "../_utils/postSchedulerMediaLibraryDisplay";
import { mediaLibraryItemToAttached } from "../_utils/postSchedulerMediaLibraryToAttached";
import type { UnifiedMediaListItem } from "@/lib/social/unifiedMediaApi";

import { PostSchedulerMediaLibraryDeleteConfirmModal } from "./PostSchedulerMediaLibraryDeleteConfirmModal";
import { PostSchedulerMediaLibraryFilterToolbar } from "./PostSchedulerMediaLibraryFilterToolbar";
import { PostSchedulerMediaLibraryGrid } from "./PostSchedulerMediaLibraryGrid";
import { PostSchedulerMediaLibrarySkeleton } from "./PostSchedulerMediaLibrarySkeleton";

function isVideoItem(item: UnifiedMediaListItem): boolean {
  return item.media_type === "video";
}

export function PostSchedulerMediaLibraryPanel({
  embedded = false,
  hideSelection = false,
  onPickMedia,
  /** Wide masonry (4-col). Use for full-screen media modal; leave off for narrow side panels. */
  masonry = false,
}: {
  embedded?: boolean;
  hideSelection?: boolean;
  onPickMedia?: (media: ComposerAttachedMedia) => void;
  masonry?: boolean;
}): ReactElement {
  const { t } = useTranslations();
  /** Optional: scheduled/draft edit open Library outside composer shell. */
  const channels = useOptionalPostSchedulerComposerChannels();
  const draft = useOptionalPostSchedulerComposerDraft();
  const selectedAccounts = channels?.selectedAccounts ?? [];
  const {
    items,
    filter,
    setFilter,
    loading,
    loadingMore,
    error,
    hasMore,
    reload,
    loadMore,
    removeItemsLocally,
  } = useWorkspaceUnifiedMediaLibrary(true);
  const scheduledMediaIds = useScheduledPostMediaIds(true);
  const {
    selectionMode,
    setSelectionMode,
    selectedIds,
    toggleSelected,
    deleting,
    deleteError,
    deleteSelected,
    deleteOne,
  } = usePostSchedulerMediaLibraryDelete();
  const [refreshing, setRefreshing] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<UnifiedMediaListItem | null>(null);
  const hasYoutubeTarget = selectedAccounts.some((a) => a.platform === "youtube");
  const hasLinkedinTarget = selectedAccounts.some((a) => a.platform === "linkedin");

  const editorMedia = draft?.editorMedia ?? [];
  const mediaLibraryPickMode = draft?.mediaLibraryPickMode ?? "default";
  const youtubeThumbnailMediaId = draft?.youtubeThumbnailMediaId ?? null;
  const linkedinThumbnailMediaId = draft?.linkedinThumbnailMediaId ?? null;

  useEffect(() => {
    const handler = (): void => {
      setFilter("image" satisfies WorkspaceUnifiedMediaFilter);
      void reload();
    };
    window.addEventListener("postsiva:open-media-library-images", handler);
    return () => {
      window.removeEventListener("postsiva:open-media-library-images", handler);
    };
  }, [setFilter, reload]);

  const onMediaUploaded = useCallback(
    (r: UnifiedMediaUploadWebResult) => {
      if (!draft) {
        return;
      }
      draft.setEditorMedia((prev) =>
        mergeAttachedMediaOnPick(prev, {
          mediaId: r.mediaId,
          publicUrl: r.publicUrl,
          mediaType: r.mediaType,
          filename: r.filename,
          thumbnailUrl: r.thumbnailUrl,
          durationSeconds: r.durationSeconds,
          fileSizeBytes: r.fileSizeBytes,
        }),
      );
    },
    [draft],
  );

  const detachDeletedMedia = useCallback(
    (deletedIds: readonly string[]) => {
      const idSet = new Set(deletedIds);
      removeItemsLocally(deletedIds);
      if (!draft) {
        return;
      }
      draft.setEditorMedia((prev) => prev.filter((m) => !idSet.has(m.mediaId)));
      if (youtubeThumbnailMediaId && idSet.has(youtubeThumbnailMediaId)) {
        draft.setYoutubeGenerateThumbnail(false);
        draft.setYoutubeThumbnailMediaId(null);
        draft.setYoutubeThumbnailPreviewUrl(null);
      }
      if (linkedinThumbnailMediaId && idSet.has(linkedinThumbnailMediaId)) {
        draft.setLinkedinGenerateThumbnail(false);
        draft.setLinkedinThumbnailMediaId(null);
        draft.setLinkedinThumbnailPreviewUrl(null);
      }
    },
    [
      draft,
      linkedinThumbnailMediaId,
      removeItemsLocally,
      youtubeThumbnailMediaId,
    ],
  );

  const onPickItem = useCallback(
    (item: UnifiedMediaListItem) => {
      if (selectionMode) {
        return;
      }
      const attached = mediaLibraryItemToAttached(item);
      if (onPickMedia) {
        onPickMedia(attached);
        return;
      }
      if (!draft) {
        return;
      }
      if (
        mediaLibraryPickMode === "youtube_thumbnail" &&
        item.media_type === "image"
      ) {
        draft.setYoutubeGenerateThumbnail(false);
        draft.setYoutubeThumbnailMediaId(item.media_id);
        draft.setYoutubeThumbnailPreviewUrl(item.public_url);
        draft.setMediaLibraryPickMode("default");
        return;
      }
      if (
        mediaLibraryPickMode === "linkedin_thumbnail" &&
        item.media_type === "image"
      ) {
        draft.setLinkedinGenerateThumbnail(false);
        draft.setLinkedinThumbnailMediaId(item.media_id);
        draft.setLinkedinThumbnailPreviewUrl(item.public_url);
        draft.setMediaLibraryPickMode("default");
        return;
      }
      if (
        hasYoutubeTarget &&
        item.media_type === "image" &&
        !youtubeThumbnailMediaId
      ) {
        draft.setYoutubeGenerateThumbnail(false);
        draft.setYoutubeThumbnailMediaId(item.media_id);
        draft.setYoutubeThumbnailPreviewUrl(item.public_url);
      }
      if (
        hasLinkedinTarget &&
        item.media_type === "image" &&
        !linkedinThumbnailMediaId
      ) {
        draft.setLinkedinGenerateThumbnail(false);
        draft.setLinkedinThumbnailMediaId(item.media_id);
        draft.setLinkedinThumbnailPreviewUrl(item.public_url);
      }
      if (filter === "image" && !isVideoItem(item)) {
        draft.setEditorMedia((prev) => {
          if (prev.some((m) => m.mediaId === item.media_id)) {
            return prev.filter((m) => m.mediaId !== item.media_id);
          }
          return mergeAttachedMediaOnPick(prev, attached);
        });
        return;
      }
      draft.setEditorMedia((prev) => mergeAttachedMediaOnPick(prev, attached));
    },
    [
      draft,
      filter,
      hasLinkedinTarget,
      hasYoutubeTarget,
      linkedinThumbnailMediaId,
      mediaLibraryPickMode,
      onPickMedia,
      selectionMode,
      youtubeThumbnailMediaId,
    ],
  );

  const onRefreshList = useCallback(() => {
    setRefreshing(true);
    void reload().finally(() => {
      setRefreshing(false);
    });
  }, [reload]);

  const shellClass = embedded
    ? "flex h-full min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-hidden"
    : "flex flex-1 flex-col rounded-2xl border border-outline-variant/5 bg-surface-container p-4 shadow-xl sm:p-5";
  const toolbar = (
    <PostSchedulerMediaLibraryFilterToolbar
      embedded={embedded}
      filter={filter}
      setFilter={setFilter}
      loading={loading}
      refreshing={refreshing}
      onRefreshList={onRefreshList}
      onMediaUploaded={onMediaUploaded}
      onListRefresh={reload}
      hideSelection={hideSelection || Boolean(onPickMedia)}
      selectionMode={selectionMode}
      selectedCount={selectedIds.size}
      deleting={deleting}
      deleteError={deleteError}
      onToggleSelectionMode={() => {
        setSelectionMode(!selectionMode);
      }}
      onDeleteSelected={() => {
        void deleteSelected(scheduledMediaIds, detachDeletedMedia);
      }}
    />
  );

  const body = (
    <>
      {loading ? (
        <div
          className={embedded ? "pr-0.5" : "max-h-[min(24rem,50vh)] pr-0.5"}
          aria-busy
          aria-label={t("postScheduler.mediaLibrary.loadingAria")}
        >
          <PostSchedulerMediaLibrarySkeleton embedded={embedded} masonry={masonry} />
        </div>
      ) : null}

      {!loading && error ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-error/30 bg-error/5 px-4 py-10 text-center">
          <span className="material-symbols-outlined text-4xl text-error/80" aria-hidden>
            cloud_off
          </span>
          <p className="max-w-xs text-sm text-on-surface-variant">{error}</p>
          <button
            type="button"
            onClick={() => {
              void reload();
            }}
            className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-on-primary shadow-md transition-colors hover:bg-primary/90"
          >
            {t("postScheduler.mediaLibrary.tryAgain")}
          </button>
        </div>
      ) : null}

      {!loading && !error && isEmptyForFilter(items, filter) ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-outline-variant/25 bg-surface-container-low/40 px-4 py-12 text-center">
          <span
            className="material-symbols-outlined text-5xl text-secondary/35"
            aria-hidden
          >
            perm_media
          </span>
          <p className="max-w-[18rem] text-sm leading-relaxed text-on-surface-variant">
            {mediaLibraryEmptyCopy(filter, t)}
          </p>
        </div>
      ) : null}

      {!loading && !error && !isEmptyForFilter(items, filter) ? (
        <PostSchedulerMediaLibraryGrid
          embedded={embedded}
          masonry={masonry}
          filter={filter}
          items={items}
          editorMedia={editorMedia}
          hasMore={hasMore}
          loadingMore={loadingMore}
          onPickItem={onPickItem}
          onLoadMore={() => {
            void loadMore();
          }}
          selectionMode={selectionMode}
          selectedIds={selectedIds}
          scheduledMediaIds={scheduledMediaIds}
          onToggleSelect={(mediaId) => {
            toggleSelected(mediaId, scheduledMediaIds);
          }}
          showDownload
          onRequestDelete={(item) => {
            if (scheduledMediaIds.has(item.media_id)) {
              return;
            }
            setPendingDelete(item);
          }}
        />
      ) : null}
    </>
  );

  return (
    <div className={shellClass}>
      {embedded ? (
        <header className="shrink-0 space-y-0.5">
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-on-surface-variant/80">
            {t("postScheduler.mediaLibrary.imagesSection")}
          </p>
          <div className="min-h-0">{toolbar}</div>
        </header>
      ) : (
        <div className="mb-2">{toolbar}</div>
      )}

      {embedded ? (
        <div className="flex min-h-0 w-full min-w-0 flex-1 basis-0 overflow-hidden">
          <div className="media-library-scrollbar h-full min-h-0 w-full min-w-0 overflow-y-auto overflow-x-hidden overscroll-contain">
            <div className="flex min-h-full w-full min-w-0 flex-col pb-1">{body}</div>
          </div>
        </div>
      ) : (
        body
      )}

      <PostSchedulerMediaLibraryDeleteConfirmModal
        visible={pendingDelete !== null}
        deleting={deleting}
        onCancel={() => {
          if (!deleting) {
            setPendingDelete(null);
          }
        }}
        onConfirm={() => {
          if (!pendingDelete) {
            return;
          }
          const mediaId = pendingDelete.media_id;
          void deleteOne(mediaId, scheduledMediaIds, (deletedIds) => {
            detachDeletedMedia(deletedIds);
            setPendingDelete(null);
          });
        }}
      />
    </div>
  );
}
