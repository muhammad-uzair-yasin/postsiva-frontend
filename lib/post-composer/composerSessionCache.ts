import { getStoredActiveWorkspaceId } from "@/lib/auth/session";

import type { ComposerPostFormat } from "./composerPostFormat";
import type { ComposerAttachedMedia } from "./composerAttachedMediaTypes";
import type {
  ComposerDraftScope,
  PerChannelDraftSnapshot,
} from "./composerDraftScopeTypes";
import type { StockMediaItem } from "@/lib/social/stockMediaApi";

export const COMPOSER_SESSION_CACHE_VERSION = 1;

export interface ComposerSessionCacheSnapshot {
  v: typeof COMPOSER_SESSION_CACHE_VERSION;
  draftScope: ComposerDraftScope;
  unifiedBody: string;
  unifiedMedia: ComposerAttachedMedia[];
  perChannelDrafts: Record<string, PerChannelDraftSnapshot>;
  activeChannelId: string | null;
  youtubeVideoTitle: string;
  pinterestPinTitle: string;
  tiktokPhotoTitle: string;
  wordpressTitle: string;
  wordpressSlug: string;
  wordpressContent: string;
  wordpressExcerpt: string;
  wordpressCategories: number[];
  wordpressTags: number[];
  wordpressSuggestedCategoryNames: string[];
  wordpressSuggestedTagNames: string[];
  wordpressRecommendedImages: StockMediaItem[];
  youtubePlaylistId: string;
  youtubeThumbnailMediaId: string | null;
  youtubeThumbnailPreviewUrl: string | null;
  youtubeGenerateThumbnail: boolean;
  youtubeMadeForKids: boolean;
  linkedinThumbnailMediaId: string | null;
  linkedinThumbnailPreviewUrl: string | null;
  linkedinGenerateThumbnail: boolean;
  postFormat: ComposerPostFormat;
  facebookLinkUrl: string;
  livePreviewEnabled: boolean;
  selectedIds: string[];
}

function storageKey(workspaceId: string): string {
  return `postsiva:composer-session:v${COMPOSER_SESSION_CACHE_VERSION}:${workspaceId}`;
}

export function loadComposerSessionCache(
  workspaceId: string | null | undefined,
): ComposerSessionCacheSnapshot | null {
  if (!workspaceId?.trim() || typeof sessionStorage === "undefined") {
    return null;
  }
  try {
    const raw = sessionStorage.getItem(storageKey(workspaceId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ComposerSessionCacheSnapshot;
    if (parsed?.v !== COMPOSER_SESSION_CACHE_VERSION) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveComposerSessionCache(
  workspaceId: string | null | undefined,
  snapshot: ComposerSessionCacheSnapshot,
): void {
  if (!workspaceId?.trim() || typeof sessionStorage === "undefined") {
    return;
  }
  try {
    sessionStorage.setItem(storageKey(workspaceId), JSON.stringify(snapshot));
  } catch {
    /* quota or private mode */
  }
}

export function clearComposerSessionCache(
  workspaceId: string | null | undefined,
): void {
  if (!workspaceId?.trim() || typeof sessionStorage === "undefined") {
    return;
  }
  try {
    sessionStorage.removeItem(storageKey(workspaceId));
  } catch {
    /* ignore */
  }
}

export function loadComposerSessionCacheForActiveWorkspace(): ComposerSessionCacheSnapshot | null {
  return loadComposerSessionCache(getStoredActiveWorkspaceId());
}

export function emptyComposerSessionCacheSnapshot(): ComposerSessionCacheSnapshot {
  return {
    v: COMPOSER_SESSION_CACHE_VERSION,
    draftScope: "all_channels",
    unifiedBody: "",
    unifiedMedia: [],
    perChannelDrafts: {},
    activeChannelId: null,
    youtubeVideoTitle: "",
    pinterestPinTitle: "",
    tiktokPhotoTitle: "",
    wordpressTitle: "",
    wordpressSlug: "",
    wordpressContent: "",
    wordpressExcerpt: "",
    wordpressCategories: [],
    wordpressTags: [],
    wordpressSuggestedCategoryNames: [],
    wordpressSuggestedTagNames: [],
    wordpressRecommendedImages: [],
    youtubePlaylistId: "",
    youtubeThumbnailMediaId: null,
    youtubeThumbnailPreviewUrl: null,
    youtubeGenerateThumbnail: false,
    youtubeMadeForKids: false,
    linkedinThumbnailMediaId: null,
    linkedinThumbnailPreviewUrl: null,
    linkedinGenerateThumbnail: false,
    postFormat: "standard",
    facebookLinkUrl: "",
    livePreviewEnabled: true,
    selectedIds: [],
  };
}
