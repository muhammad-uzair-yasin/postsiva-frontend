"use client";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { PreviewIdentityProps } from "../_types/postSchedulerPreviewIdentity";
import { SocialPlatformIcon } from "@/lib/social/SocialPlatformIcon";
import { PostSchedulerPreviewFormattedBody } from "./PostSchedulerPreviewFormattedBody";
import { PostSchedulerPreviewMediaBlock } from "./PostSchedulerPreviewMediaBlock";

export function PostSchedulerThreadsPreviewMockup({
  displayName,
  avatarUrl,
  bodyText,
  attachedMedia = [],
  imageGenerationShimmer = false,
  onRemoveMedia,
  onMoveMedia,
}: PreviewIdentityProps): React.ReactElement {
  const { t } = useTranslations();
  const name = displayName ?? t("postScheduler.previewMockups.threadsUser");

  return (
    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-outline-variant/15 bg-black text-white">
      <div className="flex gap-3 p-4">
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-zinc-800">
          {avatarUrl ? (
            <img alt="" className="h-full w-full object-cover" src={avatarUrl} />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <SocialPlatformIcon platform="threads" className="h-5 w-5" alt="" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold">{name}</span>
            <span className="text-xs text-zinc-500">
              {t("postScheduler.previewMockups.hoursAgo")}
            </span>
          </div>
          <PostSchedulerPreviewFormattedBody
            text={bodyText}
            className="mt-2 text-[15px] font-body leading-relaxed text-zinc-100 whitespace-pre-wrap break-words"
            highlightClassName="font-medium text-fuchsia-400"
            placeholderClassName="text-zinc-500"
          />
          <PostSchedulerPreviewMediaBlock
            attachedMedia={attachedMedia}
            className="mt-4 aspect-[4/5] max-h-64 w-full overflow-hidden rounded-xl border border-white/10 bg-zinc-900"
            imageGenerationShimmer={imageGenerationShimmer}
            onRemoveMedia={onRemoveMedia}
          onMoveMedia={onMoveMedia}
            placeholder={
              <span className="material-symbols-outlined text-5xl text-zinc-600">
                image
              </span>
            }
          />
          <div className="mt-4 flex gap-6 text-zinc-500">
            <span className="material-symbols-outlined">favorite_border</span>
            <span className="material-symbols-outlined">chat_bubble_outline</span>
            <span className="material-symbols-outlined">repeat</span>
            <span className="material-symbols-outlined">send</span>
          </div>
        </div>
      </div>
    </div>
  );
}
