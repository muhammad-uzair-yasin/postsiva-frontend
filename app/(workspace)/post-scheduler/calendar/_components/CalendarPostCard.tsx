"use client";

import { SocialPlatformIcon } from "@/lib/social/SocialPlatformIcon";
import { isSocialPlatformIconId } from "@/lib/social/socialPlatformIconSrc";
import type { CalendarPost } from "../_types/calendarTypes";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { WorkspaceVideoWithControls } from "../../../_components/WorkspaceVideoWithControls";

export function CalendarPostCard({ post, compact = false, saving = false, canDrag = false, onOpen }: {
  post: CalendarPost; compact?: boolean; saving?: boolean; canDrag?: boolean; onOpen: (post: CalendarPost) => void;
}) {
  const { t } = useTranslations();
  const platform = isSocialPlatformIconId(post.platform) ? post.platform : "instagram";
  const isPublished = post.postKind === "published";
  const statusLabel = isPublished
    ? t("postScheduler.published.title")
    : t("postScheduler.calendar.badgeScheduled");
  const statusBadgeClass = isPublished
    ? "border-primary/35 bg-primary/15 text-primary"
    : "border-secondary/35 bg-secondary-container/35 text-on-secondary-container";

  return (
    <article
      draggable={canDrag && !saving}
      onDragStart={(event) => {
        event.dataTransfer.setData("text/calendar-post-id", post.id);
      }}
      className="relative z-[1] cursor-pointer overflow-hidden rounded-lg border border-outline-variant/25 bg-surface-container-high shadow-sm hover:border-primary/50"
    >
      <span
        className={`absolute right-1.5 top-1.5 z-10 rounded-md border px-1.5 py-0.5 text-[8px] font-black uppercase leading-none ${statusBadgeClass}`}
      >
        {statusLabel}
      </span>
      {!compact && post.mediaUrl && post.mediaKind === "video" ? (
        <div className="relative h-20 bg-black">
          <WorkspaceVideoWithControls
            src={post.mediaUrl}
            size="compact"
            className="h-full w-full"
          />
        </div>
      ) : !compact && post.mediaUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- Calendar previews render user media URLs.
        <img src={post.mediaUrl} alt="" className="h-20 w-full object-cover" />
      ) : null}
      <div className={`relative ${compact ? "min-h-14 p-1.5 pr-16" : "p-2"}`}>
        <div className="flex items-center gap-1.5">
          <SocialPlatformIcon platform={platform} className="h-4 w-4 shrink-0 rounded" alt="" />
          <time className="text-[10px] font-bold text-primary">
            {post.scheduledAt.toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}
          </time>
          {saving ? <span className="text-[9px] text-primary">{t("postScheduler.calendar.saving")}</span> : null}
        </div>
        <p className={`${compact ? "line-clamp-1" : "mt-1 line-clamp-2"} text-[11px] leading-snug text-on-surface`}>
          {post.caption || t("postScheduler.calendar.untitledPost")}
        </p>
        {!compact ? <p className="mt-1 truncate text-[10px] text-on-surface-variant">{post.account}</p> : null}
        {compact && post.mediaUrl ? (
          <div className="absolute bottom-1.5 right-1.5 top-1.5 w-12 overflow-hidden rounded-md bg-black/30">
            {post.mediaKind === "video" ? (
              <WorkspaceVideoWithControls
                src={post.mediaUrl}
                size="compact"
                className="h-full w-full"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- Calendar previews render user media URLs.
              <img src={post.mediaUrl} alt="" className="h-full w-full object-cover" />
            )}
          </div>
        ) : null}
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onOpen(post);
          }}
          className={`${compact ? "mt-1 text-[10px]" : "mt-2 text-xs"} inline-flex items-center gap-1 font-bold text-primary hover:underline`}
        >
          <span className="material-symbols-outlined text-[14px]">edit_square</span>
          {t("content.actionEdit")}
        </button>
      </div>
    </article>
  );
}
