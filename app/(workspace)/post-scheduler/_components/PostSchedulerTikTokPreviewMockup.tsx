"use client";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { PreviewIdentityProps } from "../_types/postSchedulerPreviewIdentity";
import { SocialPlatformIcon } from "@/lib/social/SocialPlatformIcon";
import { PostSchedulerPreviewFormattedBody } from "./PostSchedulerPreviewFormattedBody";
import { PostSchedulerPreviewMediaBlock } from "./PostSchedulerPreviewMediaBlock";

export function PostSchedulerTikTokPreviewMockup({
  displayName,
  avatarUrl,
  bodyText,
  tiktokTitle,
  attachedMedia = [],
  imageGenerationShimmer = false,
  onRemoveMedia,
  onMoveMedia,
}: PreviewIdentityProps): React.ReactElement {
  const { t } = useTranslations();
  const name = displayName ?? t("postScheduler.previewMockups.tiktokChannel");
  const titleLine = (tiktokTitle ?? "").trim();

  return (
    <div className="relative w-full max-w-[280px] overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
      <div className="relative aspect-[9/16] bg-zinc-900">
        <PostSchedulerPreviewMediaBlock
          attachedMedia={attachedMedia}
          className="absolute inset-0"
          imageGenerationShimmer={imageGenerationShimmer}
          onRemoveMedia={onRemoveMedia}
          onMoveMedia={onMoveMedia}
          placeholder={
            <span className="material-symbols-outlined text-7xl text-white/15">
              play_circle
            </span>
          }
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 pt-12">
          <div className="flex items-end gap-2">
            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white/20 bg-white/10">
              {avatarUrl ? (
                <img alt="" className="h-full w-full object-cover" src={avatarUrl} />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <SocialPlatformIcon platform="tiktok" className="h-5 w-5" alt="" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1 pb-1">
              <p className="truncate text-sm font-bold text-white">@{name}</p>
              {titleLine ? (
                <p className="mb-0.5 line-clamp-2 text-xs font-semibold leading-snug text-white">
                  {titleLine}
                </p>
              ) : null}
              <PostSchedulerPreviewFormattedBody
                text={bodyText}
                className="line-clamp-3 text-xs font-body leading-snug text-white/90 whitespace-pre-wrap break-words"
                highlightClassName="font-semibold text-cyan-300"
                placeholderClassName="text-white/40"
              />
            </div>
          </div>
        </div>
        <div className="absolute bottom-24 right-2 flex flex-col items-center gap-4 text-white">
          <span className="material-symbols-outlined text-3xl">favorite</span>
          <span className="material-symbols-outlined text-3xl">chat_bubble</span>
          <span className="material-symbols-outlined text-3xl">share</span>
        </div>
      </div>
    </div>
  );
}
