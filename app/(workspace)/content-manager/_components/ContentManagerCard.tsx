"use client";

import { useState } from "react";

import { SocialPlatformIcon } from "@/lib/social/SocialPlatformIcon";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { ContentManagerPost } from "../_types/contentManagerTypes";
import { ContentManagerCardFooter } from "./ContentManagerCardFooter";
import { WorkspaceVideoWithControls } from "../../_components/WorkspaceVideoWithControls";

interface ContentManagerCardProps {
  post: ContentManagerPost;
  onOpenDraftEditor?: (post: ContentManagerPost) => void;
  onOpenScheduledEditor?: (post: ContentManagerPost) => void;
  onRequestDeleteDraft?: (post: ContentManagerPost) => void;
  aiWatcherData?: React.ComponentProps<typeof ContentManagerCardFooter>["aiWatcherData"];
  onAiWatcherEnabled?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

function StatusBadge({
  post,
  t,
}: {
  post: ContentManagerPost;
  t: (key: string) => string;
}): React.ReactElement | null {
  if (post.status === "scheduled") {
    return (
      <div className="flex items-center gap-1.5 rounded-full bg-surface-container-high/90 px-2.5 py-1 backdrop-blur-md">
        <span className="material-symbols-outlined text-sm text-secondary">schedule</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface">
          {post.scheduleLabel ?? t("content.badgeScheduled")}
        </span>
      </div>
    );
  }
  if (post.status === "published") {
    return (
      <div className="flex items-center gap-1.5 rounded-full bg-secondary-container px-2.5 py-1 text-on-secondary-container">
        <span
          className="material-symbols-outlined text-sm"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          check_circle
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest">
          {t("content.badgePublished")}
        </span>
      </div>
    );
  }
  if (post.status === "draft") {
    return (
      <div className="flex items-center gap-1.5 rounded-full bg-surface-container-high px-2.5 py-1 text-on-surface-variant">
        <span className="material-symbols-outlined text-sm">edit_note</span>
        <span className="text-[10px] font-bold uppercase tracking-widest">
          {t("content.badgeDraft")}
        </span>
      </div>
    );
  }
  return null;
}

export function ContentManagerCard({
  post,
  onOpenDraftEditor,
  onOpenScheduledEditor,
  onRequestDeleteDraft,
  aiWatcherData,
  onAiWatcherEnabled,
  onRefresh,
  isRefreshing,
}: ContentManagerCardProps): React.ReactElement {
  const { t } = useTranslations();
  const [imgError, setImgError] = useState(false);
  const isDraft = post.status === "draft";
  const dashed = isDraft && post.draftMedia !== "video";
  const draftHeading = isDraft ? post.title?.trim() : "";
  const accountLabel = post.handle.trim();
  const hasImage = Boolean(post.imageUrl && post.draftMedia !== "empty" && !imgError);
  const hasVideo = Boolean(post.videoUrl) && !hasImage;
  const showMedia = hasImage || hasVideo;

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border border-outline-variant/10 bg-surface-container shadow-md ring-1 ring-white/5 transition-all hover:border-outline-variant/25 hover:shadow-lg ${
        dashed ? "border-dashed border-outline-variant/30" : ""
      }`}
    >
      {isRefreshing ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            <span className="text-xs text-white">{t("content.refreshing")}</span>
          </div>
        </div>
      ) : null}

      {showMedia ? (
        <div className="relative w-full overflow-hidden bg-surface-container-high">
          {onRefresh ? (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              title={t("content.refreshPostTitle")}
              className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70 disabled:opacity-50"
            >
              <span
                className={`material-symbols-outlined text-sm ${isRefreshing ? "animate-spin" : ""}`}
              >
                refresh
              </span>
            </button>
          ) : null}
          <div className="absolute left-2 top-2 z-10">
            <StatusBadge post={post} t={t} />
          </div>
          {hasImage ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- platform CDN URLs */}
              <img
                src={post.imageUrl!}
                alt=""
                loading="lazy"
                onError={() => setImgError(true)}
                className={`block h-auto w-full transition-transform duration-300 group-hover:scale-[1.02] ${
                  post.draftMedia === "video" ? "opacity-50" : ""
                }`}
              />
              {post.draftMedia === "video" ? (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-on-surface">movie</span>
                </div>
              ) : null}
            </>
          ) : (
            <WorkspaceVideoWithControls
              src={post.videoUrl!}
              size="card"
              className="block h-auto w-full"
            />
          )}
        </div>
      ) : null}

      <div className="flex flex-col gap-2 p-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-outline-variant/20 bg-surface-container-high p-1">
            <SocialPlatformIcon platform={post.channel} className="h-4 w-4" />
          </div>
          {draftHeading ? (
            <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-on-surface">
              {draftHeading}
            </h3>
          ) : accountLabel ? (
            <span className="min-w-0 flex-1 truncate text-xs font-semibold text-primary">
              {accountLabel}
            </span>
          ) : null}
          {!showMedia ? <StatusBadge post={post} t={t} /> : null}
          {!showMedia && onRefresh ? (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              title={t("content.refreshPostTitle")}
              className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface disabled:opacity-50"
            >
              <span
                className={`material-symbols-outlined text-sm ${isRefreshing ? "animate-spin" : ""}`}
              >
                refresh
              </span>
            </button>
          ) : null}
        </div>

        {!isDraft && post.title ? (
          <h3 className="text-sm font-semibold leading-snug text-on-surface">{post.title}</h3>
        ) : null}
        {post.body ? (
          <p
            className={`line-clamp-5 text-xs leading-relaxed text-on-surface-variant ${
              isDraft && !post.title ? "italic" : ""
            }`}
          >
            {post.body}
          </p>
        ) : null}

        {post.status === "published" && post.metrics ? (
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            <div className="rounded-lg bg-surface-container-high px-2 py-1.5 text-center">
              <span className="block text-sm font-bold text-secondary">{post.metrics.reach}</span>
              <span className="text-[9px] uppercase tracking-tighter text-on-surface-variant">
                {t("content.statReach")}
              </span>
            </div>
            <div className="rounded-lg bg-surface-container-high px-2 py-1.5 text-center">
              <span className="block text-sm font-bold text-primary">{post.metrics.likes}</span>
              <span className="text-[9px] uppercase tracking-tighter text-on-surface-variant">
                {t("content.statLikes")}
              </span>
            </div>
            <div className="rounded-lg bg-surface-container-high px-2 py-1.5 text-center">
              <span className="block text-sm font-bold text-on-surface">{post.metrics.comments}</span>
              <span className="text-[9px] uppercase tracking-tighter text-on-surface-variant">
                {t("content.statComments")}
              </span>
            </div>
          </div>
        ) : null}

        <ContentManagerCardFooter
          post={post}
          onOpenDraftEditor={onOpenDraftEditor}
          onOpenScheduledEditor={onOpenScheduledEditor}
          onRequestDeleteDraft={onRequestDeleteDraft}
          aiWatcherData={aiWatcherData}
          onAiWatcherEnabled={onAiWatcherEnabled}
        />
      </div>
    </article>
  );
}
