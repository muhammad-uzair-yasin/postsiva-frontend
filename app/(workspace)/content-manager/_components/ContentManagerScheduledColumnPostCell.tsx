"use client";

import type { ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { SocialPlatformIcon } from "@/lib/social/SocialPlatformIcon";
import { TEXT_POST_PLACEHOLDER_IMAGE_SRC } from "@/lib/ui/textPostPlaceholderImage";

import type { ContentManagerPost } from "../_types/contentManagerTypes";
import { formatPipelineCardScheduleLabel } from "../../post-scheduler/calendar/_utils/postSchedulerPipelineCardFormat";
import { WorkspaceVideoWithControls } from "../../_components/WorkspaceVideoWithControls";

interface ContentManagerScheduledColumnPostCellProps {
  post: ContentManagerPost;
  scheduledAt: Date | null;
  now: Date;
  onOpenEditor: (post: ContentManagerPost) => void;
  onRequestDeleteScheduled: (post: ContentManagerPost) => void;
}

/** Compact post cell for scheduled calendar column layout. */
export function ContentManagerScheduledColumnPostCell({
  post,
  scheduledAt,
  now,
  onOpenEditor,
  onRequestDeleteScheduled,
}: ContentManagerScheduledColumnPostCellProps): ReactElement {
  const { t, locale } = useTranslations();
  const timeLabel = scheduledAt
    ? formatPipelineCardScheduleLabel(scheduledAt, now, locale, t)
    : (post.scheduleLabel ?? t("content.badgeScheduled"));

  return (
    <article className="min-w-0 overflow-hidden rounded-md border border-outline-variant/15 bg-surface-container-low shadow-sm transition-colors hover:border-outline-variant/30 hover:bg-surface-container">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-container">
        {!post.imageUrl && post.videoUrl ? (
          <WorkspaceVideoWithControls
            src={post.videoUrl}
            size="compact"
            className="h-full w-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              onOpenEditor(post);
            }}
            className="block h-full w-full"
          >
            <img
              alt=""
              className="h-full w-full object-cover"
              src={post.imageUrl || TEXT_POST_PLACEHOLDER_IMAGE_SRC}
            />
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={() => {
          onOpenEditor(post);
        }}
        className="flex w-full min-w-0 flex-col gap-1 p-1.5 text-left"
      >
        <div className="flex min-w-0 items-center gap-1">
          <SocialPlatformIcon platform={post.channel} className="h-3 w-3 shrink-0" />
          <span className="truncate text-[9px] font-medium text-on-surface-variant">
            {timeLabel}
          </span>
        </div>
        <p className="line-clamp-2 text-[10px] font-medium leading-snug text-on-surface">
          {post.body || t("content.badgeScheduled")}
        </p>
      </button>
      <div className="flex justify-end border-t border-outline-variant/10 px-1 py-0.5">
        <button
          type="button"
          onClick={() => {
            onRequestDeleteScheduled(post);
          }}
          className="rounded px-1 py-0.5 text-[9px] font-semibold text-error/80 hover:bg-error/10 hover:text-error"
        >
          {t("content.actionDelete")}
        </button>
      </div>
    </article>
  );
}
