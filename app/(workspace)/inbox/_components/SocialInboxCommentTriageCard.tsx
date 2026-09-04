"use client";

import { motion } from "framer-motion";
import type { ChangeEvent, MouseEvent, ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { UnifiedInboxMessage } from "@/lib/inbox/unifiedInboxTypes";
import type { UnifiedModerateAction } from "@/lib/social/unifiedCommentModerationApi";

import { SocialInboxCommentActions } from "./SocialInboxCommentActions";
import { SocialInboxCommentAvatar } from "./SocialInboxCommentAvatar";
import { SocialInboxCommentIconButton } from "./SocialInboxCommentIconButton";
import {
  inboxSentimentColorClasses,
  inboxSentimentFromCategory,
  inboxSentimentLabel,
} from "./socialInboxSentimentPresentation";

interface SocialInboxCommentTriageCardProps {
  readonly comment: UnifiedInboxMessage;
  readonly bodyText: string;
  readonly isSelected: boolean;
  readonly isDeleting: boolean;
  readonly selectionMode: boolean;
  readonly canSelectForReclassify: boolean;
  readonly selectedForReclassify: boolean;
  readonly onSelectionChange: (e: ChangeEvent<HTMLInputElement>) => void;
  readonly onCardActivate: () => void;
  readonly onReplyClick: (e: MouseEvent) => void;
  readonly categoryLabel: string;
  readonly categoryColorClass: string;
  readonly categoryKey: string;
  readonly categoryBusy: boolean;
  readonly canEditCategory: boolean;
  readonly onOpenCategoryModal: (e: MouseEvent) => void;
  readonly showRepliesCta: boolean;
  readonly repliesExpanded: boolean;
  readonly replyCountLabel: number;
  readonly loadingReplies: boolean;
  readonly onToggleReplies: (e: MouseEvent) => void;
  readonly sourcePostLabel?: string;
  readonly onSelectSourcePost?: () => void;
  readonly onModerated: (
    message: UnifiedInboxMessage,
    action: UnifiedModerateAction,
  ) => void | Promise<void>;
}

export function SocialInboxCommentTriageCard({
  comment: c,
  bodyText,
  isSelected,
  isDeleting,
  selectionMode,
  canSelectForReclassify,
  selectedForReclassify,
  onSelectionChange,
  onCardActivate,
  onReplyClick,
  categoryLabel,
  categoryColorClass,
  categoryKey,
  categoryBusy,
  canEditCategory,
  onOpenCategoryModal,
  showRepliesCta,
  repliesExpanded,
  replyCountLabel,
  loadingReplies,
  onToggleReplies,
  sourcePostLabel,
  onSelectSourcePost,
  onModerated,
}: SocialInboxCommentTriageCardProps): ReactElement {
  const { t } = useTranslations();
  const sentiment = inboxSentimentFromCategory(categoryKey || c.categoryKey);
  const sentimentLabel = inboxSentimentLabel(sentiment, t);
  const sentimentClass = inboxSentimentColorClasses(sentiment);

  const primaryTag = categoryLabel
    ? {
        label: categoryLabel,
        className: categoryColorClass,
        icon: null as string | null,
      }
    : c.unreplied
      ? {
          label: t("inbox.tagFollowUp"),
          className: "border-primary/35 bg-primary/15 text-primary",
          icon: "schedule" as string | null,
        }
      : {
          label: sentimentLabel,
          className: sentimentClass,
          icon:
            sentiment === "positive"
              ? ("sentiment_satisfied" as string | null)
              : null,
        };

  return (
    <div className="flex w-full min-w-0 items-start gap-2">
      {selectionMode && canSelectForReclassify ? (
        <label className="mt-2 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-outline-variant/20 bg-surface-container text-primary">
          <input
            type="checkbox"
            className="h-3.5 w-3.5 accent-primary"
            checked={selectedForReclassify}
            aria-label={t("inbox.categoryReclassifySelect")}
            onClick={(e) => e.stopPropagation()}
            onChange={onSelectionChange}
          />
        </label>
      ) : null}
      <motion.article
        role="button"
        tabIndex={0}
        layout={false}
        whileHover={{ y: -1, transition: { type: "spring", stiffness: 400, damping: 28 } }}
        whileTap={{ scale: 0.998 }}
        onClick={onCardActivate}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onCardActivate();
          }
        }}
        className={`relative w-full min-w-0 flex-1 basis-0 cursor-pointer rounded-2xl border bg-surface-container-low px-3 py-2.5 text-left shadow-sm outline-none transition-[border-color,box-shadow] motion-reduce:transform-none ${
          isSelected
            ? "border-primary/50 ring-2 ring-primary/35"
            : "border-outline-variant/15 hover:border-outline-variant/25"
        }${isDeleting ? " pointer-events-none opacity-60" : ""}`}
      >
        {isDeleting ? (
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

        <div className="flex items-center gap-2.5">
          <div
            className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-surface-container ring-1 ring-outline-variant/20"
            aria-hidden
          >
            <SocialInboxCommentAvatar
              avatarUri={c.avatarUri}
              userName={c.userName}
              platform={c.platform}
              authorUrn={c.sourceAuthorId}
              sizePx={36}
              className="size-9 max-h-9 max-w-9"
            />
          </div>
          <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
            <p className="min-w-0 truncate text-sm font-bold leading-tight text-on-surface sm:text-base">
              {c.userName}
            </p>
            <div className="flex shrink-0 flex-col items-end gap-1">
              {primaryTag.label ? (
                <span
                  className={`inline-flex max-w-[10rem] items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${primaryTag.className}`}
                >
                  {primaryTag.icon ? (
                    <span
                      className="material-symbols-outlined text-[12px]"
                      aria-hidden
                    >
                      {primaryTag.icon}
                    </span>
                  ) : null}
                  <span className="truncate">{primaryTag.label}</span>
                </span>
              ) : null}
              <span className="flex items-center gap-1.5">
                <time className="text-[10px] font-medium text-on-surface-variant/90">
                  {c.timeLabel}
                </time>
                {c.unreplied ? (
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-primary"
                    title={t("inbox.tabsUnreplied")}
                    aria-hidden
                  />
                ) : null}
              </span>
            </div>
          </div>
        </div>
        <p className="mt-2 break-words text-lg font-semibold leading-relaxed tracking-tight text-on-surface [overflow-wrap:anywhere] sm:text-xl">
          {bodyText}
        </p>

        <div
          className="mt-2 flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
          onClick={(e) => e.stopPropagation()}
        >
          {showRepliesCta ? (
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary/45 bg-primary/15 px-3 py-1.5 text-xs font-extrabold text-primary transition-colors hover:bg-primary/25"
              disabled={loadingReplies}
              onClick={onToggleReplies}
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden>
                {repliesExpanded ? "expand_less" : "forum"}
              </span>
              {loadingReplies
                ? t("inbox.loadingReplies")
                : repliesExpanded
                  ? t("inbox.hideReplies")
                  : t("inbox.showReplies", { count: replyCountLabel })}
            </button>
          ) : (
            <span aria-hidden />
          )}
          <div
            className="relative z-[1] flex min-w-0 w-full flex-wrap items-center justify-end gap-1 sm:ml-auto sm:w-auto sm:gap-1.5"
            role="toolbar"
            aria-label={t("inbox.commentActionsToolbar")}
          >
            {c.showQuickReply ? (
              <SocialInboxCommentIconButton
                icon="chat_bubble"
                label={t("inbox.actionReplyShort")}
                title={t("inbox.actionReplyTitle")}
                onClick={onReplyClick}
              />
            ) : null}
            {onSelectSourcePost ? (
              <SocialInboxCommentIconButton
                icon="article"
                label={t("inbox.actionSourcePostShort")}
                title={t("inbox.actionSourcePostTitle")}
                ariaLabel={
                  sourcePostLabel
                    ? t("inbox.actionSourcePostTitleNamed", {
                        post:
                          sourcePostLabel.length > 96
                            ? `${sourcePostLabel.slice(0, 95)}…`
                            : sourcePostLabel,
                      })
                    : t("inbox.actionSourcePostTitle")
                }
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectSourcePost();
                }}
              />
            ) : null}
            {canEditCategory ? (
              <SocialInboxCommentIconButton
                icon="label"
                label={t("inbox.actionCategoryShort")}
                title={t("inbox.categoryEditTitle")}
                disabled={categoryBusy}
                onClick={onOpenCategoryModal}
              />
            ) : null}
            <SocialInboxCommentActions
              comment={c}
              mode="all"
              appearance="icon"
              moderationLocked={isDeleting}
              onModerated={onModerated}
            />
          </div>
        </div>
      </motion.article>
    </div>
  );
}
