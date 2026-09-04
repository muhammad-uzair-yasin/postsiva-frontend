"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState, type ReactElement } from "react";

import { FloatingAiProgressOrb } from "@/app/(workspace)/_components/FloatingAiProgressOrb";
import { SimpleAlertModal } from "@/app/(workspace)/_components/SimpleAlertModal";
import type { ContentManagerPost } from "@/app/(workspace)/content-manager/_types/contentManagerTypes";
import { DraftEditorSuccessToast } from "@/app/(workspace)/content-manager/draft/[id]/_components/DraftEditorSuccessToast";
import { useDraftActionSuccessToast } from "@/app/(workspace)/content-manager/draft/[id]/_hooks/useDraftActionSuccessToast";
import {
  getStoredAccessToken,
  getStoredActiveWorkspaceId,
} from "@/lib/auth/session";
import { usePlanFeature } from "@/lib/billing/BillingContext";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { UnifiedInboxMessage } from "@/lib/inbox/unifiedInboxTypes";
import { reclassifyUnifiedComments } from "@/lib/social/unifiedCommentsApi";

import {
  findPublishedPostForInboxSelection,
  publishedPostMatchesSourceId,
} from "@/lib/inbox/findPublishedPostForInboxSelection";
import { useInboxThreadedComments } from "../_hooks/useInboxThreadedComments";
import { useInboxUnrepliedBulk } from "../_hooks/useInboxUnrepliedBulk";
import { useUnifiedCommentGenerate } from "../_hooks/useUnifiedCommentGenerate";
import { useUnifiedCommentReply } from "../_hooks/useUnifiedCommentReply";
import { useWorkspaceInboxComments } from "../_hooks/useWorkspaceInboxComments";
import { inboxListContainer, inboxListItem } from "./inboxMotionVariants";
import { SocialInboxCommentRow } from "./SocialInboxCommentRow";
import { SocialInboxCommentScore } from "./SocialInboxCommentScore";
import { SocialInboxNewCommentComposer } from "./SocialInboxNewCommentComposer";
import { SocialInboxCommentSectionSelect } from "./SocialInboxCommentSectionSelect";
import type { InboxCommentsSection } from "./SocialInboxCommentSectionTabs";
import { SocialInboxUnrepliedBulkBar } from "./SocialInboxUnrepliedBulkBar";

interface SocialInboxCommentListProps {
  readonly selectedPostId: string | null;
  readonly selectedPost: ContentManagerPost | null;
  readonly publishedPosts: readonly ContentManagerPost[];
  readonly onSelectPostId: (postId: string) => void;
  readonly showLeftPanel: boolean;
  readonly onToggleLeftPanel: () => void;
}

export function SocialInboxCommentList({
  selectedPostId,
  selectedPost,
  publishedPosts,
  onSelectPostId,
  showLeftPanel,
  onToggleLeftPanel,
}: SocialInboxCommentListProps): ReactElement {
  const { t } = useTranslations();
  const {
    comments,
    isLoading,
    isRefreshing,
    classificationStatus,
    commentsDisabled,
    commentStatusMessage,
    channelCommentsUnsupported,
    error,
    refresh,
    reloadAfterReply,
    deletingCommentIds,
  } = useWorkspaceInboxComments({ selectedPostId, selectedPost });

  const scopedComments = useMemo((): UnifiedInboxMessage[] => {
    if (!selectedPost) {
      return comments;
    }
    return comments.filter((comment) => {
      const sourcePostId = comment.sourcePostId?.trim() ?? "";
      return sourcePostId.length > 0 && publishedPostMatchesSourceId(selectedPost, sourcePostId);
    });
  }, [comments, selectedPost]);

  const reloadThreadsForBulk = useCallback(
    async (samples: readonly UnifiedInboxMessage[]): Promise<void> => {
      for (const s of samples) {
        await reloadAfterReply(s);
      }
    },
    [reloadAfterReply],
  );
  const [section, setSection] = useState<InboxCommentsSection>("all");
  const { enabled: commentAiEnabled } = usePlanFeature("auto_replier_enabled");
  const { generateForMessage } = useUnifiedCommentGenerate();
  const { sendQuickReply } = useUnifiedCommentReply();
  const {
    bulkTargets,
    readyToPostCount,
    bulkBusy,
    bulkAllGenerating,
    bulkAllPosting,
    bulkStepProgress,
    bulkComposerFor,
    handleGenerateAllUnreplied,
    handlePostAll,
    infoModal,
    dismissInfoModal,
  } = useInboxUnrepliedBulk(
    section,
    scopedComments,
    generateForMessage,
    sendQuickReply,
    refresh,
    reloadThreadsForBulk,
  );

  const {
    rootMessages,
    childrenMap,
    expandedReplyIds,
    loadingRepliesId,
    handleToggleReplies,
    tabTotalCount,
    unrepliedCount,
    categoryCounts,
  } = useInboxThreadedComments(scopedComments, section);

  const [openComposerCommentId, setOpenComposerCommentId] = useState<
    string | null
  >(null);
  const [reclassifySelectionMode, setReclassifySelectionMode] = useState(false);
  const [reclassifyMenuOpen, setReclassifyMenuOpen] = useState(false);
  const [selectedReclassifyComments, setSelectedReclassifyComments] = useState<
    Map<string, UnifiedInboxMessage>
  >(new Map());
  const [confirmReclassifyMode, setConfirmReclassifyMode] = useState<
    "selected" | "all" | null
  >(null);
  const [reclassifyBusy, setReclassifyBusy] = useState(false);
  const [reclassifyError, setReclassifyError] = useState<string | null>(null);

  const { toast, toastKey, dismissToast, showToast } = useDraftActionSuccessToast();

  const handleReplyPosted = useCallback(() => {
    showToast(t("inbox.toastReplySent"), t("inbox.toastReplySentHint"));
  }, [showToast, t]);

  const handleReplyGenerated = useCallback(() => {
    showToast(t("inbox.toastReplyGenerated"), t("inbox.toastReplyGeneratedHint"));
  }, [showToast, t]);

  const handleTopLevelCommentPosted = useCallback(() => {
    showToast(t("inbox.toastCommentPosted"), t("inbox.toastCommentPostedHint"));
    void refresh();
  }, [refresh, showToast, t]);

  const openForComment = useCallback((id: string) => {
    setOpenComposerCommentId((prev) => (prev === id ? null : id));
  }, []);

  const sourcePostLabels = new Map(
    publishedPosts.map((post) => {
      const raw = (post.title || post.body || post.handle || post.id).trim();
      const label = raw.length > 96 ? `${raw.slice(0, 93)}…` : raw;
      return [post.id, label];
    }),
  );

  const resolveSourcePostLabel = (sourcePostId: string): string | undefined => {
    const match = findPublishedPostForInboxSelection(
      publishedPosts,
      sourcePostId,
    );
    if (match) {
      return sourcePostLabels.get(match.id);
    }
    return sourcePostLabels.get(sourcePostId);
  };

  const handleSelectSourcePostFromComment = useCallback(
    (sourcePostId: string) => {
      const match = findPublishedPostForInboxSelection(
        publishedPosts,
        sourcePostId,
      );
      onSelectPostId(match?.id ?? sourcePostId.trim());
    },
    [onSelectPostId, publishedPosts],
  );

  const handleReplyClick = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      openForComment(id);
    },
    [openForComment],
  );

  const toggleReclassifySelection = useCallback(
    (comment: UnifiedInboxMessage, selected: boolean) => {
      setSelectedReclassifyComments((prev) => {
        const next = new Map(prev);
        if (selected) {
          next.set(comment.id, comment);
        } else {
          next.delete(comment.id);
        }
        return next;
      });
    },
    [],
  );

  const startCommentSelection = useCallback(() => {
    setReclassifyError(null);
    setReclassifyMenuOpen(false);
    setReclassifySelectionMode(true);
  }, []);

  const cancelCommentSelection = useCallback(() => {
    setReclassifySelectionMode(false);
    setSelectedReclassifyComments(new Map());
    setReclassifyError(null);
  }, []);

  const runReclassification = useCallback(async () => {
    if (!confirmReclassifyMode) {
      return;
    }
    const token = getStoredAccessToken();
    const ws = getStoredActiveWorkspaceId();
    if (!token?.trim() || !ws?.trim()) {
      setReclassifyError(t("inbox.categoryUpdateFailed"));
      setConfirmReclassifyMode(null);
      return;
    }
    const targetSource =
      confirmReclassifyMode === "selected"
        ? Array.from(selectedReclassifyComments.values())
        : scopedComments;
    const selectedTargets = targetSource
      .map((comment) => ({
        platform: comment.platform,
        postId: comment.sourcePostId?.trim() ?? "",
        commentId: comment.sourceCommentId?.trim() ?? "",
      }))
      .filter((target) => target.postId.length > 0 && target.commentId.length > 0);
    if (selectedTargets.length === 0) {
      setReclassifyError(t("inbox.categoryReclassifySelectHint"));
      setConfirmReclassifyMode(null);
      return;
    }
    setReclassifyBusy(true);
    setReclassifyError(null);
    try {
      await reclassifyUnifiedComments(token, ws, {
        targets: selectedTargets,
      });
      setConfirmReclassifyMode(null);
      setReclassifySelectionMode(false);
      setReclassifyMenuOpen(false);
      setSelectedReclassifyComments(new Map());
      await refresh();
    } catch {
      setReclassifyError(t("inbox.categoryUpdateFailed"));
    } finally {
      setReclassifyBusy(false);
    }
  }, [confirmReclassifyMode, refresh, scopedComments, selectedReclassifyComments, t]);

  const bulkRowHelper =
    section === "unreplied" ? bulkComposerFor : undefined;

  const listAnimKey = `${selectedPostId ?? "all"}-${section}`;
  const reduceMotion = useReducedMotion();

  const bulkOrbDeterminate =
    bulkStepProgress != null &&
    bulkStepProgress.completed < bulkStepProgress.total &&
    (bulkAllGenerating || bulkAllPosting)
      ? {
          total: bulkStepProgress.total,
          completed: bulkStepProgress.completed,
        }
      : null;
  const bulkOrbLabel =
    bulkStepProgress?.phase === "posting" ? "posting" : "generating";
  const suppressComposerFloatingOrb = bulkAllGenerating || bulkAllPosting;
  const backendClassificationRunning = classificationStatus?.state === "running";
  const classificationBusy = backendClassificationRunning || reclassifyBusy;
  const classificationPendingCount = Math.max(
    0,
    classificationStatus?.pending_count ?? 0,
  );
  const classificationEstimate = Math.max(
    10,
    classificationStatus?.estimated_seconds ?? 30,
  );
  const [classificationSecondsLeft, setClassificationSecondsLeft] =
    useState(classificationEstimate);

  useEffect(() => {
    if (!classificationBusy) {
      setClassificationSecondsLeft(classificationEstimate);
      return;
    }
    setClassificationSecondsLeft(classificationEstimate);
    const interval = window.setInterval(() => {
      setClassificationSecondsLeft((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => {
      window.clearInterval(interval);
    };
  }, [classificationBusy, classificationEstimate]);

  const showCenteredEmpty = !isLoading && rootMessages.length === 0;
  const centeredEmptyIcon = error
    ? "cloud_off"
    : channelCommentsUnsupported
      ? "chat_bubble_outline"
      : "forum";
  const centeredEmptyTitle = error
    ? t("inbox.commentsLoadErrorTitle")
    : channelCommentsUnsupported
      ? t("inbox.commentsUnsupportedTitle")
      : null;
  const centeredEmptyBody = error
    ? error
    : commentsDisabled
      ? commentStatusMessage ?? t("inbox.commentsUnsupportedBody")
      : scopedComments.length === 0
        ? t("inbox.commentsEmptyWorkspace")
        : t("inbox.commentsEmptySection");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 30 }}
      className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
    >
      <FloatingAiProgressOrb
        determinate={bulkOrbDeterminate}
        indeterminate={false}
        label={bulkOrbLabel}
      />
      <div className="shrink-0 border-b border-outline-variant/10 bg-surface py-3 pl-3 pr-3 sm:pl-4 sm:pr-4 md:pl-5 md:pr-5">
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="min-w-0 w-full sm:w-auto sm:shrink-0">
          <SocialInboxCommentSectionSelect
            layout="toolbar"
            section={section}
            onSectionChange={setSection}
            totalCount={tabTotalCount}
            unrepliedCount={unrepliedCount}
            categoryCounts={categoryCounts}
          />
          </div>
          <div className="flex min-w-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          <SocialInboxCommentScore comments={scopedComments} />
          {reclassifySelectionMode ? (
            <>
              <button
                type="button"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-2xl border border-outline-variant/30 bg-surface-container px-2.5 py-2 text-xs font-bold text-on-surface-variant transition-colors hover:border-outline-variant/60 sm:gap-2 sm:px-4 sm:py-2.5"
                onClick={cancelCommentSelection}
              >
                {t("common.cancel")}
              </button>
              <button
                type="button"
                disabled={selectedReclassifyComments.size === 0 || reclassifyBusy}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-2xl border border-secondary/30 bg-secondary/10 px-2.5 py-2 text-xs font-bold text-secondary transition-colors hover:border-secondary/60 disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2 sm:px-4 sm:py-2.5"
                onClick={() => setConfirmReclassifyMode("selected")}
              >
                <span className="material-symbols-outlined text-[18px]">
                  check_circle
                </span>
                <span className="hidden sm:inline">
                  {t("inbox.categoryReclassifySelected", {
                    count: selectedReclassifyComments.size,
                  })}
                </span>
              </button>
            </>
          ) : (
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-2xl border border-secondary/30 bg-secondary/10 px-2.5 py-2 text-xs font-bold text-secondary shadow-sm transition-all hover:border-secondary/60 motion-reduce:transform-none sm:gap-2 sm:px-4 sm:py-2.5"
              onClick={() => {
                setReclassifyError(null);
                setReclassifyMenuOpen((open) => !open);
              }}
            >
              <span className="material-symbols-outlined text-[18px]">
                auto_awesome
              </span>
              <span className="hidden sm:inline">{t("inbox.categoryReclassify")}</span>
            </motion.button>
          )}
          <motion.button
            type="button"
            onClick={onToggleLeftPanel}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            title={
              showLeftPanel
                ? t("inbox.postsHidePanel")
                : t("inbox.commentsShowPostsPanel")
            }
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-2xl border px-2.5 py-2 text-xs font-bold shadow-sm transition-all motion-reduce:transform-none sm:gap-2 sm:px-4 sm:py-2.5 ${
              showLeftPanel
                ? "border-primary/30 bg-gradient-to-r from-surface-container-high to-surface-container text-primary hover:border-primary/50"
                : "border-outline-variant/30 bg-surface-container text-on-surface-variant hover:border-outline-variant/60"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {showLeftPanel ? "left_panel_close" : "left_panel_open"}
            </span>
            <span className="hidden sm:inline">{t("inbox.postsTitle")}</span>
          </motion.button>
          <motion.button
            type="button"
            disabled={isLoading || isRefreshing}
            whileHover={{ scale: isLoading || isRefreshing ? 1 : 1.03 }}
            whileTap={{ scale: isLoading || isRefreshing ? 1 : 0.97 }}
            onClick={() => {
              void refresh();
            }}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-2xl border border-primary/30 bg-gradient-to-r from-surface-container-high to-surface-container px-2.5 py-2 text-xs font-bold text-primary shadow-sm transition-shadow hover:border-primary/50 hover:shadow-[0_6px_24px_-8px_rgba(107,73,216,0.45)] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transform-none sm:gap-2 sm:px-4 sm:py-2.5"
          >
            <span
              className={`material-symbols-outlined text-[18px] ${isRefreshing ? "animate-spin" : ""}`}
            >
              refresh
            </span>
            <span className="hidden sm:inline">{t("inbox.commentsRefresh")}</span>
          </motion.button>
          </div>
        </div>
      </div>
      {reclassifyMenuOpen ? (
        <div className="shrink-0 border-b border-outline-variant/10 bg-surface px-3 py-3 sm:px-4 md:px-5">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-outline-variant/30 bg-surface-container px-3 py-2 text-xs font-bold text-on-surface-variant transition-colors hover:border-primary/40 hover:text-primary"
              onClick={startCommentSelection}
            >
              <span className="material-symbols-outlined text-[17px]">
                check_box
              </span>
              {t("inbox.categoryReclassifyPick")}
            </button>
            <button
              type="button"
              disabled={reclassifyBusy || scopedComments.length === 0}
              className="inline-flex items-center gap-2 rounded-xl border border-secondary/30 bg-secondary/10 px-3 py-2 text-xs font-bold text-secondary transition-colors hover:border-secondary/60 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => {
                setReclassifyMenuOpen(false);
                setConfirmReclassifyMode("all");
              }}
            >
              <span className="material-symbols-outlined text-[17px]">
                select_all
              </span>
              {t("inbox.categoryReclassifyAll")}
            </button>
          </div>
        </div>
      ) : null}
      {reclassifySelectionMode ? (
        <div className="shrink-0 border-b border-outline-variant/10 bg-surface px-3 py-2 text-xs font-bold text-secondary sm:px-4 md:px-5">
          {t("inbox.categoryReclassifySelectHint")}
        </div>
      ) : null}
      {reclassifyError ? (
        <div className="shrink-0 border-b border-error/20 bg-error/10 px-3 py-2 text-xs font-bold text-error sm:px-4 md:px-5">
          {reclassifyError}
        </div>
      ) : null}

      <AnimatePresence initial={false}>
        {section === "unreplied" && bulkTargets.length > 0 ? (
          <SocialInboxUnrepliedBulkBar
            key="bulk"
            bulkTargetCount={bulkTargets.length}
            readyToPostCount={readyToPostCount}
            bulkBusy={bulkBusy}
            bulkAllGenerating={bulkAllGenerating}
            bulkAllPosting={bulkAllPosting}
            commentAiEnabled={commentAiEnabled}
            onGenerateAll={() => {
              void handleGenerateAllUnreplied();
            }}
            onPostAll={() => {
              void handlePostAll();
            }}
          />
        ) : null}
      </AnimatePresence>

      <div
        className={`relative min-h-0 min-w-0 flex-1 ${
          showCenteredEmpty
            ? "flex flex-col items-center justify-center px-4 py-8 sm:px-6"
            : "workspace-dashboard-scroll overflow-x-hidden overflow-y-auto pb-6 pr-3 pt-4 sm:pr-4 md:pr-5"
        }`}
      >
        {!showCenteredEmpty && classificationBusy ? (
          <div className="sticky right-0 top-0 z-20 mb-3 flex justify-end">
            <div className="inline-flex items-center gap-2 rounded-full border border-secondary/25 bg-surface-container-high/95 px-3 py-1.5 text-[11px] font-bold text-secondary shadow-lg shadow-black/20 backdrop-blur-md">
              <span className="material-symbols-outlined animate-spin text-[15px]" aria-hidden>
                progress_activity
              </span>
              <span>
                {t("inbox.classificationInProgress")}
              </span>
              <span className="rounded-full bg-secondary/15 px-2 py-0.5 text-secondary">
                {classificationPendingCount > 0
                  ? t("inbox.classificationRemaining", {
                      count: classificationPendingCount,
                    })
                  : classificationSecondsLeft > 0
                    ? t("inbox.classificationCountdown", {
                        seconds: classificationSecondsLeft,
                      })
                    : t("inbox.classificationFinishing")}
              </span>
            </div>
          </div>
        ) : null}
        {showCenteredEmpty ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="flex max-w-md flex-col items-center justify-center text-center"
            role={error ? "alert" : undefined}
          >
            <motion.span
              className={`material-symbols-outlined mb-5 text-6xl ${
                error ? "text-on-surface-variant/70" : "text-primary/45"
              }`}
              animate={reduceMotion ? undefined : { y: [0, -4, 0] }}
              transition={
                reduceMotion
                  ? undefined
                  : {
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }
              }
            >
              {centeredEmptyIcon}
            </motion.span>
            {centeredEmptyTitle ? (
              <p className="text-base font-bold text-on-surface sm:text-lg">
                {centeredEmptyTitle}
              </p>
            ) : null}
            <p
              className={`max-w-sm text-sm leading-relaxed text-on-surface-variant ${
                centeredEmptyTitle ? "mt-2" : ""
              }`}
            >
              {centeredEmptyBody}
            </p>
          </motion.div>
        ) : (
        <div className="relative min-w-0 max-w-full space-y-3 overflow-x-hidden">
          {selectedPost && !commentsDisabled ? (
            <SocialInboxNewCommentComposer
              post={selectedPost}
              onPosted={handleTopLevelCommentPosted}
            />
          ) : null}
          {isLoading && rootMessages.length === 0 ? (
            <div className="space-y-4" aria-busy aria-label={t("inbox.commentsLoading")}>
              {Array.from({ length: 4 }, (_, i) => (
                <div
                  key={`sk-${i}`}
                  className="h-28 rounded-2xl border border-outline-variant/15 bg-surface-container-low inbox-skeleton-shimmer"
                />
              ))}
            </div>
          ) : null}
          {rootMessages.length > 0 ? (
            <motion.div
              key={listAnimKey}
              variants={inboxListContainer}
              initial="hidden"
              animate="show"
              className="w-full min-w-0 max-w-full space-y-2.5 overflow-x-hidden"
            >
              {rootMessages.map((c) => (
                <motion.div key={c.id} variants={inboxListItem} layout={false} className="w-full min-w-0">
                  <SocialInboxCommentRow
                    comment={c}
                    composerOpenId={openComposerCommentId}
                    onOpenComment={openForComment}
                    onReplyClick={handleReplyClick}
                    childrenByParentMap={childrenMap}
                    expandedReplyIds={expandedReplyIds}
                    onToggleReplies={handleToggleReplies}
                    loadingRepliesId={loadingRepliesId}
                    bulkComposerFor={bulkRowHelper}
                    suppressFloatingOrb={suppressComposerFloatingOrb}
                    onCommentsReload={reloadAfterReply}
                    deletingCommentIds={deletingCommentIds}
                    onReplyPosted={handleReplyPosted}
                    onReplyGenerated={handleReplyGenerated}
                    selectionMode={reclassifySelectionMode}
                    selectedReclassifyIds={new Set(selectedReclassifyComments.keys())}
                    onToggleReclassifySelection={toggleReclassifySelection}
                    sourcePostLabel={
                      c.sourcePostId
                        ? resolveSourcePostLabel(c.sourcePostId)
                        : undefined
                    }
                    onSelectSourcePost={
                      c.sourcePostId
                        ? () => handleSelectSourcePostFromComment(c.sourcePostId as string)
                        : undefined
                    }
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : null}
        </div>
        )}
      </div>

      <SimpleAlertModal
        open={infoModal !== null}
        title={infoModal?.title ?? ""}
        message={infoModal?.message ?? ""}
        onClose={dismissInfoModal}
      />
      {confirmReclassifyMode ? (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-xl border border-outline-variant/20 bg-surface p-5 shadow-2xl">
            <h2 className="text-lg font-bold text-on-surface">
              {t("inbox.categoryReclassifyConfirmTitle")}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
              {confirmReclassifyMode === "selected"
                ? t("inbox.categoryReclassifySelectedConfirmBody", {
                    count: selectedReclassifyComments.size,
                  })
                : t("inbox.categoryReclassifyAllConfirmBody")}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg px-4 py-2 text-sm font-bold text-on-surface-variant hover:bg-surface-container"
                disabled={reclassifyBusy}
                onClick={() => setConfirmReclassifyMode(null)}
              >
                {t("common.cancel")}
              </button>
              <button
                type="button"
                className="rounded-lg bg-secondary px-4 py-2 text-sm font-bold text-on-secondary disabled:opacity-50"
                disabled={reclassifyBusy}
                onClick={() => void runReclassification()}
              >
                {reclassifyBusy ? t("common.saving") : t("common.confirm")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {toast ? (
        <DraftEditorSuccessToast
          key={toastKey}
          title={toast.title}
          subtitle={toast.subtitle}
          onDismiss={dismissToast}
        />
      ) : null}
    </motion.div>
  );
}
