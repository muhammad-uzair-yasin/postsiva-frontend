"use client";

import type { ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { SocialPlatformIcon } from "@/lib/social/SocialPlatformIcon";
import { TEXT_POST_PLACEHOLDER_IMAGE_SRC } from "@/lib/ui/textPostPlaceholderImage";
import type { ContentManagerPost } from "../_types/contentManagerTypes";
import { formatPipelineCardScheduleLabel } from "../../post-scheduler/calendar/_utils/postSchedulerPipelineCardFormat";
import { WorkspaceVideoWithControls } from "../../_components/WorkspaceVideoWithControls";

interface ContentManagerScheduledPipelineCardProps {
  post: ContentManagerPost;
  /** When null, the time row uses `post.scheduleLabel`. */
  scheduledAt: Date | null;
  now: Date;
  onOpenEditor: (post: ContentManagerPost) => void;
  onRequestDeleteScheduled: (post: ContentManagerPost) => void;
}

export function ContentManagerScheduledPipelineCard({
  post,
  scheduledAt,
  now,
  onOpenEditor,
  onRequestDeleteScheduled,
}: ContentManagerScheduledPipelineCardProps): ReactElement {
  const { t, locale } = useTranslations();
  const isVideo = post.draftMedia === "video";
  const isPublished = post.status === "published";
  const timeLabel = scheduledAt
    ? formatPipelineCardScheduleLabel(scheduledAt, now, locale, t)
    : (post.scheduleLabel ??
      (isPublished
        ? t("postScheduler.published.title")
        : t("content.badgeScheduled")));

  return (
    <article className="group relative pl-10">
      <div
        className={`absolute left-3.5 top-6 h-1.5 w-1.5 rounded-full ${
          isPublished ? "bg-primary" : "bg-secondary"
        }`}
        aria-hidden
      />
      <div className="overflow-hidden rounded-xl border border-transparent bg-surface-container-low shadow-xl transition-all duration-300 hover:border-outline-variant/10 hover:bg-surface-container">
        <div className="flex min-w-0 flex-col lg:flex-row">
          <div
            className={`relative h-40 w-full shrink-0 overflow-hidden lg:h-auto lg:w-48 ${
              isVideo ? "flex items-center justify-center bg-surface-container-highest" : ""
            }`}
          >
            {post.imageUrl ? (
              <>
                <img
                  alt=""
                  className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 ${
                    isVideo ? "opacity-60" : ""
                  }`}
                  src={post.imageUrl}
                />
                {isVideo ? (
                  <span className="material-symbols-outlined pointer-events-none absolute text-4xl text-on-surface/50">
                    videocam
                  </span>
                ) : null}
              </>
            ) : post.videoUrl ? (
              <WorkspaceVideoWithControls
                src={post.videoUrl}
                size="card"
                className="h-full w-full"
              />
            ) : (
              <img
                alt=""
                className="h-full w-full object-cover"
                src={TEXT_POST_PLACEHOLDER_IMAGE_SRC}
              />
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-between p-4 sm:p-5">
            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      isPublished
                        ? "bg-primary/10 text-primary"
                        : "bg-secondary/10 text-secondary"
                    }`}
                  >
                    {isPublished
                      ? t("postScheduler.published.title")
                      : t("content.badgeScheduled")}
                  </span>
                  <span className="text-xs font-medium text-on-surface-variant">
                    {timeLabel}
                  </span>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-surface bg-surface-container-high">
                  <SocialPlatformIcon
                    platform={post.channel}
                    className="h-4 w-4"
                  />
                </div>
              </div>
              <p className="mb-1 text-xs font-medium text-on-surface-variant">
                {post.handle || post.channel}
              </p>
              <p className="line-clamp-3 text-sm font-medium leading-relaxed text-on-surface">
                {post.body}
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex gap-4">
                {isPublished ? (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenEditor(post);
                    }}
                    className="text-on-surface-variant transition-colors hover:text-primary"
                    aria-label={t("content.actionPreview")}
                  >
                    <span className="material-symbols-outlined text-lg">
                      open_in_new
                    </span>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        onOpenEditor(post);
                      }}
                      className="text-on-surface-variant transition-colors hover:text-primary"
                      aria-label={t("content.actionEdit")}
                    >
                      <span className="material-symbols-outlined text-lg">
                        edit_square
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onOpenEditor(post);
                      }}
                      className="text-on-surface-variant transition-colors hover:text-secondary"
                      aria-label={t("content.actionPreview")}
                    >
                      <span className="material-symbols-outlined text-lg">
                        visibility
                      </span>
                    </button>
                  </>
                )}
              </div>
              {isPublished ? null : (
                <button
                  type="button"
                  onClick={() => {
                    onRequestDeleteScheduled(post);
                  }}
                  className="rounded-full bg-error/15 px-4 py-1.5 text-xs font-bold text-error transition-all hover:bg-error/25"
                >
                  {t("content.actionDeleteScheduled")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
