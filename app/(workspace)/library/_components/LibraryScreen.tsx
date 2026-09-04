"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, type ReactElement } from "react";

import { DraftEditorSuccessToast } from "@/app/(workspace)/content-manager/draft/[id]/_components/DraftEditorSuccessToast";
import { useDraftActionSuccessToast } from "@/app/(workspace)/content-manager/draft/[id]/_hooks/useDraftActionSuccessToast";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { UnifiedMediaListItem } from "@/lib/social/unifiedMediaApi";

import { WorkspacePageContainer } from "../../_components/WorkspacePageContainer";
import { PostSchedulerMediaLibraryDeleteConfirmModal } from "../../post-scheduler/_components/PostSchedulerMediaLibraryDeleteConfirmModal";
import { PostSchedulerMediaLibraryGrid } from "../../post-scheduler/_components/PostSchedulerMediaLibraryGrid";
import { PostSchedulerMediaLibrarySkeleton } from "../../post-scheduler/_components/PostSchedulerMediaLibrarySkeleton";
import { PostSchedulerMediaLibraryUploadTrigger } from "../../post-scheduler/_components/PostSchedulerMediaLibraryUploadTrigger";
import { usePostSchedulerMediaLibraryDelete } from "../../post-scheduler/_hooks/usePostSchedulerMediaLibraryDelete";
import { useScheduledPostMediaIds } from "../../post-scheduler/_hooks/useScheduledPostMediaIds";
import {
  useWorkspaceUnifiedMediaLibrary,
  type WorkspaceUnifiedMediaFilter,
} from "../../post-scheduler/_hooks/useWorkspaceUnifiedMediaLibrary";
import {
  stashLibraryUseInPost,
  unifiedMediaToAttachedMedia,
} from "../../post-scheduler/_utils/postSchedulerLibraryHandoff";
import {
  isEmptyForFilter,
  mediaLibraryEmptyCopy,
} from "../../post-scheduler/_utils/postSchedulerMediaLibraryDisplay";
import { CloudStorageSection } from "./CloudStorageSection";
import { StockMediaSection } from "./StockMediaSection";

type LibrarySection = "postsiva" | "stock" | "cloud";

export function LibraryScreen(): ReactElement {
  const { t } = useTranslations();
  const router = useRouter();
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
  const { deleting, deleteOne } = usePostSchedulerMediaLibraryDelete();
  const [refreshing, setRefreshing] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<UnifiedMediaListItem | null>(null);
  const [section, setSection] = useState<LibrarySection>("postsiva");
  const { toast, toastKey, dismissToast, showToast } = useDraftActionSuccessToast();

  const onUseInPost = useCallback(
    (item: UnifiedMediaListItem) => {
      stashLibraryUseInPost(unifiedMediaToAttachedMedia(item));
      router.push("/post-scheduler");
    },
    [router],
  );

  const onRefreshList = useCallback(() => {
    setRefreshing(true);
    void reload().finally(() => {
      setRefreshing(false);
    });
  }, [reload]);

  const filters: { key: WorkspaceUnifiedMediaFilter; label: string; icon: string }[] = [
    { key: "all", label: t("postScheduler.mediaLibrary.filterAll"), icon: "grid_view" },
    { key: "image", label: t("postScheduler.mediaLibrary.filterPhotos"), icon: "image" },
    { key: "video", label: t("postScheduler.mediaLibrary.filterVideos"), icon: "movie" },
    { key: "document", label: t("postScheduler.mediaLibrary.filterDocuments"), icon: "description" },
  ];

  return (
    <WorkspacePageContainer className="min-h-screen bg-surface px-4 py-4 text-on-surface sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5">
        <header className="flex flex-wrap items-end justify-between gap-3 border-b border-outline-variant/12 pb-4">
          <div className="space-y-1">
            <h1 className="font-display text-2xl font-bold text-on-surface">
              {t("postScheduler.mediaLibrary.pageTitle")}
            </h1>
            <p className="text-sm text-on-surface-variant">
              {t("postScheduler.mediaLibrary.pageSubtitle")}
            </p>
          </div>
          {section === "postsiva" ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={loading || refreshing}
              onClick={onRefreshList}
              aria-label={t("postScheduler.mediaLibrary.refreshAria")}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-outline-variant/25 bg-surface-container px-3 text-xs font-bold text-on-surface-variant transition-colors hover:border-secondary/40 hover:text-secondary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span
                className={`material-symbols-outlined text-base leading-none ${refreshing ? "animate-spin" : ""}`}
                aria-hidden
              >
                refresh
              </span>
              {t("postScheduler.mediaLibrary.refresh")}
            </button>
            <PostSchedulerMediaLibraryUploadTrigger
              variant="standalone"
              onUploaded={() => {
                void reload();
                showToast(
                  t("postScheduler.mediaLibrary.toastUploaded"),
                  t("postScheduler.mediaLibrary.toastUploadedHint"),
                );
              }}
              onListRefresh={reload}
            />
          </div>
          ) : null}
        </header>

        <div
          role="tablist"
          aria-label={t("postScheduler.mediaLibrary.pageTitle")}
          className="inline-flex items-center gap-1 self-start rounded-2xl border border-outline-variant/20 bg-surface-container p-1"
        >
          {(
            [
              { key: "postsiva", label: t("postScheduler.mediaLibrary.sectionPostsiva"), icon: "photo_library" },
              { key: "stock", label: t("postScheduler.mediaLibrary.sectionStock"), icon: "wallpaper" },
              { key: "cloud", label: t("cloudStorage.sectionTab"), icon: "cloud" },
            ] as const
          ).map((s) => (
            <button
              key={s.key}
              type="button"
              role="tab"
              aria-selected={section === s.key}
              onClick={() => {
                setSection(s.key);
              }}
              className={`inline-flex h-9 items-center gap-1.5 rounded-xl px-4 text-xs font-bold transition-colors ${
                section === s.key
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-base leading-none" aria-hidden>
                {s.icon}
              </span>
              {s.label}
            </button>
          ))}
        </div>

        {section === "stock" ? (
          <StockMediaSection
            onSavedToLibrary={() => {
              void reload();
              showToast(
                t("postScheduler.mediaLibrary.stockSaved"),
                t("postScheduler.mediaLibrary.toastSavedHint"),
              );
            }}
          />
        ) : section === "cloud" ? (
          <CloudStorageSection
            onSavedToLibrary={() => {
              void reload();
              showToast(
                t("postScheduler.mediaLibrary.toastSaved"),
                t("postScheduler.mediaLibrary.toastSavedHint"),
              );
            }}
          />
        ) : (
        <>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            role="tablist"
            aria-label={t("postScheduler.mediaLibrary.mediaTypeTabs")}
            className="inline-flex items-center gap-1 rounded-2xl border border-outline-variant/20 bg-surface-container p-1"
          >
            {filters.map((f) => {
              const active = filter === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setFilter(f.key);
                  }}
                  className={`inline-flex h-8 items-center gap-1.5 rounded-xl px-4 text-xs font-bold transition-colors ${
                    active
                      ? "bg-secondary text-on-secondary shadow-sm"
                      : "text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
                  }`}
                >
                  <span className="material-symbols-outlined text-base leading-none" aria-hidden>
                    {f.icon}
                  </span>
                  {f.label}
                </button>
              );
            })}
          </div>
          {!loading && !error ? (
            <p className="text-xs font-semibold tabular-nums text-on-surface-variant/80">
              {items.length}
            </p>
          ) : null}
        </div>

        {loading ? (
          <div aria-busy aria-label={t("postScheduler.mediaLibrary.loadingAria")}>
            <PostSchedulerMediaLibrarySkeleton />
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
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-outline-variant/25 bg-surface-container-low/40 px-4 py-16 text-center">
            <span className="material-symbols-outlined text-5xl text-secondary/35" aria-hidden>
              perm_media
            </span>
            <p className="max-w-[18rem] text-sm leading-relaxed text-on-surface-variant">
              {mediaLibraryEmptyCopy(filter, t)}
            </p>
          </div>
        ) : null}

        {!loading && !error && !isEmptyForFilter(items, filter) ? (
          <PostSchedulerMediaLibraryGrid
            filter={filter}
            items={items}
            editorMedia={[]}
            hasMore={hasMore}
            loadingMore={loadingMore}
            onPickItem={onUseInPost}
            onLoadMore={() => {
              void loadMore();
            }}
            scheduledMediaIds={scheduledMediaIds}
            showSaveToCloud
            fullPage
            useInPostLabel={t("postScheduler.mediaLibrary.useInPost")}
            onRequestDelete={(item) => {
              if (scheduledMediaIds.has(item.media_id)) {
                return;
              }
              setPendingDelete(item);
            }}
          />
        ) : null}
        </>
        )}
      </div>

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
          void deleteOne(pendingDelete.media_id, scheduledMediaIds, (deletedIds) => {
            removeItemsLocally(deletedIds);
            setPendingDelete(null);
            showToast(
              t("postScheduler.mediaLibrary.toastDeleted"),
              t("postScheduler.mediaLibrary.toastDeletedHint"),
            );
          });
        }}
      />
      {toast ? (
        <DraftEditorSuccessToast
          key={toastKey}
          title={toast.title}
          subtitle={toast.subtitle}
          onDismiss={dismissToast}
        />
      ) : null}
    </WorkspacePageContainer>
  );
}
