"use client";

import { useCallback, useEffect, useState } from "react";

import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { deleteWorkspaceScheduledPostById, publishWorkspaceScheduledPostById } from "@/lib/social/workspaceScheduledPostMutations";

import { DraftEditorActionConfirmModal } from "../../../content-manager/draft/[id]/_components/DraftEditorActionConfirmModal";
import { getDraftEditorConfirmCopy } from "../../../content-manager/draft/[id]/_utils/draftEditorConfirmCopy";
import { SelectedAccountPostsHydrator } from "../../../_components/SelectedAccountPostsHydrator";
import { useWorkspaceHeaderAccounts } from "../../../_components/WorkspaceHeaderAccountsProvider";
import { useCalendarWeekPosts } from "../_hooks/useCalendarWeekPosts";
import { useScheduledCalendarData } from "../_hooks/useScheduledCalendarData";
import type { CalendarPost, CalendarViewMode } from "../_types/calendarTypes";
import { addDays, startOfWeekMonday } from "../_utils/postSchedulerCalendarWeekUtils";
import {
  CalendarRefreshChoiceModal,
  type CalendarRefreshTarget,
} from "./CalendarRefreshChoiceModal";
import { CalendarPublishedPostDetailPanel } from "./CalendarPublishedPostDetailPanel";
import { PostSchedulerCalendarToolbar } from "./PostSchedulerCalendarToolbar";
import { PostSchedulerRestoredListView } from "./PostSchedulerRestoredListView";
import { PostSchedulerWeekGrid } from "./PostSchedulerWeekGrid";
import dynamic from "next/dynamic";

const ScheduledPostEditorModal = dynamic(() =>
  import("../../../content-manager/_components/ScheduledPostEditorModal").then((m) => ({
    default: m.ScheduledPostEditorModal,
  })),
);

export function PostSchedulerCalendarView(): React.ReactElement {
  const { t } = useTranslations();
  const { selectedAccountId } = useWorkspaceHeaderAccounts();
  const [mode, setMode] = useState<CalendarViewMode>("week");
  const [weekStart, setWeekStart] = useState(() => startOfWeekMonday(new Date()));
  const [editing, setEditing] = useState<CalendarPost | null>(null);
  const [publishedDetail, setPublishedDetail] = useState<CalendarPost | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CalendarPost | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [retryingIds, setRetryingIds] = useState<Set<string>>(new Set());
  const [refreshChoiceOpen, setRefreshChoiceOpen] = useState(false);
  const [manualRefreshing, setManualRefreshing] = useState(false);

  useEffect(() => {
    setEditing(null);
    setPublishedDetail(null);
    setDeleteTarget(null);
    setDeleteError(null);
    setRefreshChoiceOpen(false);
    setDeleting(false);
  }, [selectedAccountId]);

  const weekData = useCalendarWeekPosts(weekStart, mode === "week");
  const listData = useScheduledCalendarData(mode === "list");
  const refreshWeekPublishedLive = weekData.refreshPublishedLive;
  const refreshWeekScheduledOnly = weekData.refreshScheduledOnly;
  const refreshListPublishedLive = listData.refreshPublishedLive;
  const refreshListScheduledOnly = listData.refreshScheduledOnly;

  const loading =
    manualRefreshing ||
    (mode === "week" ? weekData.loading : listData.loading);
  const error = mode === "week" ? weekData.error : listData.error;
  const posts = mode === "week" ? weekData.posts : listData.posts;

  const openRefreshChoice = useCallback(async () => {
    setRefreshChoiceOpen(true);
  }, []);

  const handleRefreshChoice = useCallback(
    async (target: CalendarRefreshTarget) => {
      setManualRefreshing(true);
      try {
        if (target === "published") {
          if (mode === "week") {
            await refreshWeekPublishedLive();
          } else {
            await refreshListPublishedLive();
          }
        } else if (mode === "week") {
          await refreshWeekScheduledOnly();
        } else {
          await refreshListScheduledOnly();
        }
        setRefreshChoiceOpen(false);
      } finally {
        setManualRefreshing(false);
      }
    },
    [
      mode,
      refreshListPublishedLive,
      refreshListScheduledOnly,
      refreshWeekPublishedLive,
      refreshWeekScheduledOnly,
    ],
  );

  // Actions (delete/update/reschedule/moveToDraft) — scheduled list only
  const refreshScheduledOnly = useCallback(async () => {
    if (mode === "week") {
      await refreshWeekScheduledOnly();
      return;
    }
    await refreshListScheduledOnly();
  }, [mode, refreshWeekScheduledOnly, refreshListScheduledOnly]);

  const handleOpenPost = useCallback((post: CalendarPost) => {
    if (post.postKind === "published") {
      setPublishedDetail(post);
      return;
    }
    if (post.source) {
      setEditing(post);
    }
  }, []);
  const confirmDeleteCopy = getDraftEditorConfirmCopy(t, "deleteScheduled", {});

  const confirmDelete = useCallback(async (): Promise<void> => {
    const target = deleteTarget;
    const id = target?.source?.scheduled_post_id ?? target?.id;
    const token = getStoredAccessToken();
    const workspace = getStoredActiveWorkspaceId();
    if (!target || !id || !token?.trim() || !workspace?.trim()) {
      return;
    }
    setDeleting(true);
    setDeleteError(null);
    try {
      const result = await deleteWorkspaceScheduledPostById(
        token,
        workspace,
        id,
        target.source?.platform ?? target.platform,
      );
      if (!result.success) {
        throw new Error(result.error || result.message);
      }
      setDeleteTarget(null);
      await refreshScheduledOnly();
    } catch (reason) {
      setDeleteError(
        reason instanceof Error ? reason.message : t("content.toastGenericError"),
      );
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, refreshScheduledOnly, t]);

  const handleRetryPost = useCallback(
    async (post: CalendarPost) => {
      const id = post.source?.scheduled_post_id ?? post.id;
      const token = getStoredAccessToken();
      const workspace = getStoredActiveWorkspaceId();
      if (!id || !token?.trim() || !workspace?.trim()) {
        return;
      }
      setDeleteError(null);
      setRetryingIds((current) => new Set(current).add(id));
      try {
        const result = await publishWorkspaceScheduledPostById(
          token,
          workspace,
          id,
          post.source?.platform ?? post.platform,
        );
        if (!result.success) {
          throw new Error(result.error || result.message || t("postScheduler.calendar.retryFailed"));
        }
        await refreshScheduledOnly();
      } catch (reason) {
        setDeleteError(
          reason instanceof Error ? reason.message : t("postScheduler.calendar.retryFailed"),
        );
        await refreshScheduledOnly();
      } finally {
        setRetryingIds((current) => {
          const next = new Set(current);
          next.delete(id);
          return next;
        });
      }
    },
    [refreshScheduledOnly, t],
  );

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <SelectedAccountPostsHydrator />
      <CalendarRefreshChoiceModal
        open={refreshChoiceOpen}
        isBusy={manualRefreshing}
        onCancel={() => {
          if (!manualRefreshing) setRefreshChoiceOpen(false);
        }}
        onChoose={(target) => void handleRefreshChoice(target)}
      />
      {publishedDetail ? (
        <CalendarPublishedPostDetailPanel
          post={publishedDetail}
          open
          onClose={() => setPublishedDetail(null)}
        />
      ) : null}
      {editing?.source ? (
        <ScheduledPostEditorModal
          initialScheduled={editing.source}
          onClose={() => setEditing(null)}
          onUpdateSuccess={() => {
            setEditing(null);
            void refreshScheduledOnly();
          }}
          onRescheduleComplete={() => {
            setEditing(null);
            void refreshScheduledOnly();
          }}
          onPublishSuccess={() => {
            setEditing(null);
            void refreshScheduledOnly();
          }}
          onDeleteSuccess={() => {
            setEditing(null);
            void refreshScheduledOnly();
          }}
          onMoveToDraftSuccess={() => {
            setEditing(null);
            void refreshScheduledOnly();
          }}
        />
      ) : null}
      {deleteError ? (
        <p role="alert" className="mb-3 rounded-lg bg-error/10 px-4 py-2 text-sm text-error">
          {deleteError}
        </p>
      ) : null}
      <DraftEditorActionConfirmModal
        open={deleteTarget !== null}
        title={confirmDeleteCopy.title}
        description={confirmDeleteCopy.description}
        confirmLabel={confirmDeleteCopy.confirmLabel}
        isDanger
        isBusy={deleting}
        onCancel={() => {
          if (!deleting) {
            setDeleteTarget(null);
            setDeleteError(null);
          }
        }}
        onConfirm={() => void confirmDelete()}
      />
      {mode === "week" ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-outline-variant/35 bg-surface-container shadow-md ring-1 ring-outline-variant/20">
          <PostSchedulerCalendarToolbar
            mode={mode}
            onModeChange={setMode}
            onRefresh={openRefreshChoice}
            isRefreshing={loading}
            embedded
            weekNav={{
              weekStart,
              onPrevWeek: () => setWeekStart((current) => addDays(current, -7)),
              onNextWeek: () => setWeekStart((current) => addDays(current, 7)),
              onToday: () => setWeekStart(startOfWeekMonday(new Date())),
            }}
          />
          {!loading && error ? (
            <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
              <p className="text-sm text-on-surface-variant">{error}</p>
              <button
                type="button"
                onClick={() => void openRefreshChoice()}
                className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary"
              >
                {t("postScheduler.calendar.tryAgain")}
              </button>
            </div>
          ) : null}
          {!error ? (
            <PostSchedulerWeekGrid
              weekStart={weekStart}
              posts={posts}
              onWeekStartChange={setWeekStart}
              onOpen={handleOpenPost}
              onRequestDelete={(post) => {
                setDeleteError(null);
                setDeleteTarget(post);
              }}
              onRequestRetry={(post) => void handleRetryPost(post)}
              onReschedulePost={(postId, target) => {
                setDeleteError(null);
                void weekData.reschedule(postId, target).catch((reason) => {
                  setDeleteError(
                    reason instanceof Error
                      ? reason.message
                      : t("postScheduler.calendar.rescheduleFailed"),
                  );
                });
              }}
              onRefresh={() => void openRefreshChoice()}
              isRefreshing={loading}
              savingIds={weekData.savingIds}
              retryingIds={retryingIds}
              embedded
            />
          ) : null}
        </div>
      ) : null}
      {mode === "list" ? (
        <>
          <PostSchedulerCalendarToolbar
            mode={mode}
            onModeChange={setMode}
            onRefresh={openRefreshChoice}
            isRefreshing={loading}
          />
          {loading ? (
            <p className="py-6 text-center text-sm text-on-surface-variant">
              {t("postScheduler.calendar.loadingPosts")}
            </p>
          ) : null}
          {!loading && error ? (
            <div className="py-6 text-center">
              <p className="text-sm text-on-surface-variant">{error}</p>
              <button
                type="button"
                onClick={() => void openRefreshChoice()}
                className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary"
              >
                {t("postScheduler.calendar.tryAgain")}
              </button>
            </div>
          ) : null}
        </>
      ) : null}
      {!loading && !error && mode === "list" ? (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <PostSchedulerRestoredListView
            posts={posts}
            onOpen={(post) => {
              if (post.source) {
                setEditing(post);
              }
            }}
            onRefresh={refreshScheduledOnly}
          />
        </div>
      ) : null}
    </div>
  );
}
