"use client";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { PreviewIdentityProps } from "../_types/postSchedulerPreviewIdentity";
import { SocialPlatformIcon } from "@/lib/social/SocialPlatformIcon";
import { PostSchedulerPreviewFormattedBody } from "./PostSchedulerPreviewFormattedBody";
import { PostSchedulerPreviewMediaBlock } from "./PostSchedulerPreviewMediaBlock";

export function PostSchedulerInstagramPreviewMockup({
  displayName,
  avatarUrl,
  bodyText,
  attachedMedia = [],
  imageGenerationShimmer = false,
  onRemoveMedia,
  onMoveMedia,
}: PreviewIdentityProps): React.ReactElement {
  const { t } = useTranslations();
  const name = displayName ?? t("postScheduler.previewMockups.postsivaApp");

  return (
    <div className="w-full max-w-md overflow-hidden rounded-3xl border border-outline-variant/10 bg-surface-container-lowest shadow-2xl">
      <div className="flex items-center gap-3 p-3">
        <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-[1.5px]">
          <div className="h-full w-full overflow-hidden rounded-full border border-surface-container-lowest bg-surface-container-lowest">
            {avatarUrl ? (
              <img alt="" className="h-full w-full object-cover" src={avatarUrl} />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <SocialPlatformIcon platform="instagram" className="h-5 w-5" alt="" />
              </div>
            )}
          </div>
        </div>
        <span className="text-sm font-bold text-on-surface">{name}</span>
        <span className="material-symbols-outlined ml-auto text-on-surface-variant">
          more_horiz
        </span>
      </div>
      <PostSchedulerPreviewMediaBlock
        attachedMedia={attachedMedia}
        className="aspect-square w-full"
        imageGenerationShimmer={imageGenerationShimmer}
        onRemoveMedia={onRemoveMedia}
          onMoveMedia={onMoveMedia}
      />
      <div className="space-y-3 p-4">
        <PostSchedulerPreviewFormattedBody
          text={bodyText}
          className="text-sm font-body leading-relaxed text-on-surface whitespace-pre-wrap break-words"
          highlightClassName="font-medium text-secondary"
          placeholderClassName="text-on-surface-variant/80"
        />
        <div className="flex gap-4 text-on-surface">
          <span className="material-symbols-outlined">favorite</span>
          <span className="material-symbols-outlined">chat_bubble</span>
          <span className="material-symbols-outlined">send</span>
          <span className="material-symbols-outlined ml-auto">bookmark</span>
        </div>
        <div className="h-2 w-24 rounded-full bg-surface-container-low" />
        <div className="space-y-2">
          <div className="h-2 w-full rounded-full bg-surface-container-low" />
          <div className="h-2 w-2/3 rounded-full bg-surface-container-low" />
        </div>
      </div>
    </div>
  );
}
