"use client";

import { useCallback } from "react";

import type { ComposerAttachedMedia } from "@/lib/post-composer/composerAttachedMediaTypes";
import type { UnifiedMediaListItem } from "@/lib/social/unifiedMediaApi";
import { PostSchedulerMediaLibraryGrid } from "../../post-scheduler/_components/PostSchedulerMediaLibraryGrid";
import { PostSchedulerMediaLibrarySkeleton } from "../../post-scheduler/_components/PostSchedulerMediaLibrarySkeleton";
import { PostSchedulerMediaLibraryUploadTrigger } from "../../post-scheduler/_components/PostSchedulerMediaLibraryUploadTrigger";
import {
  useWorkspaceUnifiedMediaLibrary,
  type WorkspaceUnifiedMediaFilter,
} from "../../post-scheduler/_hooks/useWorkspaceUnifiedMediaLibrary";
import {
  isEmptyForFilter,
  MEDIA_LIBRARY_EMPTY_COPY,
} from "../../post-scheduler/_utils/postSchedulerMediaLibraryDisplay";
import { unifiedMediaItemToComposerAttached } from "../_utils/unifiedMediaItemToComposerAttached";

const FILTERS: { key: WorkspaceUnifiedMediaFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "image", label: "Images" },
  { key: "video", label: "Videos" },
];

export interface AiPipelineMediaLibraryPickerContentProps {
  readonly enabled: boolean;
  readonly onSelect: (media: ComposerAttachedMedia) => void;
  readonly onClose: () => void;
  readonly currentPending: ComposerAttachedMedia | null;
}

export function AiPipelineMediaLibraryPickerContent({
  enabled,
  onSelect,
  onClose,
  currentPending,
}: AiPipelineMediaLibraryPickerContentProps): React.ReactElement {
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
  } = useWorkspaceUnifiedMediaLibrary(enabled);

  const onPickItem = useCallback(
    (item: UnifiedMediaListItem) => {
      onSelect(unifiedMediaItemToComposerAttached(item));
      onClose();
    },
    [onClose, onSelect],
  );

  const editorMedia = currentPending ? [currentPending] : [];

  return (
    <>
      <div className="mb-3 flex items-start justify-end">
        <PostSchedulerMediaLibraryUploadTrigger
          disabled={loading}
          onUploaded={(r) => {
            onSelect({
              mediaId: r.mediaId,
              publicUrl: r.publicUrl,
              mediaType: r.mediaType,
              filename: r.filename,
            });
            onClose();
          }}
          onListRefresh={reload}
        />
      </div>
      <p className="mb-3 text-xs text-on-surface-variant">
        Choose from your library or upload — the selection is sent with your next message.
      </p>
      <div className="mb-3 flex gap-2">
        {FILTERS.map(({ key, label }) => {
          const active = filter === key;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={active}
              disabled={loading}
              onClick={() => {
                setFilter(key);
              }}
              className={`flex-1 rounded-xl border py-2 text-center text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                active
                  ? "border-secondary bg-secondary/15 text-secondary"
                  : "border-outline-variant/25 bg-surface-container-low text-on-surface-variant hover:border-outline-variant/40"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
      {loading ? (
        <div
          className="max-h-[min(24rem,50vh)] pr-0.5"
          aria-busy
          aria-label="Loading media library"
        >
          <PostSchedulerMediaLibrarySkeleton />
        </div>
      ) : null}
      {!loading && error ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <p className="text-xs text-on-surface-variant">{error}</p>
          <button
            type="button"
            onClick={() => {
              void reload();
            }}
            className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-on-primary"
          >
            Retry
          </button>
        </div>
      ) : null}
      {!loading && !error && isEmptyForFilter(items, filter) ? (
        <p className="py-8 text-center text-xs text-on-surface-variant">
          {MEDIA_LIBRARY_EMPTY_COPY[filter]}
        </p>
      ) : null}
      {!loading && !error && !isEmptyForFilter(items, filter) ? (
        <PostSchedulerMediaLibraryGrid
          filter={filter}
          items={items}
          editorMedia={editorMedia}
          hasMore={hasMore}
          loadingMore={loadingMore}
          onPickItem={onPickItem}
          onLoadMore={() => {
            void loadMore();
          }}
        />
      ) : null}
    </>
  );
}
