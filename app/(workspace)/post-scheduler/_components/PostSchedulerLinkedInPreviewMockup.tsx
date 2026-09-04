"use client";

import type { ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { SocialPlatformIcon } from "@/lib/social/SocialPlatformIcon";
import { SOCIAL_PLATFORM_ICON_SRC } from "@/lib/social/socialPlatformIconSrc";
import type { PreviewIdentityProps } from "../_types/postSchedulerPreviewIdentity";
import { PostSchedulerPreviewFormattedBody } from "./PostSchedulerPreviewFormattedBody";
import { PostSchedulerPreviewMediaBlock } from "./PostSchedulerPreviewMediaBlock";

const LI_MUTED = "text-[#ffffffbf]";
const LI_SUBTLE = "text-[#ffffff99]";
const LI_LINK = "text-[#70b5f9] hover:text-[#70b5f9]";

function renderLinkedInAvatar(
  avatarUrl: string | undefined,
  fallbackIconClassName: string,
  brokenImageClassName: string,
): ReactElement {
  if (avatarUrl) {
    return (
      // Intentional image fallback swap for dead LinkedIn avatar URLs.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt=""
        className="h-full w-full object-cover"
        src={avatarUrl}
        onError={(event) => {
          const img = event.currentTarget;
          img.onerror = null;
          img.src = SOCIAL_PLATFORM_ICON_SRC.linkedin;
          img.className = brokenImageClassName;
        }}
      />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center">
      <SocialPlatformIcon
        platform="linkedin"
        className={fallbackIconClassName}
        alt=""
      />
    </div>
  );
}

export function PostSchedulerLinkedInPreviewMockup({
  displayName,
  avatarUrl,
  linkedinShowFirstDegree = false,
  bodyText,
  attachedMedia = [],
  imageGenerationShimmer = false,
  linkedinThumbnailUrl,
  linkedinGenerateThumbnail = false,
  onRemoveMedia,
  onMoveMedia,
}: PreviewIdentityProps): ReactElement {
  const { t } = useTranslations();
  const name = displayName ?? t("postScheduler.previewMockups.yourName");
  const videoOnly = attachedMedia.filter((item) => item.mediaType === "video");
  const documentOnly = attachedMedia.filter((item) => item.mediaType === "document");
  const hasVideo = videoOnly.length > 0;
  const hasDocument = documentOnly.length > 0;
  const hasThumb = Boolean((linkedinThumbnailUrl ?? "").trim());
  const actionLabels = [
    ["thumb_up", t("postScheduler.previewMockups.like")],
    ["chat_bubble_outline", t("postScheduler.previewMockups.comment")],
    ["repeat", t("postScheduler.previewMockups.repost")],
    ["send", t("postScheduler.previewMockups.send")],
  ] as const;

  return (
    <div className="w-full max-w-lg overflow-hidden rounded-lg border border-[#ffffff1f] bg-[#1d2226] text-left shadow-md">
      <header className="flex items-start justify-between gap-2 px-3 pt-3 pb-2">
        <div className="flex min-w-0 flex-1 gap-2">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[#38434f]">
            {renderLinkedInAvatar(
              avatarUrl,
              "h-7 w-7 object-contain",
              "h-full w-full object-contain p-1.5",
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-1 gap-y-0">
              <span className="truncate text-sm font-semibold text-white">{name}</span>
              {linkedinShowFirstDegree ? (
                <>
                  <span className={`text-sm ${LI_SUBTLE}`}>·</span>
                  <span className={`text-sm ${LI_SUBTLE}`}>
                    {t("postScheduler.previewMockups.firstDegree")}
                  </span>
                </>
              ) : null}
            </div>
            <div className={`mt-1 flex items-center gap-1 text-xs ${LI_SUBTLE}`}>
              <span>{t("postScheduler.previewMockups.now")}</span>
              <span aria-hidden>·</span>
              <span
                className="material-symbols-outlined text-[16px] leading-none text-[#ffffffb3]"
                aria-label={t("postScheduler.previewMockups.publicAria")}
              >
                public
              </span>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-0.5 text-[#ffffffb3]">
          <span className="material-symbols-outlined text-[22px]" aria-hidden>
            more_horiz
          </span>
          <span className="material-symbols-outlined text-[22px]" aria-hidden>
            close
          </span>
        </div>
      </header>

      <div className="px-3 pb-2">
        <PostSchedulerPreviewFormattedBody
          text={bodyText}
          className={`text-sm leading-snug ${LI_MUTED}`}
          highlightClassName={LI_LINK}
          boldClassName="font-bold text-white"
          maxPreviewChars={200}
          moreLinkText={t("postScheduler.previewMockups.more")}
          moreLinkClassName={`text-sm font-semibold ${LI_LINK} hover:underline`}
          lessLinkClassName={`text-xs font-semibold ${LI_LINK} hover:underline`}
        />
      </div>

      {hasVideo ? (
        <div className="grid grid-cols-1 gap-3 border-t border-[#ffffff1f] bg-[#00000020] p-3">
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-white/55">
              {t("postScheduler.preview.video")}
            </p>
            <PostSchedulerPreviewMediaBlock
              attachedMedia={videoOnly}
              className="min-h-[160px] w-full rounded-xl bg-[#00000040]"
              singleImageImgClassName="max-h-[min(420px,52vh)] w-full object-contain object-center"
              imageGenerationShimmer={imageGenerationShimmer}
              onRemoveMedia={onRemoveMedia}
          onMoveMedia={onMoveMedia}
            />
          </div>
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-white/55">
              {t("postScheduler.preview.thumbnail")}
            </p>
            <div className="relative aspect-video min-h-[140px] w-full overflow-hidden rounded-xl bg-white/5">
              {hasThumb ? (
                <>
                  {/* Intentional raw image in the mockup preview. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={linkedinThumbnailUrl ?? ""}
                    alt={t("postScheduler.preview.linkedinThumbnailAlt")}
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
                  <span className="material-symbols-outlined text-5xl text-white/30">
                    image
                  </span>
                </div>
              )}
              {linkedinGenerateThumbnail && !hasThumb ? (
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
      ) : hasDocument ? (
        <PostSchedulerPreviewMediaBlock
          attachedMedia={documentOnly}
          className="min-h-[200px] w-full border-t border-[#ffffff1f] bg-[#00000040]"
          imageGenerationShimmer={imageGenerationShimmer}
        />
      ) : (
        <PostSchedulerPreviewMediaBlock
          attachedMedia={attachedMedia}
          className="min-h-[200px] w-full border-t border-[#ffffff1f] bg-[#00000040]"
          singleImageImgClassName="max-h-[min(420px,52vh)] w-full object-contain object-center"
          imageGenerationShimmer={imageGenerationShimmer}
          onRemoveMedia={onRemoveMedia}
          onMoveMedia={onMoveMedia}
        />
      )}

      <div className="border-t border-[#ffffff1f] px-3 py-2">
        <div className={`flex flex-wrap items-center gap-1.5 text-xs ${LI_SUBTLE}`}>
          <span
            className="material-symbols-outlined text-[18px] text-[#378fe9]"
            aria-hidden
          >
            thumb_up
          </span>
          <span>
            <span className="font-semibold text-[#9cb3c9]">{name}</span>
            {t("postScheduler.previewMockups.andOthers")}
          </span>
        </div>
      </div>

      <div className="flex items-stretch border-t border-[#ffffff1f]">
        <div className="flex items-center gap-0.5 border-r border-[#ffffff1f] px-2 py-2">
          <div className="h-6 w-6 shrink-0 overflow-hidden rounded-full bg-[#38434f]">
            {renderLinkedInAvatar(
              avatarUrl,
              "h-4 w-4 object-contain",
              "h-full w-full object-contain p-0.5",
            )}
          </div>
          <span className={`material-symbols-outlined text-[18px] ${LI_SUBTLE}`} aria-hidden>
            expand_more
          </span>
        </div>
        <div className="grid min-w-0 flex-1 grid-cols-4 items-center py-1">
          {actionLabels.map(([icon, label]) => (
            <div
              key={label}
              className={`flex flex-col items-center gap-0.5 text-[11px] font-semibold ${LI_SUBTLE}`}
            >
              <span className="material-symbols-outlined text-[22px]">{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
