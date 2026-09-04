import { useRouter } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";

import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import { resolveCanvaMediaForPosting } from "@/lib/social/canvaMediaResolution";
import { dispatchContentManagerScheduledRefresh } from "@/lib/contentManager/contentManagerScheduledRefresh";
import { useWorkspaceHeaderAccounts } from "../../_components/WorkspaceHeaderAccountsProvider";

import { useWorkspaceComposerModal } from "../../_components/WorkspaceComposerModalProvider";
import { useComposerSessionCacheActions } from "../_context/PostSchedulerComposerSessionCacheProvider";
import { usePostSchedulerActionToast } from "../_context/PostSchedulerActionToastContext";
import { usePostSchedulerComposerDraft } from "../_context/PostSchedulerComposerDraftContext";
import { usePostSchedulerComposerChannels } from "../_context/PostSchedulerComposerChannelsContext";
import {
  isDateInFuture,
  saveUnifiedComposerAsDrafts,
  scheduleUnifiedComposer,
} from "../_lib/postSchedulerSaveAndScheduleFlow";
import {
  tryQueueUnifiedPost,
  type PendingUnifiedPostBundle,
} from "../_lib/postSchedulerUnifiedPostFlow";
import type { WordPressComposerFields } from "@/lib/post-composer/buildComposerPostJobs";
import { buildWordPressComposerFields } from "@/lib/post-composer/wordpressComposerFields";
import { usePrepareWordPressTermsForPublish } from "../_hooks/usePrepareWordPressTermsForPublish";
import { useFacebookLinkOpenGraphPreview } from "../_hooks/useFacebookLinkOpenGraphPreview";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { facebookLinkPublishBlockDisplayMessage } from "@/lib/social/facebookLinkPostPublishBlockMessage";

export function usePostSchedulerScheduleDraftActions(input: {
  readonly scheduledAt: Date;
  readonly hasPickedSlot: boolean;
}): {
  readonly savingDraft: boolean;
  readonly scheduling: boolean;
  readonly channelsBusy: boolean;
  readonly blockingAlert: { title: string; message: string } | null;
  readonly dismissBlockingAlert: () => void;
  readonly saveDraftConfirmVisible: boolean;
  readonly saveDraftChannelCount: number;
  readonly requestSaveDraft: () => void;
  readonly cancelSaveDraftConfirm: () => void;
  readonly confirmSaveDraft: () => Promise<void>;
  readonly onScheduleNow: () => Promise<void>;
} {
  const { t } = useTranslations();
  const router = useRouter();
  // No-op when the composer is the full page; closes the layout-level modal
  // so the redirect to Content Manager is actually visible.
  const { closeComposer } = useWorkspaceComposerModal();
  const { accounts } = useWorkspaceHeaderAccounts();
  const { clearComposerSession } = useComposerSessionCacheActions();
  const { showSuccessToast } = usePostSchedulerActionToast();
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
  const {
    selectedIds,
    selectedAccounts,
    isLoadingProfiles,
    profilesError,
  } = usePostSchedulerComposerChannels();

  const [savingDraft, setSavingDraft] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [blockingAlert, setBlockingAlert] = useState<{
    title: string;
    message: string;
  } | null>(null);
  const [saveDraftConfirmVisible, setSaveDraftConfirmVisible] =
    useState(false);
  const pendingDraftRef = useRef<PendingUnifiedPostBundle | null>(null);

  const dismissBlockingAlert = useCallback(() => {
    setBlockingAlert(null);
  }, []);

  const prepareWordpressFields = usePrepareWordPressTermsForPublish();

  const cancelSaveDraftConfirm = useCallback(() => {
    pendingDraftRef.current = null;
    setSaveDraftConfirmVisible(false);
  }, []);

  const postNowDisabled =
    selectedIds.length === 0 || Boolean(profilesError) || isLoadingProfiles;

  const linkOg = useFacebookLinkOpenGraphPreview(
    postFormat === "link" ? facebookLinkUrl : "",
  );
  const facebookLinkPublishBlockMessage = facebookLinkPublishBlockDisplayMessage(
    linkOg.publishBlockReason,
    (key) => t(key),
  );

  const youtubeTitle = youtubeVideoTitle.trim()
    ? youtubeVideoTitle.trim()
    : null;
  const pinterestTitle = pinterestPinTitle.trim()
    ? pinterestPinTitle.trim()
    : null;
  const tiktokTitle = tiktokPhotoTitle.trim()
    ? tiktokPhotoTitle.trim()
    : null;
  const wordpressFields: WordPressComposerFields | null = useMemo(
    () =>
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
    [
      contentMode,
      postFormat,
      draftScope,
      perChannelDrafts,
      selectedIds,
      unifiedMedia,
      wordpressCategories,
      wordpressContent,
      wordpressExcerpt,
      wordpressRecommendedImages,
      wordpressSlug,
      wordpressSuggestedCategoryNames,
      wordpressSuggestedTagNames,
      wordpressTags,
      wordpressTitle,
    ],
  );
  const ytPlaylist = youtubePlaylistId.trim() ? youtubePlaylistId.trim() : null;
  const ytThumbId = youtubeThumbnailMediaId?.trim()
    ? youtubeThumbnailMediaId.trim()
    : null;
  const linkedinThumbId = linkedinThumbnailMediaId?.trim()
    ? linkedinThumbnailMediaId.trim()
    : null;

  const requestSaveDraft = useCallback(async (): Promise<void> => {
    try {
      const resolved = await resolveCanvaMediaForPosting({
        unifiedMedia,
        perChannelDrafts,
      });
      const q = tryQueueUnifiedPost({
        postNowDisabled,
        accounts: selectedAccounts,
        postTargetIds: selectedIds,
        draftScope,
        contentMode,
        unifiedBody,
        unifiedMedia: resolved.unifiedMedia,
        perChannelDrafts: resolved.perChannelDrafts,
        youtubeTitle,
        youtubePlaylistId: ytPlaylist,
        youtubeThumbnailMediaId: ytThumbId,
        youtubeGenerateThumbnail,
        youtubeMadeForKids,
        linkedinThumbnailMediaId: linkedinThumbId,
        linkedinGenerateThumbnail,
        pinterestTitle,
        tiktokTitle,
        wordpress: wordpressFields,
        postFormat,
        facebookLinkUrl,
        facebookLinkPublishBlockMessage,
        intent: "draft",
      });
      if (!q.ok) {
        setBlockingAlert({ title: q.title, message: q.message });
        return;
      }
      pendingDraftRef.current = q.pending;
      setSaveDraftConfirmVisible(true);
    } catch (error) {
      setBlockingAlert({
        title: "Draft save failed",
        message: error instanceof Error ? error.message : "Could not prepare Canva media.",
      });
    }
  }, [
    postNowDisabled,
    selectedAccounts,
    selectedIds,
    draftScope,
    contentMode,
    unifiedBody,
    unifiedMedia,
    perChannelDrafts,
    youtubeTitle,
    ytPlaylist,
    ytThumbId,
    youtubeGenerateThumbnail,
    youtubeMadeForKids,
    linkedinThumbId,
    linkedinGenerateThumbnail,
    pinterestTitle,
    tiktokTitle,
    wordpressFields,
    postFormat,
    facebookLinkUrl,
    facebookLinkPublishBlockMessage,
  ]);

  const confirmSaveDraft = useCallback(async (): Promise<void> => {
    const pending = pendingDraftRef.current;
    if (!pending) {
      return;
    }
    pendingDraftRef.current = null;
    setSaveDraftConfirmVisible(false);

    const token = getStoredAccessToken();
    const ws = getStoredActiveWorkspaceId();
    if (!token?.trim() || !ws?.trim()) {
      setBlockingAlert({
        title: "Sign in required",
        message: "Log in and open a workspace to save drafts.",
      });
      return;
    }

    setSavingDraft(true);
    try {
      const result = await saveUnifiedComposerAsDrafts({
        accessToken: token,
        workspaceId: ws,
        jobs: pending.jobs,
      });
      if (!result.ok) {
        setBlockingAlert({ title: "Draft save failed", message: result.message });
        return;
      }
      const subtitle = result.partialFailure
        ? "Some channels may have failed. Check Content Manager."
        : "Redirecting to your drafts.";
      showSuccessToast("Draft saved", subtitle);
      clearComposerSession();
      closeComposer();
      router.push("/content-manager?tab=draft");
    } catch (e) {
      setBlockingAlert({
        title: "Draft save failed",
        message: e instanceof Error ? e.message : "Unknown error",
      });
    } finally {
      setSavingDraft(false);
    }
  }, [clearComposerSession, closeComposer, router, showSuccessToast]);

  const onScheduleNow = useCallback(async (): Promise<void> => {
    if (!input.hasPickedSlot) {
      setBlockingAlert({
        title: "Pick a schedule time",
        message:
          "Tap Schedule and choose a slot from the content pipeline first.",
      });
      return;
    }
    if (!isDateInFuture(input.scheduledAt)) {
      setBlockingAlert({
        title: "Invalid time",
        message: "Choose a date and time in the future.",
      });
      return;
    }

    const token = getStoredAccessToken();
    const ws = getStoredActiveWorkspaceId();
    if (!token?.trim() || !ws?.trim()) {
      setBlockingAlert({
        title: "Sign in required",
        message: "Log in and open a workspace to schedule posts.",
      });
      return;
    }

    setScheduling(true);
    try {
      let wordpressForSchedule = wordpressFields;
      if (wordpressForSchedule && postFormat !== "link") {
        wordpressForSchedule = await prepareWordpressFields(wordpressForSchedule);
      } else {
        wordpressForSchedule = null;
      }

      const resolved = await resolveCanvaMediaForPosting({
        unifiedMedia,
        perChannelDrafts,
      });

      const q = tryQueueUnifiedPost({
        postNowDisabled,
        accounts: selectedAccounts,
        postTargetIds: selectedIds,
        draftScope,
        contentMode,
        unifiedBody,
        unifiedMedia: resolved.unifiedMedia,
        perChannelDrafts: resolved.perChannelDrafts,
        youtubeTitle,
        youtubePlaylistId: ytPlaylist,
        youtubeThumbnailMediaId: ytThumbId,
        youtubeGenerateThumbnail,
        youtubeMadeForKids,
        linkedinThumbnailMediaId: linkedinThumbId,
        linkedinGenerateThumbnail,
        pinterestTitle,
        tiktokTitle,
        wordpress: wordpressForSchedule,
        postFormat,
        facebookLinkUrl,
        facebookLinkPublishBlockMessage,
        intent: "schedule",
      });
      if (!q.ok) {
        setBlockingAlert({ title: q.title, message: q.message });
        return;
      }

      const result = await scheduleUnifiedComposer({
        accessToken: token,
        workspaceId: ws,
        jobs: q.pending.jobs,
        scheduledTimeIso: input.scheduledAt.toISOString(),
      });
      if (!result.ok) {
        setBlockingAlert({ title: "Schedule failed", message: result.message });
        return;
      }
      dispatchContentManagerScheduledRefresh({
        workspaceId: ws,
        invalidateAccountIds: accounts.map((account) => account.id),
      });
      showSuccessToast("Post scheduled", "Redirecting to scheduled posts.");
      clearComposerSession();
      closeComposer();
      router.push("/post-scheduler/calendar");
    } catch (e) {
      setBlockingAlert({
        title: "Schedule failed",
        message: e instanceof Error ? e.message : "Unknown error",
      });
    } finally {
      setScheduling(false);
    }
  }, [
    input.hasPickedSlot,
    input.scheduledAt,
    postNowDisabled,
    selectedAccounts,
    selectedIds,
    draftScope,
    contentMode,
    unifiedBody,
    unifiedMedia,
    perChannelDrafts,
    youtubeTitle,
    ytPlaylist,
    ytThumbId,
    youtubeGenerateThumbnail,
    youtubeMadeForKids,
    linkedinThumbId,
    linkedinGenerateThumbnail,
    pinterestTitle,
    tiktokTitle,
    wordpressFields,
    prepareWordpressFields,
    postFormat,
    facebookLinkUrl,
    facebookLinkPublishBlockMessage,
    clearComposerSession,
    closeComposer,
    accounts,
    router,
    showSuccessToast,
  ]);

  const channelsBusy = isLoadingProfiles || Boolean(profilesError);

  return {
    savingDraft,
    scheduling,
    channelsBusy,
    blockingAlert,
    dismissBlockingAlert,
    saveDraftConfirmVisible,
    saveDraftChannelCount: selectedIds.length,
    requestSaveDraft,
    cancelSaveDraftConfirm,
    confirmSaveDraft,
    onScheduleNow,
  };
}
