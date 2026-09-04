"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useState, type ChangeEvent } from "react";

import {
  getStoredAccessToken,
  getStoredActiveWorkspaceId,
} from "@/lib/auth/session";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { UnifiedInboxMessage } from "@/lib/inbox/unifiedInboxTypes";
import { patchUnifiedCommentClassification } from "@/lib/social/unifiedCommentsApi";
import type { UnifiedModerateAction } from "@/lib/social/unifiedCommentModerationApi";

import { SocialInboxCategoryEditModal } from "./SocialInboxCategoryEditModal";
import { SocialInboxCommentAvatar } from "./SocialInboxCommentAvatar";
import { SocialInboxCommentTriageCard } from "./SocialInboxCommentTriageCard";
import { SocialInboxCommentCategoryBadge } from "./SocialInboxCommentCategoryBadge";
import { SocialInboxCommentActions } from "./SocialInboxCommentActions";
import type { SocialInboxBulkComposerProps } from "./SocialInboxReplyComposer";
import { SocialInboxReplyComposerPanel } from "./SocialInboxReplyComposerPanel";
import {
  INBOX_CATEGORY_OPTIONS,
  inboxCategoryColorClasses,
  inboxCategoryLabel,
} from "./socialInboxCategoryPresentation";

function bodySegmentsToPlainText(
  segments: UnifiedInboxMessage["bodySegments"],
): string {
  return segments.map((s) => s.text).join("");
}

interface SocialInboxCommentRowProps {
  readonly comment: UnifiedInboxMessage;
  readonly composerOpenId: string | null;
  readonly onOpenComment: (id: string) => void;
  readonly onReplyClick: (e: React.MouseEvent, id: string) => void;
  readonly childrenByParentMap: Map<string, UnifiedInboxMessage[]>;
  readonly expandedReplyIds: ReadonlySet<string>;
  readonly onToggleReplies: (comment: UnifiedInboxMessage) => void;
  readonly loadingRepliesId: string | null;
  readonly bulkComposerFor?: (
    msg: UnifiedInboxMessage,
  ) => SocialInboxBulkComposerProps | null;
  readonly suppressFloatingOrb?: boolean;
  readonly onCommentsReload: (
    message: UnifiedInboxMessage,
    action?: UnifiedModerateAction,
  ) => void | Promise<void>;
  readonly deletingCommentIds?: ReadonlySet<string>;
  readonly onReplyPosted?: () => void;
  readonly onReplyGenerated?: () => void;
  readonly selectionMode?: boolean;
  readonly selectedReclassifyIds?: ReadonlySet<string>;
  readonly onToggleReclassifySelection?: (
    comment: UnifiedInboxMessage,
    selected: boolean,
  ) => void;
  readonly sourcePostLabel?: string;
  readonly onSelectSourcePost?: () => void;
  readonly depth?: number;
}

export function SocialInboxCommentRow({
  comment: c,
  composerOpenId,
  onOpenComment,
  onReplyClick,
  childrenByParentMap,
  expandedReplyIds,
  onToggleReplies,
  loadingRepliesId,
  bulkComposerFor,
  suppressFloatingOrb = false,
  onCommentsReload,
  deletingCommentIds,
  onReplyPosted,
  onReplyGenerated,
  selectionMode = false,
  selectedReclassifyIds,
  onToggleReclassifySelection,
  sourcePostLabel,
  onSelectSourcePost,
  depth = 0,
}: SocialInboxCommentRowProps): React.ReactElement {
  const { t } = useTranslations();
  const [categoryKey, setCategoryKey] = useState(c.categoryKey ?? "");
  const [draftCategoryKey, setDraftCategoryKey] = useState(c.categoryKey ?? "");
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryBusy, setCategoryBusy] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  useEffect(() => {
    setCategoryKey(c.categoryKey ?? "");
    setDraftCategoryKey(c.categoryKey ?? "");
  }, [c.categoryKey]);
  const bulkComposer = bulkComposerFor ? bulkComposerFor(c) : null;
  const replyChildren = childrenByParentMap.get(c.id) ?? [];
  const indent = Boolean(c.parentMessageId) || depth > 0;
  const repliesExpanded = expandedReplyIds.has(c.id);
  const replyCountLabel =
    replyChildren.length > 0 ? replyChildren.length : (c.threadReplyCount ?? 0);
  const showRepliesCta =
    replyChildren.length > 0 || (c.threadReplyCount ?? 0) > 0;
  const nestedMarginClass =
    depth === 0 ? "" : depth === 1 ? "ml-12" : "ml-12 pl-4";
  const isComposerOpen = composerOpenId === c.id || bulkComposer != null;
  const bubbleClass = indent
    ? "rounded-xl rounded-tl-none border border-outline-variant/10 bg-surface-container p-3 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.35)] ring-0 focus-visible:ring-2 focus-visible:ring-primary/40"
    : "rounded-2xl rounded-tl-md border border-outline-variant/10 bg-gradient-to-br from-surface-container-high to-surface-container p-4 shadow-[0_8px_28px_-12px_rgba(0,0,0,0.45)] ring-0 focus-visible:ring-2 focus-visible:ring-primary/40";
  const nameClass = indent ? "text-xs font-bold" : "text-sm font-bold";
  const bodyClass = indent
    ? "break-words text-xs text-on-surface-variant [overflow-wrap:anywhere]"
    : "break-words text-sm leading-relaxed text-on-surface-variant [overflow-wrap:anywhere]";
  const replyBtnClass =
    "flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold text-primary transition-colors hover:bg-primary/10";
  const label = inboxCategoryLabel(categoryKey, t);
  const categoryColorClass = inboxCategoryColorClasses(categoryKey);
  const canEditCategory =
    (c.sourcePostId?.trim().length ?? 0) > 0 &&
    (c.sourceCommentId?.trim().length ?? 0) > 0;
  const canSelectForReclassify =
    (c.sourcePostId?.trim().length ?? 0) > 0 &&
    (c.sourceCommentId?.trim().length ?? 0) > 0;
  const selectedForReclassify = selectedReclassifyIds?.has(c.id) ?? false;
  const isDeletingComment = deletingCommentIds?.has(c.id) ?? false;
  const handleCommentsReloadAfterModeration = useCallback(
    async (message: UnifiedInboxMessage, action: UnifiedModerateAction) => {
      if (action === "delete") {
        await onCommentsReload(message, "delete");
        return;
      }
      await onCommentsReload(message);
    },
    [onCommentsReload],
  );
  const handleSelectionChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onToggleReclassifySelection?.(c, e.target.checked);
  };
  const updateCategory = useCallback(
    async (nextCategory: string) => {
      const token = getStoredAccessToken();
      const ws = getStoredActiveWorkspaceId();
      const postId = c.sourcePostId?.trim() ?? "";
      const commentId = c.sourceCommentId?.trim() ?? "";
      if (!token?.trim() || !ws?.trim() || !postId || !commentId || !nextCategory) {
        setCategoryError(t("inbox.categoryUpdateFailed"));
        return;
      }
      setCategoryBusy(true);
      setCategoryError(null);
      try {
        const out = await patchUnifiedCommentClassification(token, ws, {
          platform: c.platform,
          postId,
          commentId,
          categoryKey: nextCategory,
        });
        setCategoryKey(out.category_key);
        setDraftCategoryKey(out.category_key);
        setCategoryModalOpen(false);
      } catch {
        setCategoryError(t("inbox.categoryUpdateFailed"));
      } finally {
        setCategoryBusy(false);
      }
    },
    [c.platform, c.sourceCommentId, c.sourcePostId, t],
  );
  const openCategoryModal = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setDraftCategoryKey(categoryKey);
    setCategoryError(null);
    setCategoryModalOpen(true);
  }, [categoryKey]);

  const bodyPlain = bodySegmentsToPlainText(c.bodySegments);
  const isSelected =
    composerOpenId === c.id || bulkComposer != null || c.highlighted === true;

  if (depth === 0) {
    return (
      <div className="group/row w-full min-w-0 max-w-full overflow-x-hidden">
        <SocialInboxCommentTriageCard
          comment={c}
          bodyText={bodyPlain}
          isSelected={isSelected}
          isDeleting={isDeletingComment}
          selectionMode={selectionMode}
          canSelectForReclassify={canSelectForReclassify}
          selectedForReclassify={selectedForReclassify}
          onSelectionChange={handleSelectionChange}
          onCardActivate={() => onOpenComment(c.id)}
          onReplyClick={(e) => onReplyClick(e, c.id)}
          categoryLabel={label}
          categoryColorClass={categoryColorClass}
          categoryKey={categoryKey}
          categoryBusy={categoryBusy}
          canEditCategory={canEditCategory}
          onOpenCategoryModal={openCategoryModal}
          showRepliesCta={showRepliesCta}
          repliesExpanded={repliesExpanded}
          replyCountLabel={replyCountLabel}
          loadingReplies={loadingRepliesId === c.id}
          onToggleReplies={(e) => {
            e.stopPropagation();
            onToggleReplies(c);
          }}
          sourcePostLabel={sourcePostLabel}
          onSelectSourcePost={onSelectSourcePost}
          onModerated={handleCommentsReloadAfterModeration}
        />
        {categoryError ? (
          <p className="mt-1 text-[10px] font-bold text-error">{categoryError}</p>
        ) : null}
        {repliesExpanded ? (
          <div className="ml-4 mt-3 space-y-3 border-l-2 border-outline-variant/15 pl-4 sm:ml-8">
            {replyChildren.map((child) => (
              <SocialInboxCommentRow
                key={child.id}
                comment={child}
                composerOpenId={composerOpenId}
                onOpenComment={onOpenComment}
                onReplyClick={onReplyClick}
                childrenByParentMap={childrenByParentMap}
                expandedReplyIds={expandedReplyIds}
                onToggleReplies={onToggleReplies}
                loadingRepliesId={loadingRepliesId}
                bulkComposerFor={bulkComposerFor}
                suppressFloatingOrb={suppressFloatingOrb}
                onCommentsReload={onCommentsReload}
                deletingCommentIds={deletingCommentIds}
                onReplyPosted={onReplyPosted}
                onReplyGenerated={onReplyGenerated}
                selectionMode={selectionMode}
                selectedReclassifyIds={selectedReclassifyIds}
                onToggleReclassifySelection={onToggleReclassifySelection}
                sourcePostLabel={sourcePostLabel}
                onSelectSourcePost={onSelectSourcePost}
                depth={depth + 1}
              />
            ))}
          </div>
        ) : null}
        <SocialInboxReplyComposerPanel
          message={c}
          bulk={bulkComposer}
          open={isComposerOpen}
          indent={false}
          suppressFloatingOrb={suppressFloatingOrb}
          onReload={onCommentsReload}
          onReplyPosted={onReplyPosted}
          onReplyGenerated={onReplyGenerated}
        />
        <SocialInboxCategoryEditModal
          open={categoryModalOpen}
          value={draftCategoryKey}
          options={INBOX_CATEGORY_OPTIONS.map((key) => ({
            key,
            label: inboxCategoryLabel(key, t),
          }))}
          busy={categoryBusy}
          error={categoryError}
          onChange={setDraftCategoryKey}
          onSave={() => {
            void updateCategory(draftCategoryKey);
          }}
          onClose={() => {
            if (!categoryBusy) {
              setCategoryModalOpen(false);
              setCategoryError(null);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="group/row">
      <div className={`flex items-start gap-3 ${nestedMarginClass}`}>
        {selectionMode && canSelectForReclassify ? (
          <label className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-outline-variant/20 bg-surface-container text-primary">
            <input
              type="checkbox"
              className="h-4 w-4 accent-primary"
              checked={selectedForReclassify}
              aria-label={t("inbox.categoryReclassifySelect")}
              onClick={(e) => e.stopPropagation()}
              onChange={handleSelectionChange}
            />
          </label>
        ) : null}
        <div className="min-w-0 flex-1">
          <motion.div
            role="button"
            tabIndex={0}
            onClick={() => onOpenComment(c.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onOpenComment(c.id);
              }
            }}
            whileHover={
              depth === 0
                ? { y: -2, transition: { type: "spring", stiffness: 400, damping: 24 } }
                : undefined
            }
            whileTap={
              depth === 0
                ? { scale: 0.995, transition: { duration: 0.15 } }
                : { scale: 0.998 }
            }
            className={`${bubbleClass} relative cursor-pointer text-left outline-none motion-reduce:transform-none${
              isDeletingComment ? " pointer-events-none opacity-60" : ""
            }`}
          >
            {isDeletingComment ? (
              <div
                className="absolute inset-0 z-10 flex items-center justify-center rounded-[inherit] bg-surface/75 backdrop-blur-[1px]"
                aria-live="polite"
                aria-busy="true"
              >
                <span className="flex items-center gap-2 px-3 text-[11px] font-bold text-on-surface-variant">
                  <span
                    className="material-symbols-outlined animate-spin text-[18px]"
                    aria-hidden
                  >
                    progress_activity
                  </span>
                  {t("inbox.deleteCommentRemoving")}
                </span>
              </div>
            ) : null}
            <div className="flex items-start gap-2.5">
              <SocialInboxCommentAvatar
                avatarUri={c.avatarUri}
                userName={c.userName}
                platform={c.platform}
                authorUrn={c.sourceAuthorId}
                sizePx={indent ? 28 : 36}
                className={`${indent ? "h-7 w-7" : "h-9 w-9"} shrink-0 rounded-lg`}
              />
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-start justify-between gap-2">
                  <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className={nameClass}>{c.userName}</span>
                    <span className="text-[10px] text-on-surface-variant">
                      {c.timeLabel}
                    </span>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
                    <SocialInboxCommentActions
                      comment={c}
                      mode="moderation"
                      moderationLocked={isDeletingComment}
                      onModerated={handleCommentsReloadAfterModeration}
                    />
                    {c.showQuickReply ? (
                      <button
                        type="button"
                        className={replyBtnClass}
                        onClick={(e) => onReplyClick(e, c.id)}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          reply
                        </span>
                        {t("inbox.replyBtn")}
                      </button>
                    ) : null}
                    <SocialInboxCommentCategoryBadge
                      label={label}
                      canEdit={canEditCategory}
                      busy={categoryBusy}
                      colorClass={categoryColorClass}
                      setLabel={t("inbox.categorySet")}
                      editTitle={t("inbox.categoryEditTitle")}
                      onOpen={openCategoryModal}
                    />
                  </div>
                </div>
                {categoryError ? (
                  <p className="mb-1 text-[10px] font-bold text-error">{categoryError}</p>
                ) : null}
                <p className={bodyClass}>{bodySegmentsToPlainText(c.bodySegments)}</p>
                {showRepliesCta || onSelectSourcePost ? (
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-outline-variant/10 pt-2">
                    <div className="min-w-0">
                      {showRepliesCta ? (
                        <button
                          type="button"
                          className="text-[11px] font-bold text-primary hover:underline"
                          disabled={loadingRepliesId === c.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleReplies(c);
                          }}
                        >
                          {loadingRepliesId === c.id
                            ? t("inbox.loadingReplies")
                            : repliesExpanded
                              ? t("inbox.hideReplies")
                              : t("inbox.showReplies", { count: replyCountLabel })}
                        </button>
                      ) : null}
                    </div>
                    <div className="ml-auto flex shrink-0 flex-wrap items-center justify-end gap-2">
                      {onSelectSourcePost ? (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 rounded-md border border-primary/20 bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary transition-colors hover:border-primary/40 hover:bg-primary/15"
                          title={sourcePostLabel ?? c.contextLabel}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectSourcePost();
                          }}
                        >
                          <span className="material-symbols-outlined text-[13px]" aria-hidden>
                            article
                          </span>
                          {t("inbox.commentSourcePostButton")}
                        </button>
                      ) : null}
                      <SocialInboxCommentActions
                        comment={c}
                        mode="reaction"
                        moderationLocked={isDeletingComment}
                        onModerated={handleCommentsReloadAfterModeration}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 flex justify-end">
                    <SocialInboxCommentActions
                      comment={c}
                      mode="reaction"
                      moderationLocked={isDeletingComment}
                      onModerated={handleCommentsReloadAfterModeration}
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
          {repliesExpanded
            ? replyChildren.map((child) => (
                <SocialInboxCommentRow
                  key={child.id}
                  comment={child}
                  composerOpenId={composerOpenId}
                  onOpenComment={onOpenComment}
                  onReplyClick={onReplyClick}
                  childrenByParentMap={childrenByParentMap}
                  expandedReplyIds={expandedReplyIds}
                  onToggleReplies={onToggleReplies}
                  loadingRepliesId={loadingRepliesId}
                  bulkComposerFor={bulkComposerFor}
                  suppressFloatingOrb={suppressFloatingOrb}
                  onCommentsReload={onCommentsReload}
                  deletingCommentIds={deletingCommentIds}
                  selectionMode={selectionMode}
                  selectedReclassifyIds={selectedReclassifyIds}
                  onToggleReclassifySelection={onToggleReclassifySelection}
                  sourcePostLabel={sourcePostLabel}
                  onSelectSourcePost={onSelectSourcePost}
                  depth={depth + 1}
                />
              ))
            : null}
        </div>
      </div>
      <SocialInboxReplyComposerPanel
        message={c}
        bulk={bulkComposer}
        open={isComposerOpen}
        indent={indent}
        suppressFloatingOrb={suppressFloatingOrb}
        onReload={onCommentsReload}
        onReplyPosted={onReplyPosted}
        onReplyGenerated={onReplyGenerated}
      />
      <SocialInboxCategoryEditModal
        open={categoryModalOpen}
        value={draftCategoryKey}
        options={INBOX_CATEGORY_OPTIONS.map((key) => ({
          key,
          label: inboxCategoryLabel(key, t),
        }))}
        busy={categoryBusy}
        error={categoryError}
        onChange={setDraftCategoryKey}
        onSave={() => {
          void updateCategory(draftCategoryKey);
        }}
        onClose={() => {
          if (!categoryBusy) {
            setCategoryModalOpen(false);
            setCategoryError(null);
          }
        }}
      />
    </div>
  );
}
