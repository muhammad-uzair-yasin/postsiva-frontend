"use client";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { PreviewIdentityProps } from "../_types/postSchedulerPreviewIdentity";
import { SocialPlatformIcon } from "@/lib/social/SocialPlatformIcon";
import { PostSchedulerPreviewFormattedBody } from "./PostSchedulerPreviewFormattedBody";
import { PostSchedulerPreviewMediaBlock } from "./PostSchedulerPreviewMediaBlock";
import { PREVIEW_SINGLE_IMAGE_CENTERED } from "./postSchedulerPreviewMediaClasses";

const PREVIEW_MEDIA_FILL_IMAGE =
  "h-full w-full min-h-0 object-cover object-center";

export function PostSchedulerFacebookPreviewMockup({
  displayName,
  avatarUrl,
  bodyText,
  attachedMedia = [],
  imageGenerationShimmer = false,
  onRemoveMedia,
  onMoveMedia,
  fillAvailableHeight = false,
}: PreviewIdentityProps): React.ReactElement {
  const { t } = useTranslations();
  const name = displayName ?? t("postScheduler.previewMockups.postsiva");

  const mediaClassName = fillAvailableHeight
    ? "mt-4 aspect-video min-h-[320px] flex-1 w-full overflow-hidden rounded-xl bg-[#18191a]"
    : "mt-4 aspect-video min-h-[320px] w-full overflow-hidden rounded-xl";

  const emptyMediaPlaceholder = fillAvailableHeight ? (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[#3a3b3c] text-on-surface-variant">
      <span className="material-symbols-outlined text-[3.25rem] text-white/35">
        hide_image
      </span>
    </div>
  ) : undefined;

  return (
    <div
      className={`w-full max-w-lg overflow-hidden rounded-2xl border border-outline-variant/10 bg-surface-container-lowest ${
        fillAvailableHeight ? "flex h-full max-h-full min-h-0 flex-col" : ""
      }`}
    >
      <div
        className={`p-5 ${fillAvailableHeight ? "flex min-h-0 flex-1 flex-col" : ""}`}
      >
        <div className="flex shrink-0 items-start gap-3">
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-[#1877F2]">
            {avatarUrl ? (
              <img alt="" className="h-full w-full object-cover" src={avatarUrl} />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-surface-container-lowest/10">
                <SocialPlatformIcon platform="facebook" className="h-6 w-6" alt="" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-base font-bold text-on-surface">{name}</div>
            <div className="text-sm text-on-surface-variant">
              {t("postScheduler.previewMockups.justNowGlobe")}
            </div>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant">
            more_horiz
          </span>
        </div>
        <PostSchedulerPreviewFormattedBody
          text={bodyText}
          className="mt-4 min-w-0 text-sm font-body leading-relaxed text-on-surface whitespace-pre-wrap break-words"
          highlightClassName="font-medium text-[#1877F2]"
          moreLinkClassName="text-xs font-semibold text-[#1877F2] hover:underline"
          lessLinkClassName="text-xs font-semibold text-[#1877F2] hover:underline"
        />
        <PostSchedulerPreviewMediaBlock
          attachedMedia={attachedMedia}
          className={mediaClassName}
          singleImageImgClassName={
            fillAvailableHeight ? PREVIEW_MEDIA_FILL_IMAGE : PREVIEW_SINGLE_IMAGE_CENTERED
          }
          placeholder={emptyMediaPlaceholder}
          imageGenerationShimmer={imageGenerationShimmer}
          onRemoveMedia={onRemoveMedia}
          onMoveMedia={onMoveMedia}
        />
        <div className="mt-5 flex shrink-0 justify-between border-t border-outline-variant/10 pt-4 text-sm text-on-surface-variant">
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xl">thumb_up</span>
            {t("postScheduler.previewMockups.like")}
          </span>
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xl">chat_bubble</span>
            {t("postScheduler.previewMockups.comment")}
          </span>
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xl">share</span>
            {t("postScheduler.previewMockups.share")}
          </span>
        </div>
      </div>
    </div>
  );
}
