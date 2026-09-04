"use client";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { PreviewIdentityProps } from "../_types/postSchedulerPreviewIdentity";
import { SocialPlatformIcon } from "@/lib/social/SocialPlatformIcon";
import { PostSchedulerPreviewFormattedBody } from "./PostSchedulerPreviewFormattedBody";
import { PostSchedulerPreviewMediaBlock } from "./PostSchedulerPreviewMediaBlock";

function xHandleFromDisplayName(name: string, fallback: string): string {
  const slug = name.replace(/\s+/g, "").toLowerCase();
  return slug.length > 0 ? `@${slug}` : fallback;
}

export function PostSchedulerXPreviewMockup({
  displayName,
  avatarUrl,
  bodyText,
  attachedMedia = [],
  imageGenerationShimmer = false,
  onRemoveMedia,
  onMoveMedia,
}: PreviewIdentityProps): React.ReactElement {
  const { t } = useTranslations();
  const name = displayName ?? t("postScheduler.previewMockups.postsiva");
  const handle = xHandleFromDisplayName(
    name,
    t("postScheduler.previewMockups.channelHandle"),
  );

  return (
    <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-outline-variant/10 bg-black">
      <div className="p-5">
        <div className="flex gap-3">
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-surface-container">
            {avatarUrl ? (
              <img alt="" className="h-full w-full object-cover" src={avatarUrl} />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <SocialPlatformIcon platform="x" className="h-6 w-6" alt="" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-1">
              <span className="text-base font-bold text-white">{name}</span>
              <span className="text-sm text-gray-500">
                {handle}
                {t("postScheduler.previewMockups.dotNow")}
              </span>
            </div>
            <PostSchedulerPreviewFormattedBody
              text={bodyText}
              className="mb-4 text-sm font-body leading-relaxed text-white whitespace-pre-wrap break-words"
              highlightClassName="font-medium text-[#1d9bf0]"
              placeholderClassName="text-white/45"
            />
            <PostSchedulerPreviewMediaBlock
              attachedMedia={attachedMedia}
              className="aspect-video min-h-[200px] w-full overflow-hidden rounded-xl border border-white/10"
              imageGenerationShimmer={imageGenerationShimmer}
              onRemoveMedia={onRemoveMedia}
          onMoveMedia={onMoveMedia}
            />
            <div className="mt-4 flex gap-8 text-gray-500">
              <span className="material-symbols-outlined text-xl">chat_bubble</span>
              <span className="material-symbols-outlined text-xl">repeat</span>
              <span className="material-symbols-outlined text-xl">favorite</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
