"use client";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { PreviewIdentityProps } from "../_types/postSchedulerPreviewIdentity";
import { SocialPlatformIcon } from "@/lib/social/SocialPlatformIcon";
import { PostSchedulerPreviewFormattedBody } from "./PostSchedulerPreviewFormattedBody";
import { PostSchedulerPreviewMediaBlock } from "./PostSchedulerPreviewMediaBlock";

export function PostSchedulerBlueskyPreviewMockup({
  displayName,
  avatarUrl,
  bodyText,
  attachedMedia = [],
  imageGenerationShimmer = false,
  onRemoveMedia,
  onMoveMedia,
}: PreviewIdentityProps): React.ReactElement {
  const { t } = useTranslations();
  const name = displayName ?? t("postScheduler.previewMockups.blueskyHandle");
  const shortHandle = name.includes(".")
    ? name.slice(0, Math.max(0, name.indexOf(".")))
    : name;

  return (
    <div className="w-full max-w-lg overflow-hidden rounded-xl border border-sky-500/25 bg-white shadow-md dark:border-sky-400/20 dark:bg-[#16181c]">
      <div className="border-b border-sky-500/10 bg-sky-500/5 px-4 py-2 dark:bg-sky-400/5">
        <span className="text-xs font-bold uppercase tracking-wide text-sky-700 dark:text-sky-300">
          {t("postScheduler.previewMockups.following")}
        </span>
      </div>
      <div className="flex gap-3 p-4">
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-sky-500/10 ring-2 ring-sky-500/30">
          {avatarUrl ? (
            <img alt="" className="h-full w-full object-cover" src={avatarUrl} />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <SocialPlatformIcon platform="bluesky" className="h-6 w-6" alt="" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-[#0c131b] dark:text-white">{name}</div>
          <div className="text-xs text-sky-600/80 dark:text-sky-400/80">@{shortHandle}</div>
          <PostSchedulerPreviewFormattedBody
            text={bodyText}
            className="mt-2 text-sm font-body leading-relaxed text-[#0c131b] dark:text-gray-200 whitespace-pre-wrap break-words"
            highlightClassName="font-semibold text-sky-600 dark:text-sky-400"
            placeholderClassName="text-[#0c131b]/50 dark:text-gray-500"
          />
          <PostSchedulerPreviewMediaBlock
            attachedMedia={attachedMedia}
            className="mt-3 flex max-h-48 min-h-[120px] w-full items-center justify-center overflow-hidden rounded-lg border border-sky-500/10 bg-sky-500/5 dark:bg-sky-400/5"
            singleImageImgClassName="h-full w-full min-h-0 max-h-full object-contain object-center"
            multiImageImgClassName="h-full min-h-0 w-full object-contain bg-black/10 p-0.5"
            imageGenerationShimmer={imageGenerationShimmer}
            onRemoveMedia={onRemoveMedia}
          onMoveMedia={onMoveMedia}
            placeholder={
              <span className="material-symbols-outlined text-5xl text-sky-500/25">
                image
              </span>
            }
          />
          <div className="mt-3 flex gap-5 text-sky-700/70 dark:text-sky-300/70">
            <span className="material-symbols-outlined text-lg">chat_bubble</span>
            <span className="material-symbols-outlined text-lg">repeat</span>
            <span className="material-symbols-outlined text-lg">favorite</span>
          </div>
        </div>
      </div>
    </div>
  );
}
