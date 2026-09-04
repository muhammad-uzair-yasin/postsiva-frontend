import { useCallback, useRef, useState } from "react";

import { resolveCanvaMediaForPosting } from "@/lib/social/canvaMediaResolution";
import { useWorkspaceHeaderAccounts } from "../../_components/WorkspaceHeaderAccountsProvider";
import {
  runUnifiedPostSession,
  tryQueueUnifiedPost,
  type PendingUnifiedPostBundle,
} from "../_lib/postSchedulerUnifiedPostFlow";
import type {
  ComposerPublishOverlayState,
  PostSchedulerUnifiedPostParams,
} from "../_types/postSchedulerUnifiedPostTypes";

export function usePostSchedulerUnifiedPost(
  params: PostSchedulerUnifiedPostParams,
) {
  const { accounts, setSelectedAccountId } = useWorkspaceHeaderAccounts();
  const {
    postNowDisabled,
    accounts: composerAccounts,
    postTargetIds,
    draftScope,
    contentMode,
    unifiedBody,
    unifiedMedia,
    perChannelDrafts,
    youtubeTitle,
    youtubePlaylistId,
    youtubeThumbnailMediaId,
    youtubeGenerateThumbnail,
    youtubeMadeForKids,
    linkedinThumbnailMediaId,
    linkedinGenerateThumbnail,
    pinterestTitle,
    tiktokTitle,
    wordpress,
    prepareWordpressFields,
    postFormat,
    facebookLinkUrl,
    facebookLinkPublishBlockMessage,
    onBlockingMessage,
    onPublishFullySucceeded,
  } = params;
  const [isPosting, setPosting] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [publishOverlay, setPublishOverlay] =
    useState<ComposerPublishOverlayState | null>(null);
  const pendingBuiltRef = useRef<PendingUnifiedPostBundle | null>(null);
  const dismissPublishOverlay = useCallback(() => setPublishOverlay(null), []);
  const cancelConfirm = useCallback(() => {
    pendingBuiltRef.current = null;
    setConfirmVisible(false);
  }, []);
  const requestPost = useCallback(() => {
    const q = tryQueueUnifiedPost({
      postNowDisabled,
      accounts: composerAccounts,
      postTargetIds,
      draftScope,
      contentMode,
      unifiedBody,
      unifiedMedia,
      perChannelDrafts,
      youtubeTitle,
      youtubePlaylistId,
      youtubeThumbnailMediaId,
      youtubeGenerateThumbnail,
      youtubeMadeForKids,
      linkedinThumbnailMediaId,
      linkedinGenerateThumbnail,
      pinterestTitle,
      tiktokTitle,
      wordpress,
      postFormat,
      facebookLinkUrl,
      facebookLinkPublishBlockMessage,
    });
    if (!q.ok) {
      onBlockingMessage(q.title, q.message);
      return;
    }
    pendingBuiltRef.current = q.pending;
    setConfirmVisible(true);
  }, [
    postNowDisabled,
    composerAccounts,
    postTargetIds,
    draftScope,
    contentMode,
    unifiedBody,
    unifiedMedia,
    perChannelDrafts,
    youtubeTitle,
    youtubePlaylistId,
    youtubeThumbnailMediaId,
    youtubeGenerateThumbnail,
    youtubeMadeForKids,
    linkedinThumbnailMediaId,
    linkedinGenerateThumbnail,
    pinterestTitle,
    tiktokTitle,
    wordpress,
    postFormat,
    facebookLinkUrl,
    facebookLinkPublishBlockMessage,
    onBlockingMessage,
  ]);
  const confirmAndExecutePost = useCallback(async () => {
    let pending = pendingBuiltRef.current;
    if (!pending) return;
    pendingBuiltRef.current = null;
    setConfirmVisible(false);

    if (contentMode === "blog" && wordpress && prepareWordpressFields) {
      try {
        const resolvedWordpress = await prepareWordpressFields(wordpress);
        const q = tryQueueUnifiedPost({
          postNowDisabled,
          accounts: composerAccounts,
          postTargetIds,
          draftScope,
          contentMode,
          unifiedBody,
          unifiedMedia,
          perChannelDrafts,
          youtubeTitle,
          youtubePlaylistId,
          youtubeThumbnailMediaId,
          youtubeGenerateThumbnail,
          youtubeMadeForKids,
          linkedinThumbnailMediaId,
          linkedinGenerateThumbnail,
          pinterestTitle,
          tiktokTitle,
          wordpress: resolvedWordpress,
          postFormat,
          facebookLinkUrl,
          facebookLinkPublishBlockMessage,
        });
        if (!q.ok) {
          onBlockingMessage(q.title, q.message);
          return;
        }
        pending = q.pending;
      } catch (error) {
        onBlockingMessage(
          "Publish failed",
          error instanceof Error
            ? error.message
            : "Could not prepare WordPress tags and categories.",
        );
        return;
      }
    }

    try {
      const resolved = await resolveCanvaMediaForPosting({
        unifiedMedia,
        perChannelDrafts,
      });
      const q = tryQueueUnifiedPost({
        postNowDisabled,
        accounts: composerAccounts,
        postTargetIds,
        draftScope,
        contentMode,
        unifiedBody,
        unifiedMedia: resolved.unifiedMedia,
        perChannelDrafts: resolved.perChannelDrafts,
        youtubeTitle,
        youtubePlaylistId,
        youtubeThumbnailMediaId,
        youtubeGenerateThumbnail,
        youtubeMadeForKids,
        linkedinThumbnailMediaId,
        linkedinGenerateThumbnail,
        pinterestTitle,
        tiktokTitle,
        wordpress,
        postFormat,
        facebookLinkUrl,
        facebookLinkPublishBlockMessage,
      });
      if (!q.ok) {
        onBlockingMessage(q.title, q.message);
        return;
      }
      pending = q.pending;
    } catch (error) {
      onBlockingMessage(
        "Publish failed",
        error instanceof Error ? error.message : "Could not prepare Canva media.",
      );
      return;
    }

    await runUnifiedPostSession({
      pending,
      onBlockingMessage,
      setPublishOverlay,
      setPosting,
      onPublishFullySucceeded: (p: PendingUnifiedPostBundle) => {
        const first = p.postTargetIds[0];
        if (
          first &&
          accounts.some((row) => row.id === first)
        ) {
          setSelectedAccountId(first);
        }
        onPublishFullySucceeded?.();
      },
    });
  }, [
    accounts,
    composerAccounts,
    draftScope,
    contentMode,
    linkedinGenerateThumbnail,
    linkedinThumbnailMediaId,
    onBlockingMessage,
    onPublishFullySucceeded,
    perChannelDrafts,
    pinterestTitle,
    postFormat,
    facebookLinkUrl,
    facebookLinkPublishBlockMessage,
    postNowDisabled,
    postTargetIds,
    prepareWordpressFields,
    setSelectedAccountId,
    tiktokTitle,
    unifiedBody,
    unifiedMedia,
    wordpress,
    youtubeGenerateThumbnail,
    youtubeMadeForKids,
    youtubePlaylistId,
    youtubeThumbnailMediaId,
    youtubeTitle,
  ]);
  return {
    isPosting,
    confirmVisible,
    requestPost,
    cancelConfirm,
    confirmAndExecutePost,
    publishOverlay,
    dismissPublishOverlay,
  };
}
