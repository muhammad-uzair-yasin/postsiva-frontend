"use client";

import { useCallback, useMemo, useRef, useState, type ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { markComposerClearOnClose } from "@/lib/post-composer/composerClearOnClose";
import {
  describeVideoDurationViolationsForSelectedAccounts,
  videoDurationFromMedia,
  videoFileSizeFromMedia,
} from "@/lib/post-composer/composerVideoDurationLimits";
import { usePostSchedulerComposerActionsBusy } from "../_context/PostSchedulerComposerActionsBusyContext";
import { useComposerSessionCacheActions } from "../_context/PostSchedulerComposerSessionCacheProvider";
import { usePostSchedulerComposerDraft } from "../_context/PostSchedulerComposerDraftContext";
import { usePostSchedulerComposerChannels } from "../_context/PostSchedulerComposerChannelsContext";
import { usePostSchedulerUnifiedPost } from "../_hooks/usePostSchedulerUnifiedPost";
import { useFacebookLinkOpenGraphPreview } from "../_hooks/useFacebookLinkOpenGraphPreview";
import { facebookLinkPublishBlockDisplayMessage } from "@/lib/social/facebookLinkPostPublishBlockMessage";
import { buildWordPressComposerFields } from "@/lib/post-composer/wordpressComposerFields";
import { usePrepareWordPressTermsForPublish } from "../_hooks/usePrepareWordPressTermsForPublish";
import { PostSchedulerAiAlertModal } from "./PostSchedulerAiAlertModal";
import { PostSchedulerPublishConfirmModal } from "./PostSchedulerPublishConfirmModal";
import { PostSchedulerPublishOverlay } from "./PostSchedulerPublishOverlay";

type PublishSectionVariant = "default" | "embedded" | "bar";

/** When set, the primary button schedules at the picked time instead of publishing now. */
export interface PostSchedulerSchedulePrimaryProps {
  readonly onSchedule: () => void;
  readonly scheduling: boolean;
}

function errorMarginClass(variant: PublishSectionVariant): string {
  if (variant === "embedded" || variant === "bar") {
    return "mb-2";
  }
  return "mb-3";
}

function buttonClass(variant: PublishSectionVariant, largeBar: boolean): string {
  if (variant === "bar") {
    if (largeBar) {
      return "flex min-h-14 w-full min-w-[11rem] items-center justify-center gap-2.5 rounded-2xl bg-secondary-container px-8 text-base font-bold text-on-secondary-container shadow-[0_6px_24px_-8px_rgba(1,175,148,0.35)] transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-[3.75rem] sm:min-w-[13rem] sm:text-lg";
    }
    return "flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-secondary-container px-4 text-sm font-bold text-on-secondary-container shadow-[0_6px_24px_-8px_rgba(1,175,148,0.35)] transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-12 sm:px-5 sm:text-base";
  }
  if (variant === "embedded") {
    return "flex w-full min-h-[3rem] items-center justify-center gap-1.5 rounded-xl bg-secondary-container px-2 text-xs font-bold text-on-secondary-container shadow-[0_6px_24px_-8px_rgba(1,175,148,0.35)] transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:text-[11px]";
  }
  return "flex w-full items-center justify-center gap-2 rounded-lg bg-secondary-container py-2.5 text-sm font-bold text-on-secondary-container shadow-[0_4px_20px_rgba(1,175,148,0.25)] transition-all hover:scale-[1.01] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50";
}

function buttonLabel(
  isPosting: boolean,
  variant: PublishSectionVariant,
  schedulePrimary: PostSchedulerSchedulePrimaryProps | undefined,
  t: (key: string) => string,
): string {
  if (schedulePrimary) {
    return schedulePrimary.scheduling ? t("composer.scheduling") : t("composer.schedule");
  }
  if (isPosting) {
    return t("composer.publishing");
  }
  if (variant === "default") {
    return t("composer.publishNow");
  }
  return t("composer.publish");
}

/** Publish Now + validation alerts + confirm + publishing overlay (unified POST /unified/post/*). */
export function PostSchedulerPublishNowSection({
  variant = "default",
  largeBar = false,
  schedulePrimary,
}: {
  variant?: PublishSectionVariant;
  largeBar?: boolean;
  schedulePrimary?: PostSchedulerSchedulePrimaryProps;
}): ReactElement | null {
  const { t } = useTranslations();
  const { composerSessionFingerprint } = useComposerSessionCacheActions();
  const fingerprintRef = useRef(composerSessionFingerprint);
  fingerprintRef.current = composerSessionFingerprint;
  const [blockingAlert, setBlockingAlert] = useState<{
    title: string;
    message: string;
  } | null>(null);

  const {
    selectedIds,
    selectedAccounts,
    isLoadingProfiles,
    profilesError,
  } = usePostSchedulerComposerChannels();
  const {
    draftScope,
    contentMode,
    unifiedBody,
    unifiedMedia,
    perChannelDrafts,
    youtubeVideoTitle,
    youtubePlaylistId,
    youtubeThumbnailMediaId,
    youtubeGenerateThumbnail,
    youtubeMadeForKids,
    linkedinThumbnailMediaId,
    linkedinGenerateThumbnail,
    pinterestPinTitle,
    tiktokPhotoTitle,
    wordpressTitle,
    wordpressSlug,
    wordpressContent,
    wordpressExcerpt,
    wordpressCategories,
    wordpressTags,
    wordpressSuggestedCategoryNames,
    wordpressSuggestedTagNames,
    wordpressRecommendedImages,
    postFormat,
    facebookLinkUrl,
  } = usePostSchedulerComposerDraft();

  const onBlockingMessage = useCallback((title: string, message: string) => {
    setBlockingAlert({ title, message });
  }, []);

  const prepareWordpressFields = usePrepareWordPressTermsForPublish();

  const sidebarActionsBusy = usePostSchedulerComposerActionsBusy();

  const mediaForVideoLimits =
    draftScope === "per_channel" && selectedIds.length === 1
      ? (perChannelDrafts[selectedIds[0] ?? ""]?.media ?? unifiedMedia)
      : unifiedMedia;
  const videoLimitError = useMemo(() => {
    if (!mediaForVideoLimits.some((m) => m.mediaType === "video")) {
      return null;
    }
    if (selectedAccounts.length === 0) {
      return null;
    }
    return describeVideoDurationViolationsForSelectedAccounts({
      accounts: selectedAccounts,
      durationSeconds: videoDurationFromMedia(mediaForVideoLimits),
      fileSizeBytes: videoFileSizeFromMedia(mediaForVideoLimits),
      postFormat,
    });
  }, [mediaForVideoLimits, selectedAccounts, postFormat]);

  const postNowDisabled =
    selectedIds.length === 0 ||
    Boolean(profilesError) ||
    isLoadingProfiles ||
    Boolean(videoLimitError);

  const linkOg = useFacebookLinkOpenGraphPreview(
    postFormat === "link" ? facebookLinkUrl : "",
  );
  const facebookLinkPublishBlockMessage = facebookLinkPublishBlockDisplayMessage(
    linkOg.publishBlockReason,
    (key) => t(key),
  );

  const schedulePrimaryActive = schedulePrimary !== undefined;

  const youtubePlaylistForJob = youtubePlaylistId.trim()
    ? youtubePlaylistId.trim()
    : null;
  const youtubeThumbForJob = youtubeThumbnailMediaId?.trim()
    ? youtubeThumbnailMediaId.trim()
    : null;
  const linkedinThumbForJob = linkedinThumbnailMediaId?.trim()
    ? linkedinThumbnailMediaId.trim()
    : null;

  const {
    isPosting,
    confirmVisible,
    requestPost,
    cancelConfirm,
    confirmAndExecutePost,
    publishOverlay,
    dismissPublishOverlay,
  } = usePostSchedulerUnifiedPost({
    postTargetIds: selectedIds,
    accounts: selectedAccounts,
    postNowDisabled,
    draftScope,
    contentMode,
    unifiedBody,
    unifiedMedia,
    perChannelDrafts,
    youtubeTitle: youtubeVideoTitle.trim() ? youtubeVideoTitle.trim() : null,
    youtubePlaylistId: youtubePlaylistForJob,
    youtubeThumbnailMediaId: youtubeThumbForJob,
    youtubeGenerateThumbnail,
    youtubeMadeForKids,
    linkedinThumbnailMediaId: linkedinThumbForJob,
    linkedinGenerateThumbnail,
    pinterestTitle: pinterestPinTitle.trim() ? pinterestPinTitle.trim() : null,
    tiktokTitle: tiktokPhotoTitle.trim() ? tiktokPhotoTitle.trim() : null,
    wordpress:
      contentMode === "blog" && postFormat !== "link"
        ? buildWordPressComposerFields({
            title: wordpressTitle,
            slug: wordpressSlug,
            content: wordpressContent,
            excerpt: wordpressExcerpt,
            categories: wordpressCategories,
            tags: wordpressTags,
            suggestedCategoryNames: wordpressSuggestedCategoryNames,
            suggestedTagNames: wordpressSuggestedTagNames,
            recommendedImages: wordpressRecommendedImages,
            attachedMedia:
              draftScope === "per_channel"
                ? (perChannelDrafts[selectedIds[0] ?? ""]?.media ?? unifiedMedia)
                : unifiedMedia,
          })
        : null,
    prepareWordpressFields:
      contentMode === "blog" && postFormat !== "link"
        ? prepareWordpressFields
        : undefined,
    postFormat,
    facebookLinkUrl,
    facebookLinkPublishBlockMessage,
    onBlockingMessage,
    onPublishFullySucceeded: () => {
      markComposerClearOnClose(fingerprintRef.current);
    },
  });

  return (
    <>
      {profilesError ? (
        <p
          className={`rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-on-surface ${errorMarginClass(variant)}`}
        >
          {profilesError}
        </p>
      ) : null}
      {videoLimitError ? (
        <p
          className={`rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-on-surface ${errorMarginClass(variant)}`}
        >
          {videoLimitError}
        </p>
      ) : null}
      <button
        type="button"
        disabled={
          isLoadingProfiles ||
          sidebarActionsBusy ||
          Boolean(videoLimitError) ||
          (schedulePrimaryActive
            ? schedulePrimary.scheduling
            : isPosting)
        }
        onClick={() => {
          if (schedulePrimaryActive) {
            schedulePrimary.onSchedule();
            return;
          }
          requestPost();
        }}
        className={buttonClass(variant, largeBar)}
        title={
          schedulePrimaryActive
            ? t("composer.scheduleThisPostTitle")
            : undefined
        }
      >
        <span
          className={`material-symbols-outlined ${variant === "bar" ? "text-xl" : "text-lg"}`}
        >
          {schedulePrimaryActive ? "schedule" : "publish"}
        </span>
        {buttonLabel(isPosting, variant, schedulePrimary, t)}
      </button>

      <PostSchedulerAiAlertModal
        visible={blockingAlert !== null}
        title={blockingAlert?.title ?? ""}
        message={blockingAlert?.message ?? ""}
        onClose={() => {
          setBlockingAlert(null);
        }}
      />

      <PostSchedulerPublishConfirmModal
        visible={confirmVisible}
        channelCount={selectedIds.length}
        targets={selectedAccounts.map((a) => ({
          displayName: a.displayName,
          platform: a.platform,
        }))}
        onCancel={cancelConfirm}
        onConfirm={() => {
          void confirmAndExecutePost();
        }}
      />

      <PostSchedulerPublishOverlay
        overlay={publishOverlay}
        onDismiss={dismissPublishOverlay}
      />
    </>
  );
}
