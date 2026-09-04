"use client";

import type { ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { WorkspaceUnifiedMediaFilter } from "../_hooks/useWorkspaceUnifiedMediaLibrary";
import type { UnifiedMediaUploadWebResult } from "@/lib/social/unifiedMediaUploadWeb";

import { PostSchedulerMediaLibraryUploadTrigger } from "./PostSchedulerMediaLibraryUploadTrigger";

export interface PostSchedulerMediaLibraryFilterToolbarProps {
  embedded?: boolean;
  filter: WorkspaceUnifiedMediaFilter;
  setFilter: (next: WorkspaceUnifiedMediaFilter) => void;
  loading: boolean;
  refreshing: boolean;
  onRefreshList: () => void;
  onMediaUploaded: (result: UnifiedMediaUploadWebResult) => void;
  onListRefresh: () => Promise<void>;
  selectionMode: boolean;
  selectedCount: number;
  deleting: boolean;
  deleteError: string | null;
  onToggleSelectionMode: () => void;
  onDeleteSelected: () => void;
  /** Hide the multi-select mode controls (e.g. inside the composer picker modal). */
  hideSelection?: boolean;
}

export function PostSchedulerMediaLibraryFilterToolbar({
  embedded = false,
  filter,
  setFilter,
  loading,
  refreshing,
  onRefreshList,
  onMediaUploaded,
  onListRefresh,
  selectionMode,
  selectedCount,
  deleting,
  deleteError,
  onToggleSelectionMode,
  onDeleteSelected,
  hideSelection = false,
}: PostSchedulerMediaLibraryFilterToolbarProps): ReactElement {
  const { t } = useTranslations();
  const filters: { key: WorkspaceUnifiedMediaFilter; label: string; icon: string }[] = [
    { key: "all", label: t("postScheduler.mediaLibrary.filterAll"), icon: "grid_view" },
    { key: "image", label: t("postScheduler.mediaLibrary.filterPhotos"), icon: "image" },
    { key: "video", label: t("postScheduler.mediaLibrary.filterVideos"), icon: "movie" },
    {
      key: "document",
      label: t("postScheduler.mediaLibrary.filterDocuments"),
      icon: "description",
    },
  ];
  const tabContainerClass =
    "inline-flex min-w-0 shrink items-center gap-1 self-start rounded-2xl border border-outline-variant/20 bg-surface-container p-1";

  const actionBtnClass = embedded
    ? "h-8 rounded-lg bg-surface-container-low px-2 text-[10px] text-on-surface-variant hover:border-secondary/35 hover:text-secondary"
    : "h-10 rounded-xl bg-surface-container px-3 text-xs text-on-surface-variant hover:border-outline-variant/40 hover:text-on-surface";

  return (
    <div className="grid min-h-0 w-full min-w-0 grid-cols-1 gap-1.5">
      <div className="grid min-h-0 w-full min-w-0 grid-cols-1 items-center gap-1.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-2">
        <div className={tabContainerClass} role="tablist" aria-label={t("postScheduler.mediaLibrary.mediaTypeTabs")}>
          {filters.map(({ key, label, icon }) => {
            const active = filter === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                aria-pressed={active}
                disabled={loading || selectionMode}
                onClick={() => {
                  setFilter(key);
                }}
                className={`inline-flex items-center gap-1.5 rounded-xl font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                  embedded ? "h-7 px-2.5 text-[10px]" : "h-8 px-3.5 text-xs"
                } ${
                  active
                    ? "bg-secondary text-on-secondary shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
                }`}
              >
                <span
                  className={`material-symbols-outlined leading-none ${embedded ? "text-sm" : "text-base"}`}
                  aria-hidden
                >
                  {icon}
                </span>
                <span className="whitespace-nowrap">{label}</span>
              </button>
            );
          })}
        </div>
        <div
          className={`flex items-center justify-end sm:justify-center ${embedded ? "min-h-8" : "min-h-10"}`}
        >
          <div className={`flex flex-wrap items-center justify-end ${embedded ? "gap-1.5" : "gap-2"}`}>
            {hideSelection ? null : (
            <button
              type="button"
              disabled={loading || refreshing || deleting}
              onClick={onToggleSelectionMode}
              aria-pressed={selectionMode}
              className={`inline-flex items-center gap-1 border font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                selectionMode
                  ? "border-secondary/50 bg-secondary/15 text-secondary"
                  : "border-outline-variant/25 text-on-surface-variant"
              } ${actionBtnClass}`}
            >
              <span
                className={`material-symbols-outlined ${embedded ? "text-[15px]" : "text-[18px]"}`}
                aria-hidden
              >
                {selectionMode ? "close" : "checklist"}
              </span>
              {selectionMode ? t("postScheduler.mediaLibrary.cancelSelect") : t("postScheduler.mediaLibrary.select")}
            </button>
            )}
            {selectionMode ? (
              <button
                type="button"
                disabled={loading || deleting || selectedCount === 0}
                onClick={onDeleteSelected}
                className={`inline-flex items-center gap-1 border border-error/35 bg-error/10 font-bold text-error transition-colors hover:bg-error/15 disabled:cursor-not-allowed disabled:opacity-50 ${actionBtnClass}`}
              >
                <span
                  className={`material-symbols-outlined ${embedded ? "text-[15px]" : "text-[18px]"}`}
                  aria-hidden
                >
                  delete
                </span>
                {selectedCount > 0
                  ? t("postScheduler.mediaLibrary.deleteCount", { count: selectedCount })
                  : t("postScheduler.mediaLibrary.delete")}
              </button>
            ) : null}
            <button
              type="button"
              disabled={loading || refreshing || selectionMode}
              onClick={onRefreshList}
              className={`inline-flex items-center gap-1 border border-outline-variant/25 font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${actionBtnClass}`}
              title={t("postScheduler.mediaLibrary.refreshAria")}
              aria-label={t("postScheduler.mediaLibrary.refreshAria")}
            >
              <span
                className={`material-symbols-outlined ${embedded ? "text-[15px]" : "text-[18px]"} ${refreshing ? "animate-spin" : ""}`}
                aria-hidden
              >
                refresh
              </span>
              {t("postScheduler.mediaLibrary.refresh")}
            </button>
            <PostSchedulerMediaLibraryUploadTrigger
              disabled={loading || selectionMode}
              onUploaded={onMediaUploaded}
              onListRefresh={onListRefresh}
              variant={embedded ? "toolbar" : "standalone"}
            />
          </div>
        </div>
      </div>
      {deleteError ? (
        <p className="text-[10px] font-medium leading-snug text-error/90" role="alert">
          {deleteError}
        </p>
      ) : null}
      {selectionMode ? (
        <p className="text-[10px] leading-snug text-on-surface-variant/80">
          {t("postScheduler.mediaLibrary.selectionHint")}
        </p>
      ) : null}
    </div>
  );
}
