"use client";

import { SocialPlatformIcon } from "@/lib/social/SocialPlatformIcon";
import type { SocialPlatformIconId } from "@/lib/social/socialPlatformIconSrc";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import type { PreviewIdentityProps } from "../_types/postSchedulerPreviewIdentity";
import { PostSchedulerPreviewFormattedBody } from "./PostSchedulerPreviewFormattedBody";
import { PostSchedulerPreviewMediaBlock } from "./PostSchedulerPreviewMediaBlock";
import { PostSchedulerFacebookLinkPreviewCard } from "./PostSchedulerFacebookLinkPreviewCard";
import { PREVIEW_SINGLE_IMAGE_CENTERED } from "./postSchedulerPreviewMediaClasses";

const PREVIEW_MEDIA_FILL_IMAGE =
  "h-full w-full min-h-0 object-cover object-center";

const HIGHLIGHT_CLASS: Partial<Record<SocialPlatformIconId, string>> = {
  facebook: "font-medium text-[#1877F2]",
  linkedin: "font-medium text-[#70b5f9]",
  instagram: "font-medium text-[#E1306C]",
  pinterest: "font-semibold text-[#e60023]",
  x: "font-medium text-[#1d9bf0]",
  tiktok: "font-medium text-[#fe2c55]",
  youtube: "font-medium text-[#ff0000]",
  threads: "font-medium text-on-surface",
  bluesky: "font-medium text-[#0085ff]",
  mastodon: "font-medium text-[#6364ff]",
  whatsapp: "font-medium text-[#25D366]",
  wordpress: "font-medium text-secondary",
};

const LINK_CLASS: Partial<Record<SocialPlatformIconId, string>> = {
  facebook: "text-xs font-semibold text-[#1877F2] hover:underline",
  linkedin: "text-xs font-semibold text-[#70b5f9] hover:underline",
  instagram: "text-xs font-semibold text-[#E1306C] hover:underline",
  pinterest: "text-xs font-semibold text-[#e60023] hover:underline",
  x: "text-xs font-semibold text-[#1d9bf0] hover:underline",
  tiktok: "text-xs font-semibold text-[#fe2c55] hover:underline",
  youtube: "text-xs font-semibold text-[#ff0000] hover:underline",
  threads: "text-xs font-semibold text-secondary hover:underline",
  bluesky: "text-xs font-semibold text-[#0085ff] hover:underline",
  mastodon: "text-xs font-semibold text-[#6364ff] hover:underline",
  whatsapp: "text-xs font-semibold text-[#25D366] hover:underline",
  wordpress: "text-xs font-semibold text-secondary hover:underline",
};

const AVATAR_RING: Partial<Record<SocialPlatformIconId, string>> = {
  facebook: "bg-[#1877F2]",
  linkedin: "bg-[#0a66c2]",
  instagram: "bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af]",
  pinterest: "bg-[#e60023]",
  x: "bg-black",
  tiktok: "bg-black",
  youtube: "bg-[#ff0000]",
  threads: "bg-black",
  bluesky: "bg-[#0085ff]",
  mastodon: "bg-[#6364ff]",
  whatsapp: "bg-[#25D366]",
};

export function PostSchedulerFeedStylePreviewMockup({
  platform,
  displayName,
  avatarUrl,
  linkedinShowFirstDegree = false,
  bodyText,
  pinterestTitle,
  tiktokTitle,
  attachedMedia = [],
  imageGenerationShimmer = false,
  onRemoveMedia,
  onMoveMedia,
  fillAvailableHeight = false,
  facebookLinkPreview = null,
  mediaAspectRatio = null,
}: PreviewIdentityProps & { readonly platform: SocialPlatformIconId }): React.ReactElement {
  const { t } = useTranslations();
  const name = displayName ?? t("postScheduler.previewMockups.postsiva");
  const highlight = HIGHLIGHT_CLASS[platform] ?? "font-medium text-secondary";
  const moreLink = LINK_CLASS[platform] ?? "text-xs font-semibold text-secondary hover:underline";
  const avatarRing = AVATAR_RING[platform] ?? "bg-surface-container-high";

  const extraTitle = (pinterestTitle ?? tiktokTitle ?? "").trim();

  const showFacebookLinkCard =
    platform === "facebook" && facebookLinkPreview != null;

  const mediaFrameStyle = mediaAspectRatio?.trim()
    ? ({ aspectRatio: mediaAspectRatio.trim() } as const)
    : undefined;
  const mediaAspectClass = mediaAspectRatio?.trim() ? "" : "aspect-video";

  const mediaClassName = fillAvailableHeight
    ? `mt-4 ${mediaAspectClass} min-h-[320px] flex-1 w-full overflow-hidden rounded-xl bg-surface-container-high`
    : `mt-4 ${mediaAspectClass} min-h-[320px] w-full overflow-hidden rounded-xl`;

  const emptyMediaPlaceholder = fillAvailableHeight ? (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-surface-container-high">
      <span className="material-symbols-outlined text-[3.25rem] text-on-surface-variant/35">
        hide_image
      </span>
    </div>
  ) : undefined;

  const bodyPlaceholder =
    showFacebookLinkCard && !(bodyText ?? "").trim()
      ? ""
      : undefined;

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
          <div
            className={`h-11 w-11 shrink-0 overflow-hidden rounded-full ${avatarRing}`}
          >
            {avatarUrl ? (
              <img alt="" className="h-full w-full object-cover" src={avatarUrl} />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-surface-container-lowest/10">
                <SocialPlatformIcon platform={platform} className="h-6 w-6" alt="" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-base font-bold text-on-surface">
              {name}
              {platform === "linkedin" && linkedinShowFirstDegree ? (
                <span className="font-normal text-on-surface-variant">
                  {" "}
                  · 1st
                </span>
              ) : null}
            </div>
            <div className="text-sm text-on-surface-variant">
              {t("postScheduler.previewMockups.justNowGlobe")}
            </div>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant">
            more_horiz
          </span>
        </div>
        {extraTitle ? (
          <p className="mt-4 shrink-0 text-sm font-bold leading-snug text-on-surface">
            {extraTitle}
          </p>
        ) : null}
        {bodyPlaceholder !== "" ? (
          <PostSchedulerPreviewFormattedBody
            text={bodyText}
            placeholder={bodyPlaceholder}
            className={`${extraTitle ? "mt-2" : "mt-4"} min-w-0 shrink-0 text-sm font-body leading-relaxed text-on-surface whitespace-pre-wrap break-words`}
            highlightClassName={moreLink}
            boldClassName="font-bold text-on-surface"
            moreLinkClassName={moreLink}
            lessLinkClassName={moreLink}
          />
        ) : null}
        {showFacebookLinkCard ? (
          <div
            className={
              fillAvailableHeight
                ? "mt-4 flex min-h-0 min-w-0 flex-1 flex-col"
                : "min-w-0"
            }
          >
            <PostSchedulerFacebookLinkPreviewCard
              fillImageArea={fillAvailableHeight}
            preview={
              facebookLinkPreview.loading || facebookLinkPreview.error
                ? null
                : {
                    url: facebookLinkPreview.url,
                    title: facebookLinkPreview.title,
                    description: facebookLinkPreview.description,
                    image_url: facebookLinkPreview.imageUrl,
                    site_name: facebookLinkPreview.siteName,
                    engagement_summary: facebookLinkPreview.engagementSummary,
                  }
            }
            loading={facebookLinkPreview.loading}
            error={facebookLinkPreview.error}
            fallbackUrl={facebookLinkPreview.url}
            publishBlockMessage={facebookLinkPreview.publishBlockMessage}
          />
          </div>
        ) : (
          <PostSchedulerPreviewMediaBlock
            attachedMedia={attachedMedia}
            className={mediaClassName}
            style={mediaFrameStyle}
            singleImageImgClassName={
              fillAvailableHeight ? PREVIEW_MEDIA_FILL_IMAGE : PREVIEW_SINGLE_IMAGE_CENTERED
            }
            placeholder={emptyMediaPlaceholder}
            imageGenerationShimmer={imageGenerationShimmer}
            onRemoveMedia={onRemoveMedia}
            onMoveMedia={onMoveMedia}
          />
        )}
        <div
          className={`flex shrink-0 justify-between border-t border-outline-variant/10 pt-4 text-sm text-on-surface-variant ${
            fillAvailableHeight
              ? "mt-auto pb-1"
              : showFacebookLinkCard
                ? "mt-4"
                : "mt-5"
          }`}
        >
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
