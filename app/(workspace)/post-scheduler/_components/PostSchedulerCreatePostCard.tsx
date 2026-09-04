"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import {
  describeTextLimitViolationsForSelectedAccounts,
  maxMainTextLengthForSelectedAccounts,
} from "@/lib/post-composer/composerMainTextCharLimits";
import {
  describeVideoDurationViolationsForSelectedAccounts,
  maxVideoDurationForSelectedAccounts,
  videoDurationFromMedia,
  videoFileSizeFromMedia,
} from "@/lib/post-composer/composerVideoDurationLimits";
import {
  selectionIncludesMetaShortForm,
  selectionIncludesFacebook,
  accountsUnsupportedForLinkPostFormat,
  formatLinkPostUnsupportedChannelsMessage,
  type ComposerPostFormat,
} from "@/lib/post-composer/composerPostFormat";
import { inferComposerPostKind } from "@/lib/post-composer/inferComposerPostKind";
import { validateYoutubeDescription, youtubeDescriptionBracketNotice } from "@/lib/post-composer/validateYoutubeDescription";
import type { UnifiedMediaUploadWebResult } from "@/lib/social/unifiedMediaUploadWeb";

import { usePostSchedulerComposerChannels } from "../_context/PostSchedulerComposerChannelsContext";
import { usePostSchedulerComposerDraft } from "../_context/PostSchedulerComposerDraftContext";
import { usePostSchedulerAiToolkit } from "../_context/PostSchedulerAiToolkitContext";
import { mergeAttachedMediaOnPick } from "../_utils/postSchedulerComposerMediaPick";
import { useProbeAttachedVideoDuration } from "../_hooks/useProbeAttachedVideoDuration";
import { usePostSchedulerAi } from "./PostSchedulerAiContext";
import { PostSchedulerChannelPicker } from "./PostSchedulerChannelPicker";
import { PostSchedulerCreatePostCardHeaderGated } from "./PostSchedulerCreatePostCardHeaderGated";
import { PostSchedulerCreatePostEditorArea } from "./PostSchedulerCreatePostEditorArea";
import { PostSchedulerComposerSetupCollapsible } from "./PostSchedulerComposerSetupCollapsible";
import { PostSchedulerDraftScopeToggle } from "./PostSchedulerDraftScopeToggle";
import { PostSchedulerPerChannelDraftStrip } from "./PostSchedulerPerChannelDraftStrip";
import { PostSchedulerPinterestTitleField } from "./PostSchedulerPinterestTitleField";
import { PostSchedulerPostFormatToggle } from "./PostSchedulerPostFormatToggle";
import { PostSchedulerFacebookLinkUrlField } from "./PostSchedulerFacebookLinkUrlField";
import { useFacebookLinkOpenGraphPreview } from "../_hooks/useFacebookLinkOpenGraphPreview";
import { facebookLinkPublishBlockDisplayMessage } from "@/lib/social/facebookLinkPostPublishBlockMessage";
import { PostSchedulerTikTokTitleField } from "./PostSchedulerTikTokTitleField";
import { useActiveWorkspaceYoutubePlaylists } from "../_hooks/useActiveWorkspaceYoutubePlaylists";
import { PostSchedulerYoutubeTitleField } from "./PostSchedulerYoutubeTitleField";
import { PostSchedulerYoutubeVideoExtras } from "./PostSchedulerYoutubeVideoExtras";
import { PostSchedulerLinkedinVideoExtras } from "./PostSchedulerLinkedinVideoExtras";
import { PostSchedulerWordPressFields } from "./PostSchedulerWordPressFields";
import {
  PostSchedulerWordPressMetaScroll,
  PostSchedulerWordPressRecommendedImagesAboveBody,
} from "./PostSchedulerWordPressMetaScroll";
import { usePostSchedulerComposerEditMode } from "../../content-manager/_context/PostSchedulerComposerEditModeContext";
import { usePostSchedulerComposerInModal } from "../_context/PostSchedulerComposerModalLayoutContext";
import { PostSchedulerAiAlertModal } from "./PostSchedulerAiAlertModal";
import dynamic from "next/dynamic";

const PostSchedulerWordPressBlogEditorPanel = dynamic(() =>
  import("./PostSchedulerWordPressBlogEditorPanel").then((m) => ({
    default: m.PostSchedulerWordPressBlogEditorPanel,
  })),
);

export function PostSchedulerCreatePostCard({
  onBodyAreaHeightChange,
}: {
  onBodyAreaHeightChange?: (height: number) => void;
} = {}): React.ReactElement {
  const { t } = useTranslations();
  const { active: editModeActive, hideChannelPicker } =
    usePostSchedulerComposerEditMode();
  const inModal = usePostSchedulerComposerInModal();
  const { toggleAiPanel, aiPanelOpen } = usePostSchedulerAi();
  const { selectedIds, selectedAccounts, removeAccountId } =
    usePostSchedulerComposerChannels();
  const isWordPressAccount = (account: {
    platform?: string | null;
    iconId?: string | null;
    id: string;
  }): boolean =>
    (account.platform === "wordpress" || account.iconId === "wordpress") &&
    account.id.startsWith("wordpress:");
  const wordpressConnectionId =
    selectedAccounts.find(isWordPressAccount)?.id.replace(/^wordpress:/, "") ?? null;
  const {
    draftScope,
    setDraftScope,
    contentMode,
    editorBody,
    setEditorBody,
    editorMedia,
    activeChannelId,
    setActiveChannelId,
    youtubeVideoTitle,
    setYoutubeVideoTitle,
    youtubePlaylistId,
    setYoutubePlaylistId,
    youtubeThumbnailMediaId,
    setYoutubeThumbnailMediaId,
    youtubeThumbnailPreviewUrl,
    setYoutubeThumbnailPreviewUrl,
    youtubeGenerateThumbnail,
    setYoutubeGenerateThumbnail,
    youtubeMadeForKids,
    setYoutubeMadeForKids,
    linkedinThumbnailMediaId,
    setLinkedinThumbnailMediaId,
    linkedinThumbnailPreviewUrl,
    setLinkedinThumbnailPreviewUrl,
    linkedinGenerateThumbnail,
    setLinkedinGenerateThumbnail,
    setMediaLibraryPickMode,
    pinterestPinTitle,
    setPinterestPinTitle,
    tiktokPhotoTitle,
    setTiktokPhotoTitle,
    wordpressTitle,
    setWordpressTitle,
    wordpressSlug,
    setWordpressSlug,
    wordpressExcerpt,
    setWordpressExcerpt,
    wordpressCategories,
    setWordpressCategories,
    wordpressTags,
    setWordpressTags,
    wordpressRecommendedImages,
    wordpressContent,
    setWordpressContent,
    setEditorMedia,
    postFormat,
    setPostFormat,
    facebookLinkUrl,
    setFacebookLinkUrl,
  } = usePostSchedulerComposerDraft();
  const linkOg = useFacebookLinkOpenGraphPreview(
    postFormat === "link" ? facebookLinkUrl : "",
  );
  const facebookLinkPublishBlockMessage = useMemo(
    () =>
      facebookLinkPublishBlockDisplayMessage(linkOg.publishBlockReason, (key) =>
        t(key),
      ),
    [linkOg.publishBlockReason, t],
  );
  const {
    isGeneratingIdeaDraft,
    isGeneratingImageToContent,
    isGeneratingVideoToContent,
    wordpressArticleGenerating,
  } = usePostSchedulerAiToolkit();
  const selectedYoutubeAccounts = selectedAccounts.filter(
    (account) => account.platform === "youtube",
  );
  const selectedYoutubeChannelId =
    selectedYoutubeAccounts.length === 1
      ? selectedYoutubeAccounts[0]?.targetResourceId?.trim() || null
      : null;
  const { playlists: youtubePlaylists } = useActiveWorkspaceYoutubePlaylists(
    selectedYoutubeChannelId,
  );
  const showWordPressFields = Boolean(wordpressConnectionId);
  const wordpressOnlyComposer =
    showWordPressFields &&
    selectedAccounts.length > 0 &&
    selectedAccounts.every(isWordPressAccount);

  const [linkFormatAlert, setLinkFormatAlert] = useState<{
    title: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    setYoutubePlaylistId("");
  }, [selectedYoutubeChannelId, setYoutubePlaylistId]);

  const showPostFormat =
    !editModeActive &&
    contentMode === "social" &&
    selectionIncludesMetaShortForm(selectedAccounts);
  const showLinkPostFormat = selectionIncludesFacebook(selectedAccounts);

  const onPostFormatChange = useCallback(
    (v: ComposerPostFormat) => {
      if (v === "link") {
        const unsupported = accountsUnsupportedForLinkPostFormat(selectedAccounts);
        if (unsupported.length > 0) {
          setLinkFormatAlert({
            title: t("postScheduler.composer.linkFormatUnsupportedTitle"),
            message: formatLinkPostUnsupportedChannelsMessage(unsupported),
          });
        }
      }
      setPostFormat(v);
    },
    [selectedAccounts, setPostFormat, t],
  );

  useEffect(() => {
    if (!showPostFormat && postFormat !== "standard") {
      setPostFormat("standard");
    }
  }, [showPostFormat, postFormat, setPostFormat]);

  useEffect(() => {
    if (showLinkPostFormat || postFormat !== "link") {
      return;
    }
    setPostFormat("standard");
  }, [showLinkPostFormat, postFormat, setPostFormat]);

  // Reels/Stories → Meta only (auto-deselect). Link → keep channels; user deselects after alert.
  useEffect(() => {
    if (postFormat !== "reel" && postFormat !== "story") {
      return;
    }
    for (const acc of selectedAccounts) {
      if (acc.platform !== "facebook" && acc.platform !== "instagram") {
        removeAccountId(acc.id);
      }
    }
  }, [postFormat, selectedAccounts, removeAccountId]);

  useEffect(() => {
    if (postFormat !== "link") {
      return;
    }
    if (editorMedia.length > 0) {
      setEditorMedia([]);
    }
  }, [postFormat, editorMedia.length, setEditorMedia]);

  useEffect(() => {
    if (postFormat !== "link") {
      return;
    }
    for (const acc of selectedAccounts) {
      if (acc.platform === "wordpress") {
        removeAccountId(acc.id);
      }
    }
  }, [postFormat, selectedAccounts, removeAccountId]);

  const maxBodyLength = useMemo(() => {
    if (draftScope === "per_channel") {
      const activeAccount =
        selectedAccounts.find((a) => a.id === activeChannelId) ??
        selectedAccounts[0];
      if (!activeAccount) {
        return undefined;
      }
      return maxMainTextLengthForSelectedAccounts([activeAccount]);
    }
    return maxMainTextLengthForSelectedAccounts(selectedAccounts);
  }, [draftScope, selectedAccounts, activeChannelId]);
  const bodyCount = editorBody.length;
  const countRatio =
    maxBodyLength && maxBodyLength > 0 ? bodyCount / maxBodyLength : 0;
  const counterClassName =
    maxBodyLength === undefined
      ? "bg-surface-container-high/90 text-on-surface-variant"
      : countRatio >= 1
        ? "bg-primary-container/90 text-on-primary-container ring-1 ring-primary/35"
        : countRatio >= 0.9
          ? "bg-secondary-container/90 text-on-secondary-container ring-1 ring-secondary/35"
          : "bg-surface-container-high/90 text-on-surface-variant";
  const inferredKind = useMemo(() => inferComposerPostKind(editorMedia), [editorMedia]);
  const unifiedTextLimitError = useMemo(() => {
    if (draftScope !== "all_channels") {
      return null;
    }
    if (!inferredKind.ok) {
      return null;
    }
    return describeTextLimitViolationsForSelectedAccounts({
      accounts: selectedAccounts,
      rawBody: editorBody,
    });
  }, [draftScope, inferredKind, selectedAccounts, editorBody]);

  useProbeAttachedVideoDuration(editorMedia, setEditorMedia);

  const attachedVideoDurationSeconds = videoDurationFromMedia(editorMedia);
  const attachedVideoFileSizeBytes = videoFileSizeFromMedia(editorMedia);
  const durationValidationAccounts = useMemo(() => {
    if (draftScope === "per_channel") {
      const activeAccount =
        selectedAccounts.find((a) => a.id === activeChannelId) ??
        selectedAccounts[0];
      return activeAccount ? [activeAccount] : [];
    }
    return selectedAccounts;
  }, [draftScope, selectedAccounts, activeChannelId]);
  const maxVideoDurationSeconds = useMemo(
    () => maxVideoDurationForSelectedAccounts(durationValidationAccounts, postFormat),
    [durationValidationAccounts, postFormat],
  );
  const showVideoDurationCounter =
    inferredKind.ok &&
    (inferredKind.kind === "video" ||
      postFormat === "reel" ||
      (postFormat === "story" && editorMedia.some((m) => m.mediaType === "video")));
  const videoDurationProbing =
    showVideoDurationCounter &&
    attachedVideoDurationSeconds == null &&
    editorMedia.some((m) => m.mediaType === "video");
  const unifiedVideoDurationError = useMemo(() => {
    if (!showVideoDurationCounter) {
      return null;
    }
    return describeVideoDurationViolationsForSelectedAccounts({
      accounts: durationValidationAccounts,
      durationSeconds: attachedVideoDurationSeconds,
      fileSizeBytes: attachedVideoFileSizeBytes,
      postFormat,
    });
  }, [
    showVideoDurationCounter,
    durationValidationAccounts,
    attachedVideoDurationSeconds,
    attachedVideoFileSizeBytes,
    postFormat,
  ]);
  const videoDurationCounterClassName =
    maxVideoDurationSeconds === undefined
      ? "bg-surface-container-high/90 text-on-surface-variant"
      : attachedVideoDurationSeconds != null &&
          attachedVideoDurationSeconds > maxVideoDurationSeconds
        ? "bg-primary-container/90 text-on-primary-container ring-1 ring-primary/35"
        : attachedVideoDurationSeconds != null &&
            maxVideoDurationSeconds > 0 &&
            attachedVideoDurationSeconds / maxVideoDurationSeconds >= 0.9
          ? "bg-secondary-container/90 text-on-secondary-container ring-1 ring-secondary/35"
          : "bg-surface-container-high/90 text-on-surface-variant";

  const onDeviceMediaUploaded = useCallback(
    (r: UnifiedMediaUploadWebResult) => {
      setEditorMedia((prev) =>
        mergeAttachedMediaOnPick(prev, {
          mediaId: r.mediaId,
          publicUrl: r.publicUrl,
          mediaType: r.mediaType,
          filename: r.filename,
          thumbnailUrl: r.thumbnailUrl,
          durationSeconds: r.durationSeconds,
          fileSizeBytes: r.fileSizeBytes,
        }),
      );
    },
    [setEditorMedia],
  );

  const onRemoveAttachedMedia = useCallback(
    (mediaKey: string) => {
      setEditorMedia((prev) =>
        prev.filter((m) => (m.mediaId || m.publicUrl) !== mediaKey),
      );
    },
    [setEditorMedia],
  );

  const onMoveAttachedMedia = useCallback(
    (fromKey: string, toKey: string) => {
      if (fromKey === toKey) {
        return;
      }
      setEditorMedia((prev) => {
        const fromIndex = prev.findIndex((m) => (m.mediaId || m.publicUrl) === fromKey);
        const toIndex = prev.findIndex((m) => (m.mediaId || m.publicUrl) === toKey);
        if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
          return prev;
        }
        const next = [...prev];
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);
        return next;
      });
    },
    [setEditorMedia],
  );

  const disablePerPost = selectedIds.length === 0;

  const useModalSetupCollapsible =
    inModal &&
    contentMode === "social" &&
    (!hideChannelPicker || showPostFormat);

  const postFormatToggle = showPostFormat ? (
    <PostSchedulerPostFormatToggle
      value={postFormat}
      showLinkOption={showLinkPostFormat}
      onChange={onPostFormatChange}
    />
  ) : null;
  const composerActionButtons = (
    <PostSchedulerCreatePostCardHeaderGated
      aiPanelOpen={aiPanelOpen}
      onToggleAi={toggleAiPanel}
    />
  );

  const draftScopeBlock =
    contentMode === "social" ? (
      <>
        <PostSchedulerDraftScopeToggle
          draftScope={draftScope}
          disablePerPostOption={disablePerPost}
          compact={inModal}
          onChange={setDraftScope}
        />
        {draftScope === "per_channel" ? (
          <div className="mt-2.5 border-t border-outline-variant/10 pt-2.5">
            <PostSchedulerPerChannelDraftStrip
              accounts={selectedAccounts}
              activeChannelId={activeChannelId}
              onSelectChannelId={setActiveChannelId}
            />
          </div>
        ) : null}
      </>
    ) : null;

  const hasYoutubeTarget = selectedAccounts.some(
    (a) => a.platform === "youtube",
  );
  const showYoutubeVideoExtras = hasYoutubeTarget;
  const hasPinterestTarget = selectedAccounts.some(
    (a) => a.platform === "pinterest",
  );
  const hasTiktokTarget = selectedAccounts.some(
    (a) => a.platform === "tiktok",
  );
  const hasLinkedinTarget = selectedAccounts.some(
    (a) => a.platform === "linkedin",
  );
  const showLinkedinVideoExtras =
    hasLinkedinTarget && inferredKind.ok && inferredKind.kind === "video";
  const youtubeDescriptionError = useMemo(() => {
    if (!hasYoutubeTarget) {
      return null;
    }
    return validateYoutubeDescription(editorBody);
  }, [hasYoutubeTarget, editorBody]);
  const youtubeDescriptionNotice = useMemo(() => {
    if (!hasYoutubeTarget || postFormat === "story") {
      return null;
    }
    return youtubeDescriptionBracketNotice(editorBody);
  }, [editorBody, hasYoutubeTarget, postFormat]);

  return (
    <div
      className={`relative flex flex-col rounded-3xl border border-white/[0.08] bg-gradient-to-br from-surface-container-high/50 via-surface-container/90 to-surface-container-low/80 shadow-[0_24px_64px_-28px_rgba(0,0,0,0.55)] ring-1 ring-white/[0.05] ${
        contentMode === "blog"
          ? wordpressOnlyComposer && inModal
            ? "flex h-full min-h-0 flex-col overflow-hidden"
            : "h-auto"
          : inModal
            ? "flex h-full min-h-0 flex-col overflow-hidden"
            : "h-full min-h-0 overflow-hidden"
      }`}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-px bg-gradient-to-r from-transparent via-primary/45 to-transparent"
        aria-hidden
      />
      <div
        className={`relative z-[2] flex min-h-0 flex-1 flex-col ${
          inModal ? "h-full p-3 sm:p-4" : "min-h-0 flex-1 p-5 sm:p-6 lg:p-7"
        }`}
      >
        {useModalSetupCollapsible ? (
          <>
            <div className="mt-3 shrink-0">
              <PostSchedulerComposerSetupCollapsible
                channelCount={selectedAccounts.length}
                draftScope={draftScope}
                postFormat={postFormat}
                showPostFormat={showPostFormat}
                headerActions={composerActionButtons}
              >
                {!hideChannelPicker ? draftScopeBlock : null}
                {!hideChannelPicker ? <PostSchedulerChannelPicker /> : null}
                {postFormatToggle}
              </PostSchedulerComposerSetupCollapsible>
            </div>
          </>
        ) : (
          <>
            {hideChannelPicker ? null : contentMode === "social" ? (
              <div
                className={
                  inModal
                    ? "shrink-0"
                    : "shrink-0 rounded-2xl border border-white/[0.06] bg-surface-container-low/35 p-4 backdrop-blur-sm sm:p-5"
                }
              >
                {draftScopeBlock}
              </div>
            ) : null}

            <div className={`${inModal ? "mt-4" : "mt-8"} shrink-0`}>
              {composerActionButtons}
            </div>

            {hideChannelPicker ? null : (
              <div className={`${inModal ? "mt-4" : "mt-6"} shrink-0`}>
                <PostSchedulerChannelPicker />
              </div>
            )}

            {showPostFormat ? (
              <div className={`${inModal ? "mt-4" : "mt-6"} shrink-0`}>
                {postFormatToggle}
              </div>
            ) : null}
          </>
        )}

        {postFormat === "link" ? (
          <div className={`${inModal ? "mt-4" : "mt-6"} shrink-0`}>
            <PostSchedulerFacebookLinkUrlField
              value={facebookLinkUrl}
              onChange={setFacebookLinkUrl}
              publishBlockMessage={facebookLinkPublishBlockMessage}
            />
          </div>
        ) : null}

        {inModal ? (
          <div
            className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden pr-1"
            aria-label={t("postScheduler.composer.composerScrollRegionAria")}
          >
            {wordpressOnlyComposer ? (
              <PostSchedulerWordPressBlogEditorPanel
                connectionId={wordpressConnectionId ?? ""}
                title={wordpressTitle}
                slug={wordpressSlug}
                excerpt={wordpressExcerpt}
                categories={wordpressCategories}
                tags={wordpressTags}
                editorBody={editorBody}
                wordpressContent={wordpressContent}
                recommendedImages={wordpressRecommendedImages}
                attachedMedia={editorMedia}
                loading={wordpressArticleGenerating}
                onTitleChange={setWordpressTitle}
                onSlugChange={setWordpressSlug}
                onExcerptChange={setWordpressExcerpt}
                onCategoriesChange={setWordpressCategories}
                onTagsChange={setWordpressTags}
                onEditorBodyChange={setEditorBody}
                onWordpressContentChange={setWordpressContent}
                onAttachedMediaChange={setEditorMedia}
              />
            ) : (
            <div className="workspace-dashboard-scroll shrink-0 space-y-4 overflow-x-hidden overflow-y-auto max-h-[min(42%,20rem)]">
              {hasYoutubeTarget ? (
                <PostSchedulerYoutubeTitleField
                  value={youtubeVideoTitle}
                  onChange={setYoutubeVideoTitle}
                />
              ) : null}
              {showYoutubeVideoExtras ? (
                <PostSchedulerYoutubeVideoExtras
                  playlists={youtubePlaylists}
                  channelId={selectedYoutubeChannelId}
                  playlistId={youtubePlaylistId}
                  onPlaylistIdChange={setYoutubePlaylistId}
                  thumbnailMediaId={youtubeThumbnailMediaId}
                  thumbnailPreviewUrl={youtubeThumbnailPreviewUrl}
                  generateThumbnail={youtubeGenerateThumbnail}
                  madeForKids={youtubeMadeForKids}
                  youtubeTitle={youtubeVideoTitle}
                  descriptionText={editorBody}
                  onThumbnailUploaded={(r) => {
                    setYoutubeGenerateThumbnail(false);
                    setYoutubeThumbnailMediaId(r.mediaId);
                    setYoutubeThumbnailPreviewUrl(r.publicUrl);
                  }}
                  onClearThumbnail={() => {
                    setYoutubeThumbnailMediaId(null);
                    setYoutubeThumbnailPreviewUrl(null);
                  }}
                  setGenerateThumbnail={setYoutubeGenerateThumbnail}
                  onMadeForKidsChange={setYoutubeMadeForKids}
                  onOpenMediaLibraryForThumbnail={() => {
                    setMediaLibraryPickMode("youtube_thumbnail");
                    if (typeof window !== "undefined") {
                      window.dispatchEvent(
                        new CustomEvent("postsiva:open-media-source-picker"),
                      );
                    }
                  }}
                />
              ) : null}
              {showLinkedinVideoExtras ? (
                <PostSchedulerLinkedinVideoExtras
                  thumbnailMediaId={linkedinThumbnailMediaId}
                  thumbnailPreviewUrl={linkedinThumbnailPreviewUrl}
                  generateThumbnail={linkedinGenerateThumbnail}
                  titleText={editorBody}
                  descriptionText={editorBody}
                  onThumbnailUploaded={(r) => {
                    setLinkedinGenerateThumbnail(false);
                    setLinkedinThumbnailMediaId(r.mediaId);
                    setLinkedinThumbnailPreviewUrl(r.publicUrl);
                  }}
                  onClearThumbnail={() => {
                    setLinkedinThumbnailMediaId(null);
                    setLinkedinThumbnailPreviewUrl(null);
                  }}
                  setGenerateThumbnail={setLinkedinGenerateThumbnail}
                  onOpenMediaLibraryForThumbnail={() => {
                    setMediaLibraryPickMode("linkedin_thumbnail");
                    if (typeof window !== "undefined") {
                      window.dispatchEvent(
                        new CustomEvent("postsiva:open-media-library-images"),
                      );
                    }
                  }}
                />
              ) : null}
              {hasPinterestTarget ? (
                <PostSchedulerPinterestTitleField
                  value={pinterestPinTitle}
                  onChange={setPinterestPinTitle}
                />
              ) : null}
              {hasTiktokTarget ? (
                <PostSchedulerTikTokTitleField
                  value={tiktokPhotoTitle}
                  onChange={setTiktokPhotoTitle}
                />
              ) : null}
              {showWordPressFields && !wordpressOnlyComposer ? (
                <PostSchedulerWordPressFields
                  connectionId={wordpressConnectionId ?? ""}
                  title={wordpressTitle}
                  slug={wordpressSlug}
                  excerpt={wordpressExcerpt}
                  categories={wordpressCategories}
                  tags={wordpressTags}
                  loading={wordpressArticleGenerating}
                  onTitleChange={setWordpressTitle}
                  onSlugChange={setWordpressSlug}
                  onExcerptChange={setWordpressExcerpt}
                  onCategoriesChange={setWordpressCategories}
                  onTagsChange={setWordpressTags}
                />
              ) : null}
            </div>
            )}

            {!wordpressOnlyComposer && showWordPressFields &&
            wordpressRecommendedImages.length > 0 ? (
              <PostSchedulerWordPressRecommendedImagesAboveBody
                images={wordpressRecommendedImages}
                onPick={(media) => {
                  setEditorMedia((prev) => mergeAttachedMediaOnPick(prev, media));
                }}
              />
            ) : null}

            {!wordpressOnlyComposer ? (
            <PostSchedulerCreatePostEditorArea
              editorBody={editorBody}
              setEditorBody={setEditorBody}
              maxBodyLength={maxBodyLength}
              bodyCount={bodyCount}
              counterClassName={counterClassName}
              isGeneratingIdeaDraft={isGeneratingIdeaDraft}
              isGeneratingImageToContent={isGeneratingImageToContent}
              isGeneratingVideoToContent={isGeneratingVideoToContent}
              onDeviceMediaUploaded={onDeviceMediaUploaded}
              wordpressConnectionId={wordpressConnectionId}
              attachedMedia={editorMedia}
              onRemoveAttachedMedia={onRemoveAttachedMedia}
              onMoveAttachedMedia={onMoveAttachedMedia}
              unifiedTextLimitError={
                postFormat === "story" ? null : unifiedTextLimitError
              }
              showVideoDurationCounter={showVideoDurationCounter}
              videoDurationSeconds={attachedVideoDurationSeconds}
              maxVideoDurationSeconds={maxVideoDurationSeconds}
              videoDurationCounterClassName={videoDurationCounterClassName}
              videoDurationProbing={videoDurationProbing}
              unifiedVideoDurationError={unifiedVideoDurationError}
              youtubeDescriptionError={
                postFormat === "story" ? null : youtubeDescriptionError
              }
              youtubeDescriptionNotice={
                postFormat === "story" ? null : youtubeDescriptionNotice
              }
              captionDisabled={postFormat === "story"}
              mediaAttachHidden={postFormat === "link"}
              compactAutoHeight={
                contentMode === "blog" && !(inModal && wordpressOnlyComposer)
              }
              onBodyAreaHeightChange={onBodyAreaHeightChange}
            />
            ) : null}
          </div>
        ) : (
          <>
        {wordpressOnlyComposer ? (
          <div className={`${inModal ? "mt-4" : "mt-6"} flex min-h-0 flex-1 flex-col`}>
            <PostSchedulerWordPressBlogEditorPanel
              connectionId={wordpressConnectionId ?? ""}
              title={wordpressTitle}
              slug={wordpressSlug}
              excerpt={wordpressExcerpt}
              categories={wordpressCategories}
              tags={wordpressTags}
              editorBody={editorBody}
              wordpressContent={wordpressContent}
              recommendedImages={wordpressRecommendedImages}
              attachedMedia={editorMedia}
              loading={wordpressArticleGenerating}
              onTitleChange={setWordpressTitle}
              onSlugChange={setWordpressSlug}
              onExcerptChange={setWordpressExcerpt}
              onCategoriesChange={setWordpressCategories}
              onTagsChange={setWordpressTags}
              onEditorBodyChange={setEditorBody}
              onWordpressContentChange={setWordpressContent}
              onAttachedMediaChange={setEditorMedia}
            />
          </div>
        ) : (
          <>
        <div className={`${inModal ? "mt-4" : "mt-6"} shrink-0 space-y-4`}>
          {hasYoutubeTarget ? (
            <PostSchedulerYoutubeTitleField
              value={youtubeVideoTitle}
              onChange={setYoutubeVideoTitle}
            />
          ) : null}
          {showYoutubeVideoExtras ? (
            <PostSchedulerYoutubeVideoExtras
              playlists={youtubePlaylists}
              channelId={selectedYoutubeChannelId}
              playlistId={youtubePlaylistId}
              onPlaylistIdChange={setYoutubePlaylistId}
              thumbnailMediaId={youtubeThumbnailMediaId}
              thumbnailPreviewUrl={youtubeThumbnailPreviewUrl}
              generateThumbnail={youtubeGenerateThumbnail}
              madeForKids={youtubeMadeForKids}
              youtubeTitle={youtubeVideoTitle}
              descriptionText={editorBody}
              onThumbnailUploaded={(r) => {
                setYoutubeGenerateThumbnail(false);
                setYoutubeThumbnailMediaId(r.mediaId);
                setYoutubeThumbnailPreviewUrl(r.publicUrl);
              }}
              onClearThumbnail={() => {
                setYoutubeThumbnailMediaId(null);
                setYoutubeThumbnailPreviewUrl(null);
              }}
              setGenerateThumbnail={setYoutubeGenerateThumbnail}
              onMadeForKidsChange={setYoutubeMadeForKids}
              onOpenMediaLibraryForThumbnail={() => {
                setMediaLibraryPickMode("youtube_thumbnail");
                if (typeof window !== "undefined") {
                  window.dispatchEvent(
                    new CustomEvent("postsiva:open-media-source-picker"),
                  );
                }
              }}
            />
          ) : null}
          {showLinkedinVideoExtras ? (
            <PostSchedulerLinkedinVideoExtras
              thumbnailMediaId={linkedinThumbnailMediaId}
              thumbnailPreviewUrl={linkedinThumbnailPreviewUrl}
              generateThumbnail={linkedinGenerateThumbnail}
              titleText={editorBody}
              descriptionText={editorBody}
              onThumbnailUploaded={(r) => {
                setLinkedinGenerateThumbnail(false);
                setLinkedinThumbnailMediaId(r.mediaId);
                setLinkedinThumbnailPreviewUrl(r.publicUrl);
              }}
              onClearThumbnail={() => {
                setLinkedinThumbnailMediaId(null);
                setLinkedinThumbnailPreviewUrl(null);
              }}
              setGenerateThumbnail={setLinkedinGenerateThumbnail}
              onOpenMediaLibraryForThumbnail={() => {
                setMediaLibraryPickMode("linkedin_thumbnail");
                if (typeof window !== "undefined") {
                  window.dispatchEvent(
                    new CustomEvent("postsiva:open-media-library-images"),
                  );
                }
              }}
            />
          ) : null}
          {hasPinterestTarget ? (
            <PostSchedulerPinterestTitleField
              value={pinterestPinTitle}
              onChange={setPinterestPinTitle}
            />
          ) : null}
          {hasTiktokTarget ? (
            <PostSchedulerTikTokTitleField
              value={tiktokPhotoTitle}
              onChange={setTiktokPhotoTitle}
            />
          ) : null}
          {showWordPressFields ? (
            <PostSchedulerWordPressMetaScroll>
              <PostSchedulerWordPressFields
                connectionId={wordpressConnectionId ?? ""}
                title={wordpressTitle}
                slug={wordpressSlug}
                excerpt={wordpressExcerpt}
                categories={wordpressCategories}
                tags={wordpressTags}
                loading={wordpressArticleGenerating}
                onTitleChange={setWordpressTitle}
                onSlugChange={setWordpressSlug}
                onExcerptChange={setWordpressExcerpt}
                onCategoriesChange={setWordpressCategories}
                onTagsChange={setWordpressTags}
              />
            </PostSchedulerWordPressMetaScroll>
          ) : null}
        </div>

        {showWordPressFields && wordpressRecommendedImages.length > 0 ? (
          <PostSchedulerWordPressRecommendedImagesAboveBody
            images={wordpressRecommendedImages}
            onPick={(media) => {
              setEditorMedia((prev) => mergeAttachedMediaOnPick(prev, media));
            }}
          />
        ) : null}

        <PostSchedulerCreatePostEditorArea
          editorBody={editorBody}
          setEditorBody={setEditorBody}
          maxBodyLength={maxBodyLength}
          bodyCount={bodyCount}
          counterClassName={counterClassName}
          isGeneratingIdeaDraft={isGeneratingIdeaDraft}
          isGeneratingImageToContent={isGeneratingImageToContent}
          isGeneratingVideoToContent={isGeneratingVideoToContent}
          onDeviceMediaUploaded={onDeviceMediaUploaded}
          wordpressConnectionId={wordpressConnectionId}
          attachedMedia={editorMedia}
          onRemoveAttachedMedia={onRemoveAttachedMedia}
          onMoveAttachedMedia={onMoveAttachedMedia}
          unifiedTextLimitError={
            postFormat === "story" ? null : unifiedTextLimitError
          }
          showVideoDurationCounter={showVideoDurationCounter}
          videoDurationSeconds={attachedVideoDurationSeconds}
          maxVideoDurationSeconds={maxVideoDurationSeconds}
          videoDurationCounterClassName={videoDurationCounterClassName}
          videoDurationProbing={videoDurationProbing}
          unifiedVideoDurationError={unifiedVideoDurationError}
          youtubeDescriptionError={
            postFormat === "story" ? null : youtubeDescriptionError
          }
          youtubeDescriptionNotice={
            postFormat === "story" ? null : youtubeDescriptionNotice
          }
          captionDisabled={postFormat === "story"}
          mediaAttachHidden={postFormat === "link"}
          compactAutoHeight={
            contentMode === "blog" && !(inModal && wordpressOnlyComposer)
          }
          onBodyAreaHeightChange={onBodyAreaHeightChange}
        />
          </>
        )}
          </>
        )}
      </div>
      <PostSchedulerAiAlertModal
        visible={linkFormatAlert !== null}
        title={linkFormatAlert?.title ?? ""}
        message={linkFormatAlert?.message ?? ""}
        onClose={() => {
          setLinkFormatAlert(null);
        }}
      />
    </div>
  );
}
