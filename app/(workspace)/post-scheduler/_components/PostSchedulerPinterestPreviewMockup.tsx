"use client";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { PreviewIdentityProps } from "../_types/postSchedulerPreviewIdentity";
import { SocialPlatformIcon } from "@/lib/social/SocialPlatformIcon";
import { PostSchedulerPreviewFormattedBody } from "./PostSchedulerPreviewFormattedBody";
import { PostSchedulerPreviewMediaBlock } from "./PostSchedulerPreviewMediaBlock";

export function PostSchedulerPinterestPreviewMockup({
  displayName,
  avatarUrl,
  bodyText,
  pinterestTitle,
  attachedMedia = [],
  imageGenerationShimmer = false,
  onRemoveMedia,
  onMoveMedia,
}: PreviewIdentityProps): React.ReactElement {
  const { t } = useTranslations();
  const name = displayName ?? t("postScheduler.previewMockups.yourBoard");
  const title = (pinterestTitle ?? "").trim();

  return (
    <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-[#e60023]/20 bg-[#f1f1f1] shadow-xl dark:bg-[#1e1e1e]">
      <PostSchedulerPreviewMediaBlock
        attachedMedia={attachedMedia}
        className="aspect-[4/5] w-full overflow-hidden bg-[#e9e9e9] dark:bg-zinc-800"
        imageGenerationShimmer={imageGenerationShimmer}
        onRemoveMedia={onRemoveMedia}
          onMoveMedia={onMoveMedia}
        placeholder={
          <span className="material-symbols-outlined text-7xl text-[#e60023]/20">
            push_pin
          </span>
        }
      />
      <div className="space-y-2 p-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[#e60023]/15">
            {avatarUrl ? (
              <img alt="" className="h-full w-full object-cover" src={avatarUrl} />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <SocialPlatformIcon platform="pinterest" className="h-5 w-5" alt="" />
              </div>
            )}
          </div>
          <span className="truncate text-sm font-bold text-[#111] dark:text-white">
            {name}
          </span>
        </div>
        <p className="line-clamp-2 text-base font-extrabold leading-snug text-[#111] dark:text-white">
          {title || t("postScheduler.previewMockups.pinTitle")}
        </p>
        <PostSchedulerPreviewFormattedBody
          text={bodyText}
          className="text-sm font-body leading-snug text-[#111] dark:text-gray-200 whitespace-pre-wrap break-words"
          highlightClassName="font-semibold text-[#e60023]"
          placeholderClassName="text-[#111]/50 dark:text-gray-500"
        />
        <div className="flex items-center justify-between pt-1">
          <span className="rounded-full bg-[#e60023] px-4 py-2 text-xs font-bold text-white">
            {t("postScheduler.previewMockups.save")}
          </span>
          <span className="material-symbols-outlined text-[#111] dark:text-white">
            ios_share
          </span>
        </div>
      </div>
    </div>
  );
}
