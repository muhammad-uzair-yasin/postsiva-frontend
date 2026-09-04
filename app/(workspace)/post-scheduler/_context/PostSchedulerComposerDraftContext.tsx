"use client";

import { createContext, useCallback, useContext, useMemo, useState, type Dispatch, type SetStateAction } from "react";

import { deriveContentModeFromSelectedAccounts } from "@/lib/post-composer/composerChannelSections";
import { usePostSchedulerComposerDrafts } from "../_hooks/usePostSchedulerComposerDrafts";
import type {
  ComposerAttachedMedia,
  ComposerDraftScope,
  PerChannelDraftSnapshot,
} from "../_types/composerDraftTypes";
import type { ComposerContentMode } from "@/lib/post-composer/composerContentModeTypes";
import type { ComposerPostFormat } from "@/lib/post-composer/composerPostFormat";
import type { StockMediaItem } from "@/lib/social/stockMediaApi";
import {
  loadComposerSessionCacheForActiveWorkspace,
  type ComposerSessionCacheSnapshot,
} from "@/lib/post-composer/composerSessionCache";
import { usePostSchedulerComposerChannels } from "./PostSchedulerComposerChannelsContext";

export interface PostSchedulerComposerDraftContextValue {
  readonly livePreviewEnabled: boolean;
  readonly setLivePreviewEnabled: Dispatch<SetStateAction<boolean>>;
  readonly draftScope: ComposerDraftScope;
  readonly setDraftScope: (scope: ComposerDraftScope) => void;
  readonly contentMode: ComposerContentMode;
  readonly setContentMode: (mode: ComposerContentMode) => void;
  readonly activeChannelId: string | null;
  readonly setActiveChannelId: (id: string) => void;
  readonly editorBody: string;
  readonly setEditorBody: (text: string) => void;
  readonly editorMedia: ComposerAttachedMedia[];
  readonly setEditorMedia: Dispatch<SetStateAction<ComposerAttachedMedia[]>>;
  readonly unifiedBody: string;
  readonly unifiedMedia: ComposerAttachedMedia[];
  readonly perChannelDrafts: Readonly<Record<string, PerChannelDraftSnapshot>>;
  readonly setPerChannelBody: (channelId: string, text: string) => void;
  readonly setPerChannelMedia: (
    channelId: string,
    media: ComposerAttachedMedia[],
  ) => void;
  /** Used when YouTube is selected; sent as `youtube_title` for video posts. */
  readonly youtubeVideoTitle: string;
  readonly setYoutubeVideoTitle: (value: string) => void;
  /** Used when Pinterest is selected; sent as `pinterest_text` (pin title). */
  readonly pinterestPinTitle: string;
  readonly setPinterestPinTitle: (value: string) => void;
  /** Used when TikTok is selected (image/carousel); sent as `tiktok.tiktok_title`. */
  readonly tiktokPhotoTitle: string;
  readonly setTiktokPhotoTitle: (value: string) => void;
  readonly wordpressTitle: string;
  readonly setWordpressTitle: (value: string) => void;
  readonly wordpressSlug: string;
  readonly setWordpressSlug: (value: string) => void;
  readonly wordpressContent: string;
  readonly setWordpressContent: (value: string) => void;
  readonly wordpressExcerpt: string;
  readonly setWordpressExcerpt: (value: string) => void;
  readonly wordpressCategories: number[];
  readonly setWordpressCategories: Dispatch<SetStateAction<number[]>>;
  readonly wordpressTags: number[];
  readonly setWordpressTags: Dispatch<SetStateAction<number[]>>;
  readonly wordpressSuggestedCategoryNames: string[];
  readonly setWordpressSuggestedCategoryNames: Dispatch<SetStateAction<string[]>>;
  readonly wordpressSuggestedTagNames: string[];
  readonly setWordpressSuggestedTagNames: Dispatch<SetStateAction<string[]>>;
  readonly wordpressRecommendedImages: StockMediaItem[];
  readonly setWordpressRecommendedImages: Dispatch<SetStateAction<StockMediaItem[]>>;
  readonly youtubePlaylistId: string;
  readonly setYoutubePlaylistId: (value: string) => void;
  readonly youtubeThumbnailMediaId: string | null;
  readonly setYoutubeThumbnailMediaId: (value: string | null) => void;
  readonly youtubeThumbnailPreviewUrl: string | null;
  readonly setYoutubeThumbnailPreviewUrl: (value: string | null) => void;
  readonly youtubeGenerateThumbnail: boolean;
  readonly setYoutubeGenerateThumbnail: (value: boolean) => void;
  readonly youtubeMadeForKids: boolean;
  readonly setYoutubeMadeForKids: (value: boolean) => void;
  readonly linkedinThumbnailMediaId: string | null;
  readonly setLinkedinThumbnailMediaId: (value: string | null) => void;
  readonly linkedinThumbnailPreviewUrl: string | null;
  readonly setLinkedinThumbnailPreviewUrl: (value: string | null) => void;
  readonly linkedinGenerateThumbnail: boolean;
  readonly setLinkedinGenerateThumbnail: (value: boolean) => void;
  readonly mediaLibraryPickMode:
    | "default"
    | "youtube_thumbnail"
    | "linkedin_thumbnail";
  readonly setMediaLibraryPickMode: (
    value: "default" | "youtube_thumbnail" | "linkedin_thumbnail",
  ) => void;
  readonly postFormat: ComposerPostFormat;
  readonly setPostFormat: (value: ComposerPostFormat) => void;
  readonly facebookLinkUrl: string;
  readonly setFacebookLinkUrl: (value: string) => void;
  /** Live preview media frame aspect (CSS), e.g. from Canva design size picker. */
  readonly previewMediaAspectRatio: string | null;
  readonly setPreviewMediaAspectRatio: Dispatch<SetStateAction<string | null>>;
  readonly applyComposerSessionSnapshot: (
    snap: import("@/lib/post-composer/composerSessionCache").ComposerSessionCacheSnapshot,
  ) => void;
}

const PostSchedulerComposerDraftContext =
  createContext<PostSchedulerComposerDraftContextValue | null>(null);

export function PostSchedulerComposerDraftProvider({
  children,
  sessionBootstrap,
}: {
  children: React.ReactNode;
  sessionBootstrap?: ComposerSessionCacheSnapshot | null;
}): React.ReactElement {
  const { selectedIds, selectedAccounts } = usePostSchedulerComposerChannels();
  const drafts = usePostSchedulerComposerDrafts(selectedIds, sessionBootstrap);
  const bootPreview = sessionBootstrap
    ? sessionBootstrap.livePreviewEnabled
    : loadComposerSessionCacheForActiveWorkspace()?.livePreviewEnabled;
  const [livePreviewEnabled, setLivePreviewEnabled] = useState(
    bootPreview ?? true,
  );
  const [previewMediaAspectRatio, setPreviewMediaAspectRatio] = useState<string | null>(
    null,
  );
  const contentMode = useMemo(
    () => deriveContentModeFromSelectedAccounts(selectedAccounts),
    [selectedAccounts],
  );
  const setContentMode = useCallback((_mode: ComposerContentMode): void => {
    // Derived from selected channel section; kept for API compatibility.
  }, []);

  const value: PostSchedulerComposerDraftContextValue = {
    livePreviewEnabled,
    setLivePreviewEnabled,
    previewMediaAspectRatio,
    setPreviewMediaAspectRatio,
    contentMode,
    setContentMode,
    ...drafts,
  };

  return (
    <PostSchedulerComposerDraftContext.Provider value={value}>
      {children}
    </PostSchedulerComposerDraftContext.Provider>
  );
}

export function usePostSchedulerComposerDraft(): PostSchedulerComposerDraftContextValue {
  const ctx = useContext(PostSchedulerComposerDraftContext);
  if (!ctx) {
    throw new Error(
      "usePostSchedulerComposerDraft must be used within PostSchedulerComposerDraftProvider",
    );
  }
  return ctx;
}

export function useOptionalPostSchedulerComposerDraft(): PostSchedulerComposerDraftContextValue | null {
  return useContext(PostSchedulerComposerDraftContext);
}
