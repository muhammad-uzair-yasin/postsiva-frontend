import type { Dispatch, SetStateAction } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  emptyComposerSessionCacheSnapshot,
  loadComposerSessionCacheForActiveWorkspace,
  type ComposerSessionCacheSnapshot,
} from "@/lib/post-composer/composerSessionCache";

import type {
  ComposerAttachedMedia,
  ComposerDraftScope,
  PerChannelDraftSnapshot,
} from "../_types/composerDraftTypes";
import type { ComposerPostFormat } from "@/lib/post-composer/composerPostFormat";
import type { StockMediaItem } from "@/lib/social/stockMediaApi";

function emptyDraft(): PerChannelDraftSnapshot {
  return { body: "", media: [] };
}

function initialFromCache(): ComposerSessionCacheSnapshot {
  return loadComposerSessionCacheForActiveWorkspace() ?? emptyComposerSessionCacheSnapshot();
}

/** Same behavior as mobile `usePostComposerChannelDrafts`. */
export function usePostSchedulerComposerDrafts(
  postTargetIds: readonly string[],
  sessionBootstrap?: ComposerSessionCacheSnapshot | null,
): {
  draftScope: ComposerDraftScope;
  setDraftScope: (scope: ComposerDraftScope) => void;
  activeChannelId: string | null;
  setActiveChannelId: (id: string) => void;
  editorBody: string;
  setEditorBody: (text: string) => void;
  editorMedia: ComposerAttachedMedia[];
  setEditorMedia: Dispatch<SetStateAction<ComposerAttachedMedia[]>>;
  unifiedBody: string;
  unifiedMedia: ComposerAttachedMedia[];
  perChannelDrafts: Readonly<Record<string, PerChannelDraftSnapshot>>;
  setPerChannelBody: (channelId: string, text: string) => void;
  setPerChannelMedia: (
    channelId: string,
    media: ComposerAttachedMedia[],
  ) => void;
  /** Explicit YouTube title when YouTube is among post targets (video posts). */
  youtubeVideoTitle: string;
  setYoutubeVideoTitle: (value: string) => void;
  /** Explicit Pinterest pin title when Pinterest is among post targets. */
  pinterestPinTitle: string;
  setPinterestPinTitle: (value: string) => void;
  /** TikTok Business photo/carousel title (max 90 UTF-16) when TikTok is selected. */
  tiktokPhotoTitle: string;
  setTiktokPhotoTitle: (value: string) => void;
  wordpressTitle: string;
  setWordpressTitle: (value: string) => void;
  wordpressSlug: string;
  setWordpressSlug: (value: string) => void;
  wordpressContent: string;
  setWordpressContent: (value: string) => void;
  wordpressExcerpt: string;
  setWordpressExcerpt: (value: string) => void;
  wordpressCategories: number[];
  setWordpressCategories: Dispatch<SetStateAction<number[]>>;
  wordpressTags: number[];
  setWordpressTags: Dispatch<SetStateAction<number[]>>;
  wordpressSuggestedCategoryNames: string[];
  setWordpressSuggestedCategoryNames: Dispatch<SetStateAction<string[]>>;
  wordpressSuggestedTagNames: string[];
  setWordpressSuggestedTagNames: Dispatch<SetStateAction<string[]>>;
  wordpressRecommendedImages: StockMediaItem[];
  setWordpressRecommendedImages: Dispatch<SetStateAction<StockMediaItem[]>>;
  youtubePlaylistId: string;
  setYoutubePlaylistId: (value: string) => void;
  youtubeThumbnailMediaId: string | null;
  setYoutubeThumbnailMediaId: (value: string | null) => void;
  youtubeThumbnailPreviewUrl: string | null;
  setYoutubeThumbnailPreviewUrl: (value: string | null) => void;
  youtubeGenerateThumbnail: boolean;
  setYoutubeGenerateThumbnail: (value: boolean) => void;
  youtubeMadeForKids: boolean;
  setYoutubeMadeForKids: (value: boolean) => void;
  linkedinThumbnailMediaId: string | null;
  setLinkedinThumbnailMediaId: (value: string | null) => void;
  linkedinThumbnailPreviewUrl: string | null;
  setLinkedinThumbnailPreviewUrl: (value: string | null) => void;
  linkedinGenerateThumbnail: boolean;
  setLinkedinGenerateThumbnail: (value: boolean) => void;
  mediaLibraryPickMode: "default" | "youtube_thumbnail" | "linkedin_thumbnail";
  setMediaLibraryPickMode: (
    value: "default" | "youtube_thumbnail" | "linkedin_thumbnail",
  ) => void;
  postFormat: ComposerPostFormat;
  setPostFormat: (value: ComposerPostFormat) => void;
  facebookLinkUrl: string;
  setFacebookLinkUrl: (value: string) => void;
  applyComposerSessionSnapshot: (snap: ComposerSessionCacheSnapshot) => void;
} {
  const boot = useMemo(
    () => sessionBootstrap ?? initialFromCache(),
    [sessionBootstrap],
  );
  const [draftScope, setDraftScopeState] =
    useState<ComposerDraftScope>(boot.draftScope);
  const [unifiedBody, setUnifiedBody] = useState(boot.unifiedBody);
  const [youtubeVideoTitle, setYoutubeVideoTitle] = useState(boot.youtubeVideoTitle);
  const [pinterestPinTitle, setPinterestPinTitle] = useState(boot.pinterestPinTitle);
  const [tiktokPhotoTitle, setTiktokPhotoTitle] = useState(boot.tiktokPhotoTitle);
  const [wordpressTitle, setWordpressTitle] = useState(boot.wordpressTitle);
  const [wordpressSlug, setWordpressSlug] = useState(boot.wordpressSlug);
  const [wordpressContent, setWordpressContent] = useState(boot.wordpressContent);
  const [wordpressExcerpt, setWordpressExcerpt] = useState(boot.wordpressExcerpt);
  const [wordpressCategories, setWordpressCategories] = useState<number[]>(
    boot.wordpressCategories,
  );
  const [wordpressTags, setWordpressTags] = useState<number[]>(boot.wordpressTags);
  const [wordpressSuggestedCategoryNames, setWordpressSuggestedCategoryNames] =
    useState<string[]>(boot.wordpressSuggestedCategoryNames);
  const [wordpressSuggestedTagNames, setWordpressSuggestedTagNames] = useState<
    string[]
  >(boot.wordpressSuggestedTagNames);
  const [wordpressRecommendedImages, setWordpressRecommendedImages] = useState<
    StockMediaItem[]
  >(boot.wordpressRecommendedImages);
  const [youtubePlaylistId, setYoutubePlaylistId] = useState(boot.youtubePlaylistId);
  const [youtubeThumbnailMediaId, setYoutubeThumbnailMediaId] = useState<
    string | null
  >(boot.youtubeThumbnailMediaId);
  const [youtubeThumbnailPreviewUrl, setYoutubeThumbnailPreviewUrl] =
    useState<string | null>(boot.youtubeThumbnailPreviewUrl);
  const [youtubeGenerateThumbnail, setYoutubeGenerateThumbnail] = useState(
    boot.youtubeGenerateThumbnail,
  );
  const [youtubeMadeForKids, setYoutubeMadeForKids] = useState(boot.youtubeMadeForKids);
  const [linkedinThumbnailMediaId, setLinkedinThumbnailMediaId] = useState<
    string | null
  >(boot.linkedinThumbnailMediaId);
  const [linkedinThumbnailPreviewUrl, setLinkedinThumbnailPreviewUrl] =
    useState<string | null>(boot.linkedinThumbnailPreviewUrl);
  const [linkedinGenerateThumbnail, setLinkedinGenerateThumbnail] = useState(
    boot.linkedinGenerateThumbnail,
  );
  const [mediaLibraryPickMode, setMediaLibraryPickMode] = useState<
    "default" | "youtube_thumbnail" | "linkedin_thumbnail"
  >("default");
  const [postFormat, setPostFormat] = useState<ComposerPostFormat>(boot.postFormat);
  const [facebookLinkUrl, setFacebookLinkUrl] = useState(boot.facebookLinkUrl);

  useEffect(() => {
    const handle = (event: Event): void => {
      const custom = event as CustomEvent<{ images?: StockMediaItem[] }>;
      setWordpressRecommendedImages(custom.detail?.images ?? []);
    };
    window.addEventListener("postsiva:wordpress-recommended-images", handle);
    return () => {
      window.removeEventListener("postsiva:wordpress-recommended-images", handle);
    };
  }, []);
  const [unifiedMedia, setUnifiedMedia] = useState<ComposerAttachedMedia[]>(
    boot.unifiedMedia,
  );
  const [perChannelDrafts, setPerChannelDrafts] = useState<
    Record<string, PerChannelDraftSnapshot>
  >(boot.perChannelDrafts);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(
    boot.activeChannelId,
  );
  const activeChannelIdRef = useRef(activeChannelId);
  const unifiedSnapRef = useRef({ body: unifiedBody, media: unifiedMedia });

  const postKey = postTargetIds.join("|");

  useEffect(() => {
    activeChannelIdRef.current = activeChannelId;
  }, [activeChannelId]);

  useEffect(() => {
    unifiedSnapRef.current = { body: unifiedBody, media: unifiedMedia };
  }, [unifiedBody, unifiedMedia]);

  useEffect(() => {
    if (postTargetIds.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- keep composer scope valid when channel targets are cleared
      setDraftScopeState((prev) =>
        prev === "per_channel" ? "all_channels" : prev,
      );
      setActiveChannelId(null);
      return;
    }
    if (
      activeChannelIdRef.current &&
      !postTargetIds.includes(activeChannelIdRef.current)
    ) {
      setActiveChannelId(postTargetIds[0]);
    } else if (!activeChannelIdRef.current) {
      setActiveChannelId(postTargetIds[0]);
    }
  }, [postKey, postTargetIds]);

  useEffect(() => {
    if (draftScope !== "per_channel") {
      return;
    }
    setPerChannelDrafts((prev) => {
      const next = { ...prev };
      const template = postTargetIds
        .map((id) => next[id])
        .find((d) => d !== undefined);
      for (const id of postTargetIds) {
        if (!next[id]) {
          const t = template ?? {
            body: unifiedSnapRef.current.body,
            media: [...unifiedSnapRef.current.media],
          };
          next[id] = { body: t.body, media: [...t.media] };
        }
      }
      for (const k of Object.keys(next)) {
        if (!postTargetIds.includes(k)) {
          delete next[k];
        }
      }
      return next;
    });
  }, [draftScope, postKey, postTargetIds]);

  const setDraftScope = useCallback(
    (next: ComposerDraftScope): void => {
      if (next === "per_channel") {
        setPerChannelDrafts((current) => {
          const merged: Record<string, PerChannelDraftSnapshot> = {};
          for (const id of postTargetIds) {
            const existing = current[id];
            if (existing) {
              merged[id] = {
                body: existing.body,
                media: [...existing.media],
              };
              continue;
            }
            merged[id] = { body: unifiedBody, media: [...unifiedMedia] };
          }
          return merged;
        });
        setActiveChannelId(postTargetIds[0] ?? null);
        setDraftScopeState("per_channel");
        return;
      }
      setPerChannelDrafts((current) => {
        const pickId = activeChannelIdRef.current ?? postTargetIds[0];
        const src = pickId ? current[pickId] : null;
        if (src) {
          setUnifiedBody(src.body);
          setUnifiedMedia(src.media);
        }
        return current;
      });
      setDraftScopeState("all_channels");
    },
    [postTargetIds, unifiedBody, unifiedMedia],
  );

  const editorBody = useMemo(() => {
    if (draftScope === "all_channels") {
      return unifiedBody;
    }
    if (!activeChannelId) {
      return "";
    }
    return perChannelDrafts[activeChannelId]?.body ?? "";
  }, [draftScope, unifiedBody, activeChannelId, perChannelDrafts]);

  const editorMedia = useMemo(() => {
    if (draftScope === "all_channels") {
      return unifiedMedia;
    }
    if (!activeChannelId) {
      return [];
    }
    return perChannelDrafts[activeChannelId]?.media ?? [];
  }, [draftScope, unifiedMedia, activeChannelId, perChannelDrafts]);

  const setEditorBody = useCallback(
    (text: string): void => {
      if (draftScope === "all_channels") {
        setUnifiedBody(text);
        return;
      }
      if (!activeChannelId) {
        return;
      }
      setPerChannelDrafts((prev) => ({
        ...prev,
        [activeChannelId]: {
          ...(prev[activeChannelId] ?? emptyDraft()),
          body: text,
        },
      }));
    },
    [draftScope, activeChannelId],
  );

  const setEditorMedia = useCallback(
    (action: SetStateAction<ComposerAttachedMedia[]>): void => {
      if (draftScope === "all_channels") {
        setUnifiedMedia(action);
        return;
      }
      if (!activeChannelId) {
        return;
      }
      setPerChannelDrafts((prev) => {
        const cur = prev[activeChannelId] ?? emptyDraft();
        const nextMedia =
          typeof action === "function" ? action(cur.media) : action;
        return {
          ...prev,
          [activeChannelId]: { ...cur, media: nextMedia },
        };
      });
    },
    [draftScope, activeChannelId],
  );

  const setPerChannelBody = useCallback((channelId: string, text: string) => {
    if (!channelId) {
      return;
    }
    setPerChannelDrafts((prev) => ({
      ...prev,
      [channelId]: {
        ...(prev[channelId] ?? emptyDraft()),
        body: text,
      },
    }));
  }, []);

  const setPerChannelMedia = useCallback(
    (channelId: string, media: ComposerAttachedMedia[]) => {
      if (!channelId) {
        return;
      }
      setPerChannelDrafts((prev) => ({
        ...prev,
        [channelId]: {
          ...(prev[channelId] ?? emptyDraft()),
          media,
        },
      }));
    },
    [],
  );

  const applyComposerSessionSnapshot = useCallback(
    (snap: ComposerSessionCacheSnapshot): void => {
      setDraftScopeState(snap.draftScope);
      setUnifiedBody(snap.unifiedBody);
      setUnifiedMedia([...snap.unifiedMedia]);
      setPerChannelDrafts({ ...snap.perChannelDrafts });
      setActiveChannelId(snap.activeChannelId);
      setYoutubeVideoTitle(snap.youtubeVideoTitle);
      setPinterestPinTitle(snap.pinterestPinTitle);
      setTiktokPhotoTitle(snap.tiktokPhotoTitle);
      setWordpressTitle(snap.wordpressTitle);
      setWordpressSlug(snap.wordpressSlug);
      setWordpressContent(snap.wordpressContent);
      setWordpressExcerpt(snap.wordpressExcerpt);
      setWordpressCategories([...snap.wordpressCategories]);
      setWordpressTags([...snap.wordpressTags]);
      setWordpressSuggestedCategoryNames([...snap.wordpressSuggestedCategoryNames]);
      setWordpressSuggestedTagNames([...snap.wordpressSuggestedTagNames]);
      setWordpressRecommendedImages([...snap.wordpressRecommendedImages]);
      setYoutubePlaylistId(snap.youtubePlaylistId);
      setYoutubeThumbnailMediaId(snap.youtubeThumbnailMediaId);
      setYoutubeThumbnailPreviewUrl(snap.youtubeThumbnailPreviewUrl);
      setYoutubeGenerateThumbnail(snap.youtubeGenerateThumbnail);
      setYoutubeMadeForKids(snap.youtubeMadeForKids);
      setLinkedinThumbnailMediaId(snap.linkedinThumbnailMediaId);
      setLinkedinThumbnailPreviewUrl(snap.linkedinThumbnailPreviewUrl);
      setLinkedinGenerateThumbnail(snap.linkedinGenerateThumbnail);
      setPostFormat(snap.postFormat);
      setFacebookLinkUrl(snap.facebookLinkUrl);
      setMediaLibraryPickMode("default");
    },
    [],
  );

  return {
    draftScope,
    setDraftScope,
    activeChannelId,
    setActiveChannelId,
    editorBody,
    setEditorBody,
    editorMedia,
    setEditorMedia,
    unifiedBody,
    unifiedMedia,
    perChannelDrafts,
    setPerChannelBody,
    setPerChannelMedia,
    youtubeVideoTitle,
    setYoutubeVideoTitle,
    pinterestPinTitle,
    setPinterestPinTitle,
    tiktokPhotoTitle,
    setTiktokPhotoTitle,
    wordpressTitle,
    setWordpressTitle,
    wordpressSlug,
    setWordpressSlug,
    wordpressContent,
    setWordpressContent,
    wordpressExcerpt,
    setWordpressExcerpt,
    wordpressCategories,
    setWordpressCategories,
    wordpressTags,
    setWordpressTags,
    wordpressSuggestedCategoryNames,
    setWordpressSuggestedCategoryNames,
    wordpressSuggestedTagNames,
    setWordpressSuggestedTagNames,
    wordpressRecommendedImages,
    setWordpressRecommendedImages,
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
    mediaLibraryPickMode,
    setMediaLibraryPickMode,
    postFormat,
    setPostFormat,
    facebookLinkUrl,
    setFacebookLinkUrl,
    applyComposerSessionSnapshot,
  };
}
