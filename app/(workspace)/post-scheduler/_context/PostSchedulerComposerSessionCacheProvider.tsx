"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactElement,
  type ReactNode,
} from "react";

import { registerComposerSessionClear } from "@/lib/post-composer/composerClearOnClose";
import {
  emptyComposerSessionCacheSnapshot,
  loadComposerSessionCache,
  saveComposerSessionCache,
  type ComposerSessionCacheSnapshot,
} from "@/lib/post-composer/composerSessionCache";
import { isWorkspaceHeaderAllPlatformsId } from "@/lib/workspace/workspaceHeaderAllPlatforms";

import { useWorkspaceHeaderAccounts } from "../../_components/WorkspaceHeaderAccountsProvider";
import { usePostSchedulerComposerEditMode } from "../../content-manager/_context/PostSchedulerComposerEditModeContext";
import { useActiveWorkspaceId } from "../../_hooks/useActiveWorkspaceId";
import { usePostSchedulerComposerChannels } from "./PostSchedulerComposerChannelsContext";
import { usePostSchedulerComposerDraft } from "./PostSchedulerComposerDraftContext";

type ComposerSessionCacheContextValue = {
  readonly clearComposerSession: () => void;
  /** Fingerprint of the current create-composer session (for clear-on-close). */
  readonly composerSessionFingerprint: string;
};

const ComposerSessionCacheContext =
  createContext<ComposerSessionCacheContextValue | null>(null);

export function useComposerSessionCacheActions(): ComposerSessionCacheContextValue {
  const ctx = useContext(ComposerSessionCacheContext);
  if (!ctx) {
    throw new Error(
      "useComposerSessionCacheActions must be used within PostSchedulerComposerSessionCacheProvider",
    );
  }
  return ctx;
}

export function PostSchedulerComposerSessionCacheProvider({
  children,
  sessionBootstrap,
}: {
  children: ReactNode;
  sessionBootstrap?: ComposerSessionCacheSnapshot | null;
}): ReactElement {
  const workspaceId = useActiveWorkspaceId();
  const draft = usePostSchedulerComposerDraft();
  const { selectedIds, selectAccountIds, headerAccounts } =
    usePostSchedulerComposerChannels();
  const { selectedAccountId: leftRailAccountId } = useWorkspaceHeaderAccounts();
  const { active: composerEditMode } = usePostSchedulerComposerEditMode();
  const skipNextSaveRef = useRef(false);
  const prevWorkspaceRef = useRef<string | null>(null);
  const bootstrapPersistedRef = useRef(false);

  const snapshot = useMemo((): ComposerSessionCacheSnapshot => {
    return {
      v: 1,
      draftScope: draft.draftScope,
      unifiedBody: draft.unifiedBody,
      unifiedMedia: [...draft.unifiedMedia],
      perChannelDrafts: { ...draft.perChannelDrafts },
      activeChannelId: draft.activeChannelId,
      youtubeVideoTitle: draft.youtubeVideoTitle,
      pinterestPinTitle: draft.pinterestPinTitle,
      tiktokPhotoTitle: draft.tiktokPhotoTitle,
      wordpressTitle: draft.wordpressTitle,
      wordpressSlug: draft.wordpressSlug,
      wordpressContent: draft.wordpressContent,
      wordpressExcerpt: draft.wordpressExcerpt,
      wordpressCategories: [...draft.wordpressCategories],
      wordpressTags: [...draft.wordpressTags],
      wordpressSuggestedCategoryNames: [...draft.wordpressSuggestedCategoryNames],
      wordpressSuggestedTagNames: [...draft.wordpressSuggestedTagNames],
      wordpressRecommendedImages: [...draft.wordpressRecommendedImages],
      youtubePlaylistId: draft.youtubePlaylistId,
      youtubeThumbnailMediaId: draft.youtubeThumbnailMediaId,
      youtubeThumbnailPreviewUrl: draft.youtubeThumbnailPreviewUrl,
      youtubeGenerateThumbnail: draft.youtubeGenerateThumbnail,
      youtubeMadeForKids: draft.youtubeMadeForKids,
      linkedinThumbnailMediaId: draft.linkedinThumbnailMediaId,
      linkedinThumbnailPreviewUrl: draft.linkedinThumbnailPreviewUrl,
      linkedinGenerateThumbnail: draft.linkedinGenerateThumbnail,
      postFormat: draft.postFormat,
      facebookLinkUrl: draft.facebookLinkUrl,
      livePreviewEnabled: draft.livePreviewEnabled,
      selectedIds: [...selectedIds],
    };
  }, [
    draft.draftScope,
    draft.unifiedBody,
    draft.unifiedMedia,
    draft.perChannelDrafts,
    draft.activeChannelId,
    draft.youtubeVideoTitle,
    draft.pinterestPinTitle,
    draft.tiktokPhotoTitle,
    draft.wordpressTitle,
    draft.wordpressSlug,
    draft.wordpressContent,
    draft.wordpressExcerpt,
    draft.wordpressCategories,
    draft.wordpressTags,
    draft.wordpressSuggestedCategoryNames,
    draft.wordpressSuggestedTagNames,
    draft.wordpressRecommendedImages,
    draft.youtubePlaylistId,
    draft.youtubeThumbnailMediaId,
    draft.youtubeThumbnailPreviewUrl,
    draft.youtubeGenerateThumbnail,
    draft.youtubeMadeForKids,
    draft.linkedinThumbnailMediaId,
    draft.linkedinThumbnailPreviewUrl,
    draft.linkedinGenerateThumbnail,
    draft.postFormat,
    draft.facebookLinkUrl,
    draft.livePreviewEnabled,
    selectedIds,
  ]);

  useEffect(() => {
    if (!workspaceId || !sessionBootstrap || bootstrapPersistedRef.current) {
      return;
    }
    bootstrapPersistedRef.current = true;
    saveComposerSessionCache(workspaceId, sessionBootstrap);
    skipNextSaveRef.current = true;
  }, [workspaceId, sessionBootstrap]);

  useEffect(() => {
    if (!workspaceId) return;
    if (composerEditMode || sessionBootstrap) return;
    if (prevWorkspaceRef.current === workspaceId) return;
    prevWorkspaceRef.current = workspaceId;
    const snap = loadComposerSessionCache(workspaceId);
    if (!snap) return;
    skipNextSaveRef.current = true;
    draft.applyComposerSessionSnapshot(snap);
    draft.setLivePreviewEnabled(snap.livePreviewEnabled);
    if (snap.selectedIds.length > 0) {
      selectAccountIds(snap.selectedIds);
    }
  }, [
    workspaceId,
    composerEditMode,
    sessionBootstrap,
    draft.applyComposerSessionSnapshot,
    draft.setLivePreviewEnabled,
    selectAccountIds,
  ]);

  useEffect(() => {
    if (!workspaceId) return;
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }
    const handle = window.setTimeout(() => {
      saveComposerSessionCache(workspaceId, snapshot);
    }, 400);
    return () => window.clearTimeout(handle);
  }, [workspaceId, snapshot]);

  const clearComposerSession = useCallback(() => {
    skipNextSaveRef.current = true;
    // Match Social Channels to the left-rail account after clear.
    const railId =
      leftRailAccountId &&
      !isWorkspaceHeaderAllPlatformsId(leftRailAccountId) &&
      headerAccounts.some((account) => account.id === leftRailAccountId)
        ? leftRailAccountId
        : null;
    const nextIds = railId ? [railId] : [];
    const cleared: ComposerSessionCacheSnapshot = {
      ...emptyComposerSessionCacheSnapshot(),
      selectedIds: nextIds,
      livePreviewEnabled: true,
    };
    draft.applyComposerSessionSnapshot(cleared);
    draft.setLivePreviewEnabled(true);
    if (nextIds.length > 0) {
      selectAccountIds(nextIds);
    }
    if (workspaceId) {
      saveComposerSessionCache(workspaceId, cleared);
    }
  }, [
    workspaceId,
    draft,
    selectAccountIds,
    headerAccounts,
    leftRailAccountId,
  ]);

  const composerSessionFingerprint = useMemo(
    () => JSON.stringify(snapshot),
    [snapshot],
  );

  const fingerprintRef = useRef(composerSessionFingerprint);
  fingerprintRef.current = composerSessionFingerprint;

  useEffect(() => {
    return registerComposerSessionClear(clearComposerSession, () => {
      return fingerprintRef.current;
    });
  }, [clearComposerSession]);

  const value = useMemo(
    () => ({ clearComposerSession, composerSessionFingerprint }),
    [clearComposerSession, composerSessionFingerprint],
  );

  return (
    <ComposerSessionCacheContext.Provider value={value}>
      {children}
    </ComposerSessionCacheContext.Provider>
  );
}
