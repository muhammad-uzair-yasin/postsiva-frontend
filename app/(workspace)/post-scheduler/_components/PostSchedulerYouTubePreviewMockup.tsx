"use client";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { PreviewIdentityProps } from "../_types/postSchedulerPreviewIdentity";
import { SocialPlatformIcon } from "@/lib/social/SocialPlatformIcon";
import { PostSchedulerPreviewFormattedBody } from "./PostSchedulerPreviewFormattedBody";
import { PostSchedulerPreviewMediaBlock } from "./PostSchedulerPreviewMediaBlock";

export function PostSchedulerYouTubePreviewMockup({
  displayName,
  avatarUrl,
  bodyText,
  youtubeTitle,
  youtubeThumbnailUrl,
  youtubeGenerateThumbnail = false,
  attachedMedia = [],
  imageGenerationShimmer = false,
  onRemoveMedia,
  onMoveMedia,
}: PreviewIdentityProps): React.ReactElement {
  const { t } = useTranslations();
  const name = displayName ?? t("postScheduler.previewMockups.channel");
  const title = youtubeTitle?.trim() ?? "";
  const video = attachedMedia.find((m) => m.mediaType === "video");
  const videoOnly = video ? [video] : [];
  const hasThumb = Boolean(youtubeThumbnailUrl?.trim());

  return (
    <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-outline-variant/10 bg-[#0f0f0f]">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-white/10">
            {avatarUrl ? (
              <img alt="" className="h-full w-full object-cover" src={avatarUrl} />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <SocialPlatformIcon platform="youtube" className="h-5 w-5" alt="" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">{name}</span>
              <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/80">
                {t("postScheduler.previewMockups.community")}
              </span>
            </div>
            <span className="text-xs text-white/50">
              {t("postScheduler.previewMockups.justNow")}
            </span>
          </div>
        </div>
        {title ? (
          <h3 className="mt-3 text-base font-semibold leading-snug text-white">{title}</h3>
        ) : (
          <p className="mt-3 text-sm text-white/45">
            {t("postScheduler.previewMockups.addVideoTitle")}
          </p>
        )}
        <PostSchedulerPreviewFormattedBody
          text={bodyText}
          className={`text-sm font-body leading-relaxed text-white/90 whitespace-pre-wrap break-words ${title ? "mt-2" : "mt-1"}`}
          highlightClassName="font-medium text-[#3ea6ff]"
          placeholder={t("postScheduler.previewMockups.descriptionPlaceholder")}
          placeholderClassName="text-white/45"
        />
        <div className="mt-3 grid grid-cols-1 gap-3">
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-white/55">
              {t("postScheduler.preview.video")}
            </p>
            <PostSchedulerPreviewMediaBlock
              attachedMedia={videoOnly}
              className="aspect-video min-h-[140px] w-full overflow-hidden rounded-xl bg-white/5"
              onRemoveMedia={onRemoveMedia}
          onMoveMedia={onMoveMedia}
              placeholder={
                <span className="material-symbols-outlined text-5xl text-red-500/30">
                  smart_display
                </span>
              }
            />
          </div>
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-white/55">
              {t("postScheduler.preview.thumbnail")}
            </p>
            <div className="relative aspect-video min-h-[140px] w-full overflow-hidden rounded-xl bg-white/5">
              {hasThumb ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element -- preview CDN media URL */}
                  <img
                    src={youtubeThumbnailUrl ?? ""}
                    alt={t("postScheduler.preview.youtubeThumbnailAlt")}
                    className="h-full w-full object-cover"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-black/25" />
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-5xl text-white/90">
                      play_circle
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="material-symbols-outlined text-5xl text-red-500/30">
                    image
                  </span>
                </div>
              )}
              {youtubeGenerateThumbnail && !hasThumb ? (
                <p className="absolute bottom-2 left-2 rounded-md bg-black/65 px-2 py-1 text-[11px] text-white/85">
                  {t("postScheduler.preview.generatingThumbnail")}
                </p>
              ) : null}
              {imageGenerationShimmer ? (
                <div
                  className="preview-media-generating-shimmer pointer-events-none absolute inset-0"
                  aria-hidden
                />
              ) : null}
            </div>
          </div>
        </div>
        <div className="mt-4 flex gap-6 text-white/50">
          <span className="material-symbols-outlined">thumb_up</span>
          <span className="material-symbols-outlined">thumb_down</span>
          <span className="material-symbols-outlined">chat</span>
          <span className="material-symbols-outlined">share</span>
        </div>
      </div>
    </div>
  );
}
