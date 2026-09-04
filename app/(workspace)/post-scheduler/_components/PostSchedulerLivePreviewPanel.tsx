"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SocialPlatformIcon } from "@/lib/social/SocialPlatformIcon";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { usePostSchedulerComposerDraft } from "../_context/PostSchedulerComposerDraftContext";
import { usePostSchedulerComposerChannels } from "../_context/PostSchedulerComposerChannelsContext";
import { usePostSchedulerAiToolkit } from "../_context/PostSchedulerAiToolkitContext";
import type { ComposerChannelAccount } from "../_data/postSchedulerComposerChannelAccounts";
import { PostSchedulerLivePreviewEmptyChannels } from "./PostSchedulerLivePreviewEmptyChannels";
import { useWordPressEditorResources } from "../../wordpress/blogs/_hooks/useWordPressEditorResources";
import { PostSchedulerWordPressBlogPreviewMockup } from "./PostSchedulerWordPressBlogPreviewMockup";
import { PostSchedulerWordPressPreviewMockup } from "./PostSchedulerWordPressPreviewMockup";
import { insertImageIntoWordPressContent } from "./PostSchedulerWordPressPreviewBody";
import { resolveWordPressFeaturedImageUrl } from "@/lib/post-composer/wordpressComposerFields";
import { mergeAttachedMediaOnPick } from "../_utils/postSchedulerComposerMediaPick";
import type { ComposerAttachedMedia } from "../_types/composerDraftTypes";
import { stripFeaturedImageFromHtml } from "../../wordpress/blogs/_components/wordpressArticleParts";
import { POST_SCHEDULER_MODAL_SOCIAL_PREVIEW_SYNC_MIN_PX } from "../_constants/postSchedulerSocialPreviewLayout";
import { usePostSchedulerComposerInModal } from "../_context/PostSchedulerComposerModalLayoutContext";
import { usePostSchedulerComposerMediaSourceFlow } from "../_hooks/usePostSchedulerComposerMediaSourceFlow";
import {
  PREVIEW_TAB_LABEL_KEY,
  renderLivePreviewMockupForPlatform,
} from "./postSchedulerLivePreviewByPlatform";
import { useFacebookLinkOpenGraphPreview } from "../_hooks/useFacebookLinkOpenGraphPreview";
import { facebookLinkPublishBlockDisplayMessage } from "@/lib/social/facebookLinkPostPublishBlockMessage";

export function PostSchedulerLivePreviewPanel({
  editorBodyAreaHeight = null,
}: {
  editorBodyAreaHeight?: number | null;
}): React.ReactElement {
  const { t } = useTranslations();
  const inModal = usePostSchedulerComposerInModal();
  const { selectedAccounts } = usePostSchedulerComposerChannels();
  const { draftScope, contentMode, livePreviewEnabled, unifiedBody,
    unifiedMedia,
    perChannelDrafts,
    activeChannelId,
    setActiveChannelId,
    setEditorMedia,
    setPerChannelMedia,
    youtubeVideoTitle,
    youtubeThumbnailPreviewUrl,
    youtubeGenerateThumbnail,
    linkedinThumbnailPreviewUrl,
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
    setWordpressContent,
    postFormat,
    facebookLinkUrl,
    previewMediaAspectRatio,
  } = usePostSchedulerComposerDraft();
  const { mediaShimmer, wordpressArticleGenerating } = usePostSchedulerAiToolkit();

  const [layoutOnlyIndex, setLayoutOnlyIndex] = useState(0);
  const [wordpressImageSaving, setWordpressImageSaving] = useState(false);
  const imageInsertAtRef = useRef<number | null>(null);
  const mediaPickModeRef = useRef<"cover" | "inline">("inline");

  useEffect(() => {
    const handleSaving = (event: Event): void => {
      const custom = event as CustomEvent<{ saving?: boolean }>;
      setWordpressImageSaving(Boolean(custom.detail?.saving));
    };
    window.addEventListener("postsiva:wordpress-recommended-image-saving", handleSaving);
    return () => {
      window.removeEventListener("postsiva:wordpress-recommended-image-saving", handleSaving);
    };
  }, []);

  const resolveTabIndex = (): number => {
    if (selectedAccounts.length === 0) {
      return 0;
    }
    if (draftScope === "per_channel" && activeChannelId) {
      const i = selectedAccounts.findIndex((a) => a.id === activeChannelId);
      return i >= 0 ? i : 0;
    }
    return Math.min(layoutOnlyIndex, selectedAccounts.length - 1);
  };

  const safeIndex = resolveTabIndex();
  const displayAccount: ComposerChannelAccount | undefined =
    selectedAccounts[safeIndex] ?? selectedAccounts[0];
  const wordpressConnectionId =
    displayAccount?.platform === "wordpress" && displayAccount.id.startsWith("wordpress:")
      ? displayAccount.id.replace(/^wordpress:/, "")
      : "";
  const wordpressResources = useWordPressEditorResources(wordpressConnectionId);

  const previewBody = useMemo((): string => {
    if (!displayAccount) {
      return "";
    }
    if (draftScope === "all_channels") {
      return unifiedBody;
    }
    return perChannelDrafts[displayAccount.id]?.body ?? "";
  }, [draftScope, displayAccount, perChannelDrafts, unifiedBody]);

  const previewMedia = useMemo((): ComposerAttachedMedia[] => {
    if (!displayAccount) {
      return [];
    }
    if (draftScope === "all_channels") {
      return unifiedMedia;
    }
    return perChannelDrafts[displayAccount.id]?.media ?? [];
  }, [draftScope, displayAccount, perChannelDrafts, unifiedMedia]);

  const identity = useMemo(() => {
    if (!displayAccount) {
      return {
        displayName: undefined as string | undefined,
        avatarUrl: undefined as string | undefined,
        linkedinShowFirstDegree: undefined as boolean | undefined,
      };
    }
    return {
      displayName: displayAccount.displayName,
      avatarUrl: displayAccount.avatarUrl,
      linkedinShowFirstDegree: displayAccount.linkedinShowFirstDegree,
    };
  }, [displayAccount]);

  const linkOg = useFacebookLinkOpenGraphPreview(
    postFormat === "link" ? facebookLinkUrl : "",
  );

  const facebookLinkPreviewForMockup = useMemo(() => {
    if (postFormat !== "link" || displayAccount?.platform !== "facebook") {
      return null;
    }
    const url = facebookLinkUrl.trim();
    if (!url) {
      return null;
    }
    const publishBlockMessage = facebookLinkPublishBlockDisplayMessage(
      linkOg.publishBlockReason,
      (key) => t(key),
    );
    return {
      url: linkOg.preview?.url ?? url,
      title: linkOg.preview?.title ?? null,
      description: linkOg.preview?.description ?? null,
      imageUrl: linkOg.preview?.image_url ?? null,
      siteName: linkOg.preview?.site_name ?? null,
      engagementSummary: linkOg.preview?.engagement_summary ?? null,
      loading: linkOg.loading,
      error: linkOg.error,
      publishBlockMessage,
    };
  }, [
    postFormat,
    displayAccount?.platform,
    facebookLinkUrl,
    linkOg.preview,
    linkOg.loading,
    linkOg.error,
    linkOg.publishBlockReason,
    t,
  ]);

  const wordpressCategoryNames = useMemo(() => {
    const resolved = wordpressResources.categories
      .filter((term) => wordpressCategories.includes(term.id))
      .map((term) => term.name);
    const pending = wordpressSuggestedCategoryNames.filter(
      (name) => !resolved.some((item) => item.toLowerCase() === name.toLowerCase()),
    );
    return [...resolved, ...pending];
  }, [
    wordpressCategories,
    wordpressSuggestedCategoryNames,
    wordpressResources.categories,
  ]);
  const wordpressTagNames = useMemo(() => {
    const resolved = wordpressResources.tags
      .filter((term) => wordpressTags.includes(term.id))
      .map((term) => term.name);
    const pending = wordpressSuggestedTagNames.filter(
      (name) => !resolved.some((item) => item.toLowerCase() === name.toLowerCase()),
    );
    return [...resolved, ...pending];
  }, [wordpressSuggestedTagNames, wordpressResources.tags, wordpressTags]);

  const previewContent = wordpressContent || previewBody;
  const wordpressFeaturedImageUrl = useMemo(
    (): string => resolveWordPressFeaturedImageUrl(wordpressRecommendedImages, previewMedia),
    [previewMedia, wordpressRecommendedImages],
  );
  const previewContentWithoutFeaturedHero = useMemo(
    () =>
      wordpressFeaturedImageUrl
        ? stripFeaturedImageFromHtml(previewContent, wordpressFeaturedImageUrl)
        : previewContent,
    [previewContent, wordpressFeaturedImageUrl],
  );

  const insertPreviewImage = useCallback(
    (insertAt: number, url: string): void => {
      const trimmed = url.trim();
      if (!trimmed) return;
      setWordpressContent(
        insertImageIntoWordPressContent(wordpressContent || previewBody, insertAt, trimmed),
      );
    },
    [previewBody, setWordpressContent, wordpressContent],
  );

  const clearPendingMediaPick = useCallback((): void => {
    imageInsertAtRef.current = null;
    mediaPickModeRef.current = "inline";
  }, []);

  const applyFeaturedCoverPick = useCallback(
    (media: ComposerAttachedMedia): void => {
      if (draftScope === "all_channels") {
        setEditorMedia((prev) => mergeAttachedMediaOnPick(prev, media));
        return;
      }
      if (!displayAccount) {
        return;
      }
      const channelId = displayAccount.id;
      const current = perChannelDrafts[channelId]?.media ?? [];
      setPerChannelMedia(channelId, mergeAttachedMediaOnPick(current, media));
    },
    [displayAccount, draftScope, perChannelDrafts, setEditorMedia, setPerChannelMedia],
  );

  const applyPendingImageInsert = useCallback(
    (url: string): void => {
      const insertAt = imageInsertAtRef.current;
      if (insertAt === null) {
        return;
      }
      insertPreviewImage(insertAt, url);
      clearPendingMediaPick();
    },
    [clearPendingMediaPick, insertPreviewImage],
  );

  const handlePreviewMediaPick = useCallback(
    (media: ComposerAttachedMedia): void => {
      if (media.mediaType !== "image" && media.mediaType !== "video") {
        return;
      }
      if (mediaPickModeRef.current === "cover") {
        applyFeaturedCoverPick(media);
        clearPendingMediaPick();
        return;
      }
      applyPendingImageInsert(media.publicUrl);
    },
    [applyFeaturedCoverPick, applyPendingImageInsert, clearPendingMediaPick],
  );

  const { openSourcePicker, modals: previewMediaPickModals } =
    usePostSchedulerComposerMediaSourceFlow({
      wordpressConnectionId,
      libraryOverlayClassName: "z-[1300]",
      // WP cover/inline uses openSourcePicker() directly — do not listen to
      // thumbnail global events or this panel steals the first YT/LI pick.
      listenToGlobalOpenEvents: false,
      composerHandoffsEnabled: false,
      onDismiss: clearPendingMediaPick,
      onPick: (media, _opts) => handlePreviewMediaPick(media),
      onDeviceUpload: (result) => {
        handlePreviewMediaPick({
          mediaId: result.mediaId,
          publicUrl: result.publicUrl,
          mediaType: result.mediaType,
          filename: result.filename,
        });
      },
    });

  const requestAddImage = (insertAt: number): void => {
    mediaPickModeRef.current = "inline";
    imageInsertAtRef.current = insertAt;
    openSourcePicker();
  };

  const requestCoverImage = (): void => {
    mediaPickModeRef.current = "cover";
    imageInsertAtRef.current = null;
    openSourcePicker();
  };

  const onRemovePreviewMedia = useCallback(
    (mediaKey: string) => {
      if (draftScope === "all_channels") {
        setEditorMedia((prev) =>
          prev.filter((m) => (m.mediaId || m.publicUrl) !== mediaKey),
        );
        return;
      }
      if (!displayAccount) {
        return;
      }
      const channelId = displayAccount.id;
      const current = perChannelDrafts[channelId]?.media ?? [];
      setPerChannelMedia(
        channelId,
        current.filter((m) => (m.mediaId || m.publicUrl) !== mediaKey),
      );
    },
    [
      displayAccount,
      draftScope,
      perChannelDrafts,
      setEditorMedia,
      setPerChannelMedia,
    ],
  );

  const onMovePreviewMedia = useCallback(
    (fromKey: string, toKey: string) => {
      if (fromKey === toKey) {
        return;
      }
      const reorder = (items: readonly ComposerAttachedMedia[]): ComposerAttachedMedia[] => {
        const fromIndex = items.findIndex((m) => (m.mediaId || m.publicUrl) === fromKey);
        const toIndex = items.findIndex((m) => (m.mediaId || m.publicUrl) === toKey);
        if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
          return [...items];
        }
        const next = [...items];
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);
        return next;
      };
      if (draftScope === "all_channels") {
        setEditorMedia((prev) => reorder(prev));
        return;
      }
      if (!displayAccount) {
        return;
      }
      const channelId = displayAccount.id;
      setPerChannelMedia(channelId, reorder(perChannelDrafts[channelId]?.media ?? []));
    },
    [displayAccount, draftScope, perChannelDrafts, setEditorMedia, setPerChannelMedia],
  );

  if (selectedAccounts.length === 0) {
    return <PostSchedulerLivePreviewEmptyChannels />;
  }

  const showTabs = selectedAccounts.length > 1;

  const previewSyncHeight =
    editorBodyAreaHeight != null
      ? inModal && displayAccount?.platform !== "youtube"
        ? Math.max(
            editorBodyAreaHeight,
            displayAccount?.platform === "wordpress"
              ? 360
              : POST_SCHEDULER_MODAL_SOCIAL_PREVIEW_SYNC_MIN_PX,
          )
        : editorBodyAreaHeight
      : null;

  const stretchPreviewToEditorHeight =
    inModal && previewSyncHeight != null && displayAccount?.platform !== "youtube";

  const previewFillHeight = stretchPreviewToEditorHeight;

  const onTabPress = (i: number): void => {
    const acc = selectedAccounts[i];
    if (!acc) {
      return;
    }
    if (draftScope === "per_channel") {
      setActiveChannelId(acc.id);
    } else {
      setLayoutOnlyIndex(i);
    }
  };

  return (
    <div className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-surface-container-high/45 via-surface-container/88 to-surface-container-low/75 p-5 shadow-[0_24px_64px_-28px_rgba(0,0,0,0.5)] ring-1 ring-white/[0.05] sm:p-6 lg:p-7">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-secondary/35 to-transparent"
        aria-hidden
      />
      <div className="relative mb-4 shrink-0 sm:mb-5">
        <h2 className="font-headline text-xl font-bold tracking-tight text-on-surface sm:text-2xl">
          {displayAccount?.platform === "wordpress" && contentMode === "blog"
            ? t("postScheduler.preview.livePreview")
            : t("postScheduler.preview.title")}
        </h2>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
          {showTabs ? (
            <div className="mb-4 flex shrink-0 flex-wrap rounded-xl bg-surface-container-low p-1">
              {selectedAccounts.map((acc, i) => (
                <button
                  key={acc.id}
                  type="button"
                  aria-label={t(PREVIEW_TAB_LABEL_KEY[acc.platform])}
                  onClick={() => {
                    onTabPress(i);
                  }}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-colors sm:px-4 ${
                    safeIndex === i
                      ? "bg-primary-container text-white shadow-lg"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  <SocialPlatformIcon platform={acc.platform} className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {t(PREVIEW_TAB_LABEL_KEY[acc.platform])}
                  </span>
                </button>
              ))}
            </div>
          ) : null}
          <div
            className={`relative flex w-full min-w-0 flex-1 min-h-0 justify-center ${
              previewSyncHeight != null
                ? inModal
                  ? "items-stretch overflow-y-auto overflow-x-hidden pb-2"
                  : "shrink-0 items-start overflow-y-auto overflow-x-hidden"
                : "items-stretch"
            } ${inModal ? "pb-1" : ""}`}
            style={
              previewSyncHeight != null
                ? inModal
                  ? { minHeight: previewSyncHeight }
                  : {
                      height: previewSyncHeight,
                      minHeight: previewSyncHeight,
                    }
                : undefined
            }
          >
            {displayAccount?.platform === "wordpress" ? (
              <div
                className={
                  previewFillHeight
                    ? `flex h-full min-h-0 w-full flex-col self-stretch overflow-hidden ${
                        contentMode === "blog" ? "max-w-2xl" : "max-w-lg"
                      }`
                    : `w-full shrink-0 self-start ${
                        contentMode === "blog" ? "max-w-2xl" : "max-w-lg"
                      }`
                }
              >
                {contentMode === "blog" ? (
                  <PostSchedulerWordPressBlogPreviewMockup
                    title={wordpressTitle}
                    excerpt={wordpressExcerpt}
                    content={previewContentWithoutFeaturedHero}
                    featuredImageUrl={wordpressFeaturedImageUrl}
                    imageSaving={wordpressImageSaving}
                    loading={wordpressArticleGenerating}
                    fillAvailableHeight={previewFillHeight}
                    onContentChange={setWordpressContent}
                    onRequestAddImage={requestAddImage}
                    onRequestCoverImage={requestCoverImage}
                  />
                ) : (
                  <PostSchedulerWordPressPreviewMockup
                    siteName={displayAccount.displayName}
                    title={wordpressTitle}
                    slug={wordpressSlug}
                    content={previewContentWithoutFeaturedHero}
                    excerpt={wordpressExcerpt}
                    categoryNames={wordpressCategoryNames}
                    tagNames={wordpressTagNames}
                    featuredImageUrl={wordpressFeaturedImageUrl}
                    imageSaving={wordpressImageSaving}
                    loading={wordpressArticleGenerating}
                    fillAvailableHeight={previewFillHeight}
                    onContentChange={setWordpressContent}
                    onRequestAddImage={requestAddImage}
                  />
                )}
              </div>
            ) : displayAccount ? (
              <div
                className={
                  previewFillHeight
                    ? "flex h-full min-h-0 w-full max-w-lg flex-col self-stretch"
                    : "w-full max-w-lg shrink-0 self-start"
                }
              >
                {renderLivePreviewMockupForPlatform(
                  displayAccount.platform,
                  identity,
                  previewBody,
                  previewMedia,
                  displayAccount.platform === "youtube"
                    ? youtubeVideoTitle
                    : null,
                  displayAccount.platform === "youtube"
                    ? youtubeThumbnailPreviewUrl
                    : null,
                  displayAccount.platform === "youtube"
                    ? youtubeGenerateThumbnail
                    : false,
                  displayAccount.platform === "linkedin"
                    ? linkedinThumbnailPreviewUrl
                    : null,
                  displayAccount.platform === "linkedin"
                    ? linkedinGenerateThumbnail
                    : false,
                  displayAccount.platform === "pinterest"
                    ? pinterestPinTitle
                    : null,
                  displayAccount.platform === "tiktok"
                    ? tiktokPhotoTitle
                    : null,
                  mediaShimmer ||
                    (displayAccount.platform === "youtube" &&
                      youtubeGenerateThumbnail) ||
                    (displayAccount.platform === "linkedin" &&
                      linkedinGenerateThumbnail),
                  onRemovePreviewMedia,
                  onMovePreviewMedia,
                  previewFillHeight,
                  facebookLinkPreviewForMockup,
                  previewMediaAspectRatio,
                )}
              </div>
            ) : null}
          </div>
          {previewMediaPickModals}
      </div>
    </div>
  );
}
