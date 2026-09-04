"use client";

import { useMemo, useState, type ReactElement } from "react";

import { DraftEditorMediaPreviewModal } from "@/app/(workspace)/content-manager/draft/[id]/_components/DraftEditorMediaPreviewModal";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { SocialPlatformIcon } from "@/lib/social/SocialPlatformIcon";
import { isSocialPlatformIconId } from "@/lib/social/socialPlatformIconSrc";

import type { CalendarPost } from "../_types/calendarTypes";
import { calendarPostPreviewMedia } from "../_utils/calendarPostPreviewMedia";
import { CalendarPostMediaThumb } from "./CalendarPostMediaThumb";

interface CalendarWeekPostCardProps {
  readonly post: CalendarPost;
  readonly onOpen: (post: CalendarPost) => void;
  readonly onRequestDelete?: (post: CalendarPost) => void;
  readonly onRequestRetry?: (post: CalendarPost) => void;
  readonly canDrag?: boolean;
  readonly saving?: boolean;
  readonly retrying?: boolean;
}

function postTimeLabel(at: Date): string {
  return at.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function CalendarWeekPostStatusBadge({
  postKind,
  label,
}: {
  readonly postKind: CalendarPost["postKind"];
  readonly label: string;
}): ReactElement {
  const tone =
    postKind === "published"
      ? "bg-primary/15 text-primary"
      : postKind === "failed"
        ? "bg-error/15 text-error"
        : "bg-secondary/15 text-secondary";
  return (
    <span
      className={`shrink-0 rounded px-1 py-px text-[9px] font-bold uppercase tracking-wide ${tone}`}
    >
      {label}
    </span>
  );
}

export function CalendarWeekPostCard({
  post,
  onOpen,
  onRequestDelete,
  onRequestRetry,
  canDrag = false,
  saving = false,
  retrying = false,
}: CalendarWeekPostCardProps): ReactElement {
  const { t } = useTranslations();
  const [mediaPreviewOpen, setMediaPreviewOpen] = useState(false);
  const previewMedia = useMemo(() => calendarPostPreviewMedia(post), [post]);
  const platform = isSocialPlatformIconId(post.platform) ? post.platform : "instagram";
  const caption = post.caption || t("postScheduler.calendar.untitledPost");
  const hasRichContent = Boolean(post.mediaUrl) || caption.length > 48;
  const isFailed = post.postKind === "failed";
  const canDelete = post.postKind !== "published" && Boolean(onRequestDelete);
  const canRetry = isFailed && Boolean(onRequestRetry);
  const time = postTimeLabel(post.scheduledAt);
  const statusLabel =
    post.postKind === "published"
      ? t("postScheduler.published.title")
      : isFailed
        ? t("postScheduler.calendar.badgeFailed")
        : t("postScheduler.calendar.badgeScheduled");
  const errorSnippet = post.errorMessage?.trim() ?? "";

  const sharedProps = {
    role: "button" as const,
    tabIndex: 0,
    draggable: canDrag && !isFailed && !saving && !retrying,
    onClick: () => onOpen(post),
    onKeyDown: (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onOpen(post);
      }
    },
    onDragStart: (event: React.DragEvent) => {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/calendar-post-id", post.id);
    },
  };

  const cardClass = [
    "w-full cursor-pointer rounded-md border shadow-sm transition-shadow hover:shadow-md",
    isFailed
      ? "border-error/35 bg-error/5 hover:border-error/50"
      : "border-outline-variant/30 bg-surface-container-highest hover:border-primary/40",
  ].join(" ");

  const actionRow =
    canRetry || saving || retrying ? (
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {canRetry ? (
          <button
            type="button"
            disabled={saving || retrying}
            onClick={(event) => {
              event.stopPropagation();
              onRequestRetry?.(post);
            }}
            className="rounded-md bg-secondary-container px-2 py-1 text-[10px] font-bold text-on-secondary-container disabled:opacity-60"
          >
            {retrying ? t("postScheduler.calendar.retryingPublish") : t("postScheduler.calendar.retryPublish")}
          </button>
        ) : null}
        {saving ? (
          <span className="text-[10px] font-medium text-primary">{t("postScheduler.calendar.saving")}</span>
        ) : null}
      </div>
    ) : null;

  if (!hasRichContent) {
    return (
      <article {...sharedProps} className={`${cardClass} px-2.5 py-2`}>
        <div className="flex flex-wrap items-center gap-1.5">
          <SocialPlatformIcon platform={platform} className="h-4 w-4 shrink-0 rounded-sm" alt="" />
          <time className="text-xs font-bold text-on-surface" dateTime={post.scheduledAt.toISOString()}>
            {time}
          </time>
          <CalendarWeekPostStatusBadge postKind={post.postKind} label={statusLabel} />
        </div>
        {errorSnippet ? (
          <p className="mt-1 line-clamp-2 text-[10px] text-error">{errorSnippet}</p>
        ) : null}
        {actionRow}
      </article>
    );
  }

  return (
    <article
      {...sharedProps}
      className={`group relative overflow-hidden rounded-lg p-2.5 ${cardClass}`}
    >
      <div className="flex gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <SocialPlatformIcon platform={platform} className="h-4 w-4 shrink-0 rounded-sm" alt="" />
            <time className="text-xs font-bold text-on-surface" dateTime={post.scheduledAt.toISOString()}>
              {time}
            </time>
            <CalendarWeekPostStatusBadge postKind={post.postKind} label={statusLabel} />
          </div>
          <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-on-surface">{caption}</p>
          {errorSnippet ? (
            <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-error">{errorSnippet}</p>
          ) : null}
          {actionRow}
        </div>
        {post.mediaUrl ? (
          <CalendarPostMediaThumb post={post} onPreview={() => setMediaPreviewOpen(true)} />
        ) : null}
      </div>
      <DraftEditorMediaPreviewModal
        open={mediaPreviewOpen}
        imageUrl={previewMedia.imageUrl}
        videoUrl={previewMedia.videoUrl}
        onClose={() => setMediaPreviewOpen(false)}
      />
      {canDelete ? (
        <button
          type="button"
          aria-label={t("content.actionDelete")}
          onClick={(event) => {
            event.stopPropagation();
            onRequestDelete?.(post);
          }}
          className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded text-on-surface-variant/70 opacity-0 transition-opacity hover:bg-error/10 hover:text-error group-hover:opacity-100 focus-visible:opacity-100"
        >
          <span className="material-symbols-outlined text-[14px]">delete</span>
        </button>
      ) : null}
    </article>
  );
}
