"use client";

import { useEffect, useMemo, useState, type ReactElement } from "react";

import type { UnifiedScheduledPostItemJson } from "@/lib/social/unifiedScheduledPostsApi";
import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import { fetchWorkspaceMediaList } from "@/lib/social/unifiedMediaApi";

import { useWorkspaceHeaderAccounts } from "@/app/(workspace)/_components/WorkspaceHeaderAccountsProvider";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { resolvePostingDestinationFromHeaderAccount } from "@/lib/workspace/resolvePostingDestinationFromHeaderAccount";
import type { WorkspaceHeaderAccountRow } from "@/lib/workspace/headerAccountsTypes";
import {
  capMainTextForPlatform,
  composerMainTextLimitForPlatform,
} from "@/lib/post-composer/composerMainTextCharLimits";

import { useDraftEditorConfirmFlow } from "../_hooks/useDraftEditorConfirmFlow";
import { useDraftActionSuccessToast } from "../_hooks/useDraftActionSuccessToast";
import { useScheduledPostEditorActions } from "../_hooks/useScheduledPostEditorActions";
import { useScheduledPostEditorScheduleAndImage } from "../_hooks/useScheduledPostEditorScheduleAndImage";
import { useDraftChannelLabels } from "../_hooks/useDraftChannelLabels";
import {
  formatDraftAccountSummaryLabel,
  formatDraftPublishChannelLabel,
} from "../_utils/formatDraftPublishChannelLabel";
import { scheduledPostTimeAsIsoUtc } from "../_utils/scheduledPostScheduledTimeIso";
import { scheduledPostToSyntheticDraft } from "../_utils/scheduledPostToSyntheticDraft";
import { wordpressScheduledCaption } from "@/lib/post-composer/parseWordPressScheduledPostData";
import { DraftEditorActionConfirmModal } from "./DraftEditorActionConfirmModal";
import { DraftEditorAccountPickerModal } from "./DraftEditorAccountPickerModal";
import { DraftEditorCaptionField } from "./DraftEditorCaptionField";
import { DraftEditorDraftSummary } from "./DraftEditorDraftSummary";
import { DraftEditorScheduleAndMedia } from "./DraftEditorScheduleAndMedia";
import { DraftEditorSuccessToast } from "./DraftEditorSuccessToast";
import { ScheduledPostPrimaryActions } from "./ScheduledPostPrimaryActions";
import { ContentManagerScheduledDateTimePickerModal } from "@/app/(workspace)/content-manager/_components/ContentManagerScheduledDateTimePickerModal";
import { useActiveWorkspaceYoutubePlaylists } from "../../../../post-scheduler/_hooks/useActiveWorkspaceYoutubePlaylists";

export interface ScheduledPostEditorModalBusyOverlay {
  active: boolean;
  mode: "save" | "schedule" | "publish" | "media";
}

function captionFromItem(item: UnifiedScheduledPostItemJson): string {
  const pd = item.post_data ?? {};
  if (item.platform?.trim().toLowerCase() === "wordpress") {
    return capMainTextForPlatform(wordpressScheduledCaption(pd), item.platform);
  }
  const raw =
    item.platform?.trim().toLowerCase() === "youtube"
      ? pd.youtube_description ?? pd.default_text ?? pd.text ?? pd.caption
      : item.platform?.trim().toLowerCase() === "pinterest"
        ? pd.description ?? pd.default_text ?? pd.text ?? pd.caption
      : pd.default_text ?? pd.text ?? pd.caption;
  return typeof raw === "string"
    ? capMainTextForPlatform(raw, item.platform)
    : "";
}

function stringField(
  source: Record<string, unknown>,
  keys: readonly string[],
): string {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function youtubeTitleFromItem(item: UnifiedScheduledPostItemJson): string {
  return stringField(item.post_data ?? {}, ["youtube_title", "title"]);
}

function fieldFromItem(
  item: UnifiedScheduledPostItemJson,
  keys: readonly string[],
): string {
  return stringField(item.post_data ?? {}, keys);
}

function boolFieldFromItem(
  item: UnifiedScheduledPostItemJson,
  key: string,
): boolean {
  return Boolean((item.post_data ?? {})[key]);
}

function youtubeThumbnailDraftFromItem(
  item: UnifiedScheduledPostItemJson,
  resolvedThumbnailUrl?: string | null,
): ReturnType<typeof scheduledPostToSyntheticDraft> {
  const pd = item.post_data ?? {};
  return {
    ...scheduledPostToSyntheticDraft(item),
    post_type: "image",
    video_id: null,
    video_url: null,
    default_image_id: stringField(pd, ["thumbnail_image_id"]) || null,
    default_image_url:
      stringField(pd, ["thumbnail_url"]) || resolvedThumbnailUrl || null,
    image_ids: null,
    image_urls: null,
  };
}

async function resolveMediaPublicUrlById(mediaId: string): Promise<string | null> {
  const token = getStoredAccessToken();
  const workspaceId = getStoredActiveWorkspaceId();
  if (!token?.trim() || !workspaceId?.trim() || !mediaId.trim()) {
    return null;
  }
  const pageSize = 60;
  let offset = 0;
  for (let page = 0; page < 5; page += 1) {
    const response = await fetchWorkspaceMediaList(token, workspaceId, {
      limit: pageSize,
      offset,
    });
    const match = response.media.find((item) => item.media_id === mediaId);
    if (match?.public_url?.trim()) {
      return match.public_url.trim();
    }
    offset += response.count || pageSize;
    if (offset >= response.total || response.count === 0) {
      break;
    }
  }
  return null;
}

interface ScheduledPostEditorLoadedProps {
  initialScheduled: UnifiedScheduledPostItemJson;
  actionCallbacks: {
    onAfterClose?: () => void;
    onUpdateSuccess?: () => void;
    onRescheduleSuccess?: () => void;
    onPublishSuccess?: () => void;
    onDeleteSuccess?: () => void;
    onMoveToDraftSuccess?: () => void;
  };
  onBusyOverlayChange?: (
    s: ScheduledPostEditorModalBusyOverlay | { active: false },
  ) => void;
}

export function ScheduledPostEditorLoaded({
  initialScheduled,
  actionCallbacks,
  onBusyOverlayChange,
}: ScheduledPostEditorLoadedProps): ReactElement {
  const { t } = useTranslations();
  const channelLabels = useDraftChannelLabels();
  const { unifiedProfiles } = useWorkspaceHeaderAccounts();
  const [accountPickerOpen, setAccountPickerOpen] = useState(false);
  const [item, setItem] = useState(initialScheduled);
  const [caption, setCaption] = useState(() =>
    captionFromItem(initialScheduled),
  );
  const [youtubeTitle, setYoutubeTitle] = useState(() =>
    youtubeTitleFromItem(initialScheduled),
  );
  const [pinterestTitle, setPinterestTitle] = useState(() =>
    fieldFromItem(initialScheduled, ["title", "pinterest_text"]),
  );
  const [pinterestDescription, setPinterestDescription] = useState(() =>
    fieldFromItem(initialScheduled, ["description", "pinterest_description"]),
  );
  const [pinterestAltText, setPinterestAltText] = useState(() =>
    fieldFromItem(initialScheduled, ["pinterest_alt_text", "alt_text"]),
  );
  const [tiktokTitle, setTiktokTitle] = useState(() =>
    fieldFromItem(initialScheduled, ["tiktok_title", "title"]),
  );
  const [tiktokPrivacyLevel, setTiktokPrivacyLevel] = useState(() =>
    fieldFromItem(initialScheduled, ["privacy_level"]) || "PUBLIC_TO_EVERYONE",
  );
  const [tiktokDisableComment, setTiktokDisableComment] = useState(() =>
    boolFieldFromItem(initialScheduled, "disable_comment"),
  );
  const [tiktokAutoAddMusic, setTiktokAutoAddMusic] = useState(() =>
    boolFieldFromItem(initialScheduled, "auto_add_music"),
  );
  const [tiktokBrandContent, setTiktokBrandContent] = useState(() =>
    boolFieldFromItem(initialScheduled, "brand_content_toggle"),
  );
  const [tiktokBrandOrganic, setTiktokBrandOrganic] = useState(() =>
    boolFieldFromItem(initialScheduled, "brand_organic_toggle"),
  );
  const [facebookLinkUrl, setFacebookLinkUrl] = useState(() =>
    fieldFromItem(initialScheduled, ["link_url", "link"]),
  );
  const [youtubePlaylistId, setYoutubePlaylistId] = useState(() =>
    fieldFromItem(initialScheduled, ["youtube_playlist_id"]),
  );
  const [youtubeMadeForKids, setYoutubeMadeForKids] = useState(() =>
    boolFieldFromItem(initialScheduled, "self_declared_made_for_kids"),
  );
  const [instagramCaption, setInstagramCaption] = useState(() =>
    fieldFromItem(initialScheduled, ["instagram_text"]),
  );
  const [instagramShareToFeed, setInstagramShareToFeed] = useState(() =>
    initialScheduled.post_data?.share_to_feed !== false,
  );
  const [threadsCaption, setThreadsCaption] = useState(() =>
    fieldFromItem(initialScheduled, ["threads_text"]),
  );
  const [blueskyCaption, setBlueskyCaption] = useState(() =>
    fieldFromItem(initialScheduled, ["bluesky_text"]),
  );
  const [mastodonCaption, setMastodonCaption] = useState(() =>
    fieldFromItem(initialScheduled, ["mastodon_text"]),
  );
  const [mastodonVisibility, setMastodonVisibility] = useState(() =>
    fieldFromItem(initialScheduled, ["visibility"]) || "public",
  );
  const [mastodonAltText, setMastodonAltText] = useState(() =>
    fieldFromItem(initialScheduled, ["alt_text"]),
  );
  const [resolvedThumbnailUrl, setResolvedThumbnailUrl] = useState<string | null>(null);
  const [expandedField, setExpandedField] = useState<{ id: string; value: string; label: string; maxLength?: number } | null>(null);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const captionMaxLength = composerMainTextLimitForPlatform(item.platform);
  const platformKey = item.platform?.trim().toLowerCase();
  const isYoutube = platformKey === "youtube";
  const isPinterest = platformKey === "pinterest";
  const isTiktok = platformKey === "tiktok";
  const isFacebook = platformKey === "facebook";
  const isLinkedin = platformKey === "linkedin";
  const isInstagram = platformKey === "instagram";
  const isThreads = platformKey === "threads";
  const isBluesky = platformKey === "bluesky";
  const isMastodon = platformKey === "mastodon";
  const [linkedinVisibility, setLinkedinVisibility] = useState(() =>
    fieldFromItem(initialScheduled, ["visibility"]) || "PUBLIC",
  );
  const isVideoPost =
    (item.post_type ?? "").trim().toLowerCase() === "video" ||
    Boolean(fieldFromItem(item, ["video_id", "video_url"]));
  const allowMediaTypeSwap =
    isFacebook ||
    isInstagram ||
    isLinkedin ||
    isThreads ||
    isBluesky ||
    isMastodon ||
    isTiktok ||
    isPinterest;
  const youtubeChannelId = isYoutube ? item.platform_user_id?.trim() || null : null;
  const { playlists: youtubePlaylists } =
    useActiveWorkspaceYoutubePlaylists(youtubeChannelId);
  const youtubePlaylistOptions = useMemo(() => {
    const selectedId = youtubePlaylistId.trim();
    if (
      !selectedId ||
      youtubePlaylists.some((playlist) => playlist.id === selectedId)
    ) {
      return youtubePlaylists;
    }
    return [{ id: selectedId, name: selectedId }, ...youtubePlaylists];
  }, [youtubePlaylistId, youtubePlaylists]);
  const handleCaptionChange = (next: string): void => {
    setCaption(capMainTextForPlatform(next, item.platform));
  };

  useEffect(() => {
    // Editor state must reset when the modal switches to a different scheduled post.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItem(initialScheduled);
    setCaption(captionFromItem(initialScheduled));
    setYoutubeTitle(youtubeTitleFromItem(initialScheduled));
    setPinterestTitle(fieldFromItem(initialScheduled, ["title", "pinterest_text"]));
    setPinterestDescription(fieldFromItem(initialScheduled, ["description", "pinterest_description"]));
    setPinterestAltText(fieldFromItem(initialScheduled, ["pinterest_alt_text", "alt_text"]));
    setLinkedinVisibility(fieldFromItem(initialScheduled, ["visibility"]) || "PUBLIC");
    setTiktokTitle(fieldFromItem(initialScheduled, ["tiktok_title", "title"]));
    setTiktokPrivacyLevel(
      fieldFromItem(initialScheduled, ["privacy_level"]) || "PUBLIC_TO_EVERYONE",
    );
    setTiktokDisableComment(boolFieldFromItem(initialScheduled, "disable_comment"));
    setTiktokAutoAddMusic(boolFieldFromItem(initialScheduled, "auto_add_music"));
    setTiktokBrandContent(boolFieldFromItem(initialScheduled, "brand_content_toggle"));
    setTiktokBrandOrganic(boolFieldFromItem(initialScheduled, "brand_organic_toggle"));
    setFacebookLinkUrl(fieldFromItem(initialScheduled, ["link_url", "link"]));
    setYoutubePlaylistId(fieldFromItem(initialScheduled, ["youtube_playlist_id"]));
    setYoutubeMadeForKids(
      boolFieldFromItem(initialScheduled, "self_declared_made_for_kids"),
    );
    setInstagramCaption(fieldFromItem(initialScheduled, ["instagram_text"]));
    setInstagramShareToFeed(initialScheduled.post_data?.share_to_feed !== false);
    setThreadsCaption(fieldFromItem(initialScheduled, ["threads_text"]));
    setBlueskyCaption(fieldFromItem(initialScheduled, ["bluesky_text"]));
    setMastodonCaption(fieldFromItem(initialScheduled, ["mastodon_text"]));
    setMastodonVisibility(fieldFromItem(initialScheduled, ["visibility"]) || "public");
    setMastodonAltText(fieldFromItem(initialScheduled, ["alt_text"]));
  }, [initialScheduled]);

  const draft = scheduledPostToSyntheticDraft(item);
  const thumbnailMediaId = fieldFromItem(item, ["thumbnail_image_id"]);
  const thumbnailDraft = youtubeThumbnailDraftFromItem(item, resolvedThumbnailUrl);

  useEffect(() => {
    const directUrl = fieldFromItem(item, ["thumbnail_url"]);
    if (directUrl || !thumbnailMediaId) {
      // Clear stale resolved preview when switching to a post with no resolvable thumbnail ID.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResolvedThumbnailUrl(null);
      return;
    }
    let cancelled = false;
    void resolveMediaPublicUrlById(thumbnailMediaId)
      .then((url) => {
        if (!cancelled) {
          setResolvedThumbnailUrl(url);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setResolvedThumbnailUrl(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [item, thumbnailMediaId]);
  const platformPostDataPatch = useMemo<Record<string, unknown> | undefined>(() => {
    const cleanCaption = caption.trim();
    if (isYoutube) {
      const cleanTitle = youtubeTitle.trim();
      return {
        youtube_title: cleanTitle,
        title: cleanTitle,
        youtube_description: cleanCaption,
        default_text: cleanCaption,
        youtube_playlist_id: youtubePlaylistId.trim() || undefined,
        self_declared_made_for_kids: youtubeMadeForKids,
      };
    }
    if (isPinterest) {
      const cleanTitle = pinterestTitle.trim();
      return {
        title: cleanTitle,
        default_text: cleanTitle || cleanCaption,
        description: pinterestDescription.trim() || cleanCaption,
        pinterest_description: pinterestDescription.trim() || cleanCaption,
        pinterest_alt_text: pinterestAltText.trim(),
      };
    }
    if (isTiktok) {
      return {
        tiktok_title: tiktokTitle.trim(),
        default_text: cleanCaption,
        privacy_level: tiktokPrivacyLevel,
        disable_comment: tiktokDisableComment,
        auto_add_music: tiktokAutoAddMusic,
        brand_content_toggle: tiktokBrandContent,
        brand_organic_toggle: tiktokBrandOrganic,
      };
    }
    if (isFacebook) {
      const patch: Record<string, unknown> = {};
      if (facebookLinkUrl.trim()) {
        patch.link_url = facebookLinkUrl.trim();
        patch.link = facebookLinkUrl.trim();
      }
      return Object.keys(patch).length > 0 ? patch : undefined;
    }
    if (isLinkedin) {
      return {
        visibility: linkedinVisibility,
      };
    }
    if (isInstagram) {
      return {
        instagram_text: instagramCaption.trim(),
        share_to_feed: instagramShareToFeed,
      };
    }
    if (isThreads) {
      return {
        threads_text: threadsCaption.trim(),
      };
    }
    if (isBluesky) {
      return {
        bluesky_text: blueskyCaption.trim(),
      };
    }
    if (isMastodon) {
      return {
        mastodon_text: mastodonCaption.trim(),
        visibility: mastodonVisibility,
        alt_text: mastodonAltText.trim(),
      };
    }
    return undefined;
  }, [
    blueskyCaption,
    caption,
    facebookLinkUrl,
    instagramCaption,
    instagramShareToFeed,
    isBluesky,
    isFacebook,
    isInstagram,
    isLinkedin,
    isMastodon,
    isPinterest,
    isThreads,
    isTiktok,
    isYoutube,
    linkedinVisibility,
    mastodonAltText,
    mastodonCaption,
    mastodonVisibility,
    pinterestTitle,
    pinterestDescription,
    pinterestAltText,
    threadsCaption,
    tiktokAutoAddMusic,
    tiktokBrandContent,
    tiktokBrandOrganic,
    tiktokDisableComment,
    tiktokPrivacyLevel,
    tiktokTitle,
    youtubeMadeForKids,
    youtubePlaylistId,
    youtubeTitle,
  ]);
  const baselineScheduleIsoUtc = useMemo(
    () => scheduledPostTimeAsIsoUtc(initialScheduled),
    [initialScheduled],
  );
  const [selectedIsoUtc, setSelectedIsoUtc] = useState<string | null>(
    () => baselineScheduleIsoUtc,
  );
  useEffect(() => {
    setSelectedIsoUtc(baselineScheduleIsoUtc);
  }, [baselineScheduleIsoUtc]);
  const timeChanged = selectedIsoUtc !== baselineScheduleIsoUtc;

  const baselineCaption = useMemo(
    () => captionFromItem(initialScheduled),
    [initialScheduled],
  );
  const baselineMediaKey = useMemo(() => {
    const pd = initialScheduled.post_data ?? {};
    return [
      stringField(pd, ["default_image_id", "image_id"]),
      stringField(pd, ["default_image_url", "image_url", "media_url"]),
      stringField(pd, ["video_id"]),
      stringField(pd, ["video_url"]),
      stringField(pd, ["thumbnail_image_id"]),
      stringField(pd, ["thumbnail_url"]),
    ].join("\u0000");
  }, [initialScheduled]);
  const currentMediaKey = useMemo(() => {
    const pd = item.post_data ?? {};
    return [
      stringField(pd, ["default_image_id", "image_id"]),
      stringField(pd, ["default_image_url", "image_url", "media_url"]),
      stringField(pd, ["video_id"]),
      stringField(pd, ["video_url"]),
      stringField(pd, ["thumbnail_image_id"]),
      stringField(pd, ["thumbnail_url"]),
    ].join("\u0000");
  }, [item]);

  const contentDirty = useMemo(() => {
    if (caption !== baselineCaption) {
      return true;
    }
    if (currentMediaKey !== baselineMediaKey) {
      return true;
    }
    if (isYoutube) {
      if (youtubeTitle !== youtubeTitleFromItem(initialScheduled)) return true;
      if (youtubePlaylistId !== fieldFromItem(initialScheduled, ["youtube_playlist_id"])) {
        return true;
      }
      if (
        youtubeMadeForKids !==
        boolFieldFromItem(initialScheduled, "self_declared_made_for_kids")
      ) {
        return true;
      }
    }
    if (isPinterest) {
      if (
        pinterestTitle !==
        fieldFromItem(initialScheduled, ["title", "pinterest_text"])
      ) {
        return true;
      }
      if (
        pinterestDescription !==
        fieldFromItem(initialScheduled, ["description", "pinterest_description"])
      ) {
        return true;
      }
      if (
        pinterestAltText !==
        fieldFromItem(initialScheduled, ["pinterest_alt_text", "alt_text"])
      ) {
        return true;
      }
    }
    if (isTiktok) {
      if (tiktokTitle !== fieldFromItem(initialScheduled, ["tiktok_title", "title"])) {
        return true;
      }
      if (
        tiktokPrivacyLevel !==
        (fieldFromItem(initialScheduled, ["privacy_level"]) || "PUBLIC_TO_EVERYONE")
      ) {
        return true;
      }
      if (
        tiktokDisableComment !== boolFieldFromItem(initialScheduled, "disable_comment")
      ) {
        return true;
      }
      if (
        tiktokAutoAddMusic !== boolFieldFromItem(initialScheduled, "auto_add_music")
      ) {
        return true;
      }
      if (
        tiktokBrandContent !==
        boolFieldFromItem(initialScheduled, "brand_content_toggle")
      ) {
        return true;
      }
      if (
        tiktokBrandOrganic !==
        boolFieldFromItem(initialScheduled, "brand_organic_toggle")
      ) {
        return true;
      }
    }
    if (isFacebook) {
      if (
        facebookLinkUrl !== fieldFromItem(initialScheduled, ["link_url", "link"])
      ) {
        return true;
      }
    }
    if (isLinkedin) {
      if (
        linkedinVisibility !==
        (fieldFromItem(initialScheduled, ["visibility"]) || "PUBLIC")
      ) {
        return true;
      }
    }
    if (isInstagram) {
      if (
        instagramCaption !== fieldFromItem(initialScheduled, ["instagram_text"])
      ) {
        return true;
      }
      if (
        instagramShareToFeed !==
        (initialScheduled.post_data?.share_to_feed !== false)
      ) {
        return true;
      }
    }
    if (isThreads) {
      if (threadsCaption !== fieldFromItem(initialScheduled, ["threads_text"])) {
        return true;
      }
    }
    if (isBluesky) {
      if (blueskyCaption !== fieldFromItem(initialScheduled, ["bluesky_text"])) {
        return true;
      }
    }
    if (isMastodon) {
      if (mastodonCaption !== fieldFromItem(initialScheduled, ["mastodon_text"])) {
        return true;
      }
      if (
        mastodonVisibility !==
        (fieldFromItem(initialScheduled, ["visibility"]) || "public")
      ) {
        return true;
      }
      if (mastodonAltText !== fieldFromItem(initialScheduled, ["alt_text"])) {
        return true;
      }
    }
    return false;
  }, [
    baselineCaption,
    baselineMediaKey,
    blueskyCaption,
    caption,
    currentMediaKey,
    facebookLinkUrl,
    initialScheduled,
    instagramCaption,
    instagramShareToFeed,
    isBluesky,
    isFacebook,
    isInstagram,
    isLinkedin,
    isMastodon,
    isPinterest,
    isThreads,
    isTiktok,
    isYoutube,
    linkedinVisibility,
    mastodonAltText,
    mastodonCaption,
    mastodonVisibility,
    pinterestAltText,
    pinterestDescription,
    pinterestTitle,
    threadsCaption,
    tiktokAutoAddMusic,
    tiktokBrandContent,
    tiktokBrandOrganic,
    tiktokDisableComment,
    tiktokPrivacyLevel,
    tiktokTitle,
    youtubeMadeForKids,
    youtubePlaylistId,
    youtubeTitle,
  ]);
  const { toast, toastKey, dismissToast, showToast } =
    useDraftActionSuccessToast();
  const {
    confirm,
    modalCopy,
    close,
    requestUpdateScheduled,
    requestPublish,
    requestDeleteScheduled,
    requestReschedule,
    requestReplaceImage,
    requestReplaceImageUrl,
    requestMoveToDraft,
  } = useDraftEditorConfirmFlow();

  const { isSaving, isPublishing, actionError, save, publish, remove, moveToDraft, changeAccount } =
    useScheduledPostEditorActions(
      item.scheduled_post_id,
      caption,
      item,
      setItem,
      platformPostDataPatch,
      {
        onAfterClose: actionCallbacks.onAfterClose,
        onPublishSuccess: actionCallbacks.onPublishSuccess,
        onMoveToDraftSuccess: actionCallbacks.onMoveToDraftSuccess,
        onDeleteSuccess: actionCallbacks.onDeleteSuccess,
      },
    );

  const {
    mediaBusy,
    mediaError,
    scheduleBusy,
    scheduleError,
    reschedulePost,
    changeMediaFromFile,
    changeMediaFromUrl,
  } = useScheduledPostEditorScheduleAndImage(
    item.scheduled_post_id,
    item,
    setItem,
    { onRescheduleSuccess: actionCallbacks.onRescheduleSuccess },
  );

  useEffect(() => {
    const busy = isSaving || isPublishing || scheduleBusy || mediaBusy;
    if (!busy) {
      onBusyOverlayChange?.({ active: false });
      return;
    }
    if (isPublishing) {
      onBusyOverlayChange?.({ active: true, mode: "publish" });
      return;
    }
    if (scheduleBusy) {
      onBusyOverlayChange?.({ active: true, mode: "schedule" });
      return;
    }
    if (mediaBusy) {
      onBusyOverlayChange?.({ active: true, mode: "media" });
      return;
    }
    onBusyOverlayChange?.({ active: true, mode: "save" });
  }, [
    isSaving,
    isPublishing,
    scheduleBusy,
    mediaBusy,
    onBusyOverlayChange,
  ]);

  const runConfirmedAction = (): void => {
    if (!confirm) {
      return;
    }
    const state = confirm;
    close();
    switch (state.kind) {
      case "update":
      case "delete":
      case "schedule":
        return;
      case "updateScheduled":
        void (async (): Promise<void> => {
          const ok = await save();
          if (ok) {
            if (actionCallbacks.onUpdateSuccess) {
              actionCallbacks.onUpdateSuccess();
            } else {
              showToast(
                t("content.toastSaved"),
                t("content.toastScheduledUpdatedHint"),
              );
            }
          }
        })();
        return;
      case "publish":
        void publish();
        return;
      case "deleteScheduled":
        void remove();
        return;
      case "reschedule":
        void (async (): Promise<void> => {
          if (contentDirty) {
            const ok = await save();
            if (!ok) {
              return;
            }
          }
          void reschedulePost(state.isoUtc);
        })();
        return;
      case "replaceImage":
        void changeMediaFromFile(state.file, state.mediaKind);
        return;
      case "replaceImageUrl":
        void changeMediaFromUrl(state.url, state.mediaId, state.mediaKind);
        return;
      case "moveToDraft":
        void moveToDraft();
        return;
    }
  };

  const handleAccountSelect = (row: WorkspaceHeaderAccountRow): void => {
    const dest = resolvePostingDestinationFromHeaderAccount(row, unifiedProfiles);
    void changeAccount(dest);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-0">
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pr-0.5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <DraftEditorDraftSummary
              draft={draft}
              accountLabel={formatDraftAccountSummaryLabel(draft, channelLabels)}
              onPickImage={requestReplaceImage}
              onPickLibraryImage={requestReplaceImageUrl}
              videoChangeEnabled
              allowMediaTypeSwap={allowMediaTypeSwap}
              mediaBusy={mediaBusy}
              mediaError={null}
              disabled={isSaving}
              compact
              hideMedia
              onEditAccount={() => setAccountPickerOpen(true)}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:items-start">
          <DraftEditorDraftSummary
            draft={draft}
            accountLabel={formatDraftAccountSummaryLabel(draft, channelLabels)}
            onPickImage={requestReplaceImage}
            onPickLibraryImage={requestReplaceImageUrl}
            videoChangeEnabled
            allowMediaTypeSwap={allowMediaTypeSwap}
            mediaBusy={mediaBusy}
            mediaError={mediaError}
            disabled={isSaving}
            compact
            hideAccount
          />
          <DraftEditorCaptionField
            caption={caption}
            onCaptionChange={handleCaptionChange}
            maxLength={captionMaxLength}
            compact
          />
        </div>

        <div className="relative flex items-center justify-between rounded-xl border border-outline-variant/15 bg-surface-container-low/40 px-3 py-2">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">
              Scheduled time
            </label>
            {selectedIsoUtc ? (
              <time className="text-sm font-medium text-on-surface">
                {new Date(selectedIsoUtc).toLocaleString()}
              </time>
            ) : (
              <span className="text-sm text-on-surface-variant">No time set</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setTimePickerOpen(true)}
            disabled={isSaving}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-outline-variant/20 text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface disabled:opacity-60"
            aria-label="Edit scheduled time"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
        </div>

        <ContentManagerScheduledDateTimePickerModal
          open={timePickerOpen}
          day={selectedIsoUtc ? new Date(selectedIsoUtc) : new Date()}
          now={new Date()}
          initialValue={selectedIsoUtc ? new Date(selectedIsoUtc) : null}
          onClose={() => setTimePickerOpen(false)}
          onConfirm={(at) => {
            setSelectedIsoUtc(at.toISOString());
            setTimePickerOpen(false);
          }}
        />

        {isYoutube || isPinterest || isTiktok || isInstagram || isThreads || isBluesky || isMastodon || isLinkedin || (isFacebook && facebookLinkUrl) ? (
          <details className="group rounded-xl border border-outline-variant/15 bg-surface-container-low/40">
            <summary className="cursor-pointer list-none px-3 py-2 text-xs font-bold uppercase tracking-wide text-on-surface-variant marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="inline-flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] transition-transform group-open:rotate-90">
                  chevron_right
                </span>
                Optional settings
              </span>
            </summary>
            <div className="space-y-3 border-t border-outline-variant/10 px-3 py-3">
              {isYoutube ? (
                <div className="space-y-2">
                  <label
                    htmlFor="scheduled-youtube-title"
                    className="block text-xs font-medium text-on-surface"
                  >
                    YouTube title
                  </label>
                  <input
                    id="scheduled-youtube-title"
                    value={youtubeTitle}
                    maxLength={100}
                    disabled={isSaving}
                    onChange={(e) => {
                      setYoutubeTitle(e.target.value.slice(0, 100));
                    }}
                    className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2 text-sm text-on-surface outline-none transition focus:border-primary/60 focus:ring-1 focus:ring-primary/20 disabled:opacity-60"
                    placeholder="Add a YouTube title"
                  />
                  <p className="text-right text-[11px] text-on-surface-variant">
                    {youtubeTitle.length} / 100
                  </p>
                </div>
              ) : null}

              {isYoutube ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label
                      htmlFor="scheduled-youtube-playlist"
                      className="block text-xs font-medium text-on-surface"
                    >
                      YouTube playlist
                    </label>
                    <select
                      id="scheduled-youtube-playlist"
                      value={youtubePlaylistId}
                      disabled={isSaving}
                      onChange={(e) => {
                        setYoutubePlaylistId(e.target.value);
                      }}
                      className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2 text-sm text-on-surface outline-none transition focus:border-primary/60 focus:ring-1 focus:ring-primary/20 disabled:opacity-60"
                    >
                      <option value="">No playlist</option>
                      {youtubePlaylistOptions.map((playlist) => (
                        <option key={playlist.id} value={playlist.id}>
                          {playlist.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <label className="flex items-center gap-2 rounded-xl border border-outline-variant/15 bg-surface-container-low px-3 py-2 text-xs font-medium text-on-surface">
                    <input
                      type="checkbox"
                      checked={youtubeMadeForKids}
                      disabled={isSaving}
                      onChange={(e) => {
                        setYoutubeMadeForKids(e.target.checked);
                      }}
                      className="size-3.5 accent-primary"
                    />
                    Made for kids
                  </label>
                </div>
              ) : null}

              {isPinterest ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label
                      htmlFor="scheduled-pinterest-title"
                      className="block text-xs font-medium text-on-surface"
                    >
                      Pinterest title
                    </label>
                    <input
                      id="scheduled-pinterest-title"
                      value={pinterestTitle}
                      maxLength={100}
                      disabled={isSaving}
                      onChange={(e) => {
                        setPinterestTitle(e.target.value.slice(0, 100));
                      }}
                      className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2 text-sm text-on-surface outline-none transition focus:border-primary/60 focus:ring-1 focus:ring-primary/20 disabled:opacity-60"
                      placeholder="Add a Pinterest title"
                    />
                    <p className="text-right text-[11px] text-on-surface-variant">
                      {pinterestTitle.length} / 100
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="scheduled-pinterest-description"
                        className="block text-xs font-medium text-on-surface"
                      >
                        Pinterest description
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedField({
                            id: "pinterest-description",
                            value: pinterestDescription,
                            label: "Pinterest description",
                          })
                        }
                        disabled={isSaving}
                        className="flex h-5 w-5 items-center justify-center rounded text-on-surface-variant transition hover:text-on-surface disabled:opacity-60"
                        title="Expand to edit"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          open_in_new
                        </span>
                      </button>
                    </div>
                    <textarea
                      id="scheduled-pinterest-description"
                      value={pinterestDescription}
                      disabled={isSaving}
                      onChange={(e) => {
                        setPinterestDescription(e.target.value);
                      }}
                      className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2 text-sm text-on-surface outline-none transition focus:border-primary/60 focus:ring-1 focus:ring-primary/20 disabled:opacity-60"
                      placeholder="Add a pin description"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="scheduled-pinterest-alttext"
                      className="block text-xs font-medium text-on-surface"
                    >
                      Image alt text
                    </label>
                    <textarea
                      id="scheduled-pinterest-alttext"
                      value={pinterestAltText}
                      maxLength={500}
                      disabled={isSaving}
                      onChange={(e) => {
                        setPinterestAltText(e.target.value.slice(0, 500));
                      }}
                      className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2 text-sm text-on-surface outline-none transition focus:border-primary/60 focus:ring-1 focus:ring-primary/20 disabled:opacity-60"
                      placeholder="Describe the image for accessibility"
                      rows={2}
                    />
                    <p className="text-right text-[11px] text-on-surface-variant">
                      {pinterestAltText.length} / 500
                    </p>
                  </div>
                </div>
              ) : null}

              {isTiktok ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label
                      htmlFor="scheduled-tiktok-title"
                      className="block text-xs font-medium text-on-surface"
                    >
                      TikTok photo title
                    </label>
                    <input
                      id="scheduled-tiktok-title"
                      value={tiktokTitle}
                      maxLength={90}
                      disabled={isSaving}
                      onChange={(e) => {
                        setTiktokTitle(e.target.value.slice(0, 90));
                      }}
                      className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2 text-sm text-on-surface outline-none transition focus:border-primary/60 focus:ring-1 focus:ring-primary/20 disabled:opacity-60"
                      placeholder="Optional photo title"
                    />
                    <p className="text-right text-[11px] text-on-surface-variant">
                      {tiktokTitle.length} / 90
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="scheduled-tiktok-privacy"
                      className="block text-xs font-medium text-on-surface"
                    >
                      TikTok privacy
                    </label>
                    <select
                      id="scheduled-tiktok-privacy"
                      value={tiktokPrivacyLevel}
                      disabled={isSaving}
                      onChange={(e) => {
                        setTiktokPrivacyLevel(e.target.value);
                      }}
                      className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2 text-sm text-on-surface outline-none transition focus:border-primary/60 focus:ring-1 focus:ring-primary/20 disabled:opacity-60"
                    >
                      <option value="PUBLIC_TO_EVERYONE">Public</option>
                      <option value="MUTUAL_FOLLOW_FRIENDS">Friends</option>
                      <option value="SELF_ONLY">Only me</option>
                    </select>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {[
                      ["Disable comments", tiktokDisableComment, setTiktokDisableComment],
                      ["Auto add music", tiktokAutoAddMusic, setTiktokAutoAddMusic],
                      ["Branded content", tiktokBrandContent, setTiktokBrandContent],
                      ["Brand organic", tiktokBrandOrganic, setTiktokBrandOrganic],
                    ].map(([label, checked, setter]) => (
                      <label
                        key={label as string}
                        className="flex items-center gap-2 rounded-lg border border-outline-variant/15 bg-surface-container-low px-2.5 py-1.5 text-[11px] font-bold text-on-surface"
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(checked)}
                          disabled={isSaving}
                          onChange={(e) => {
                            (setter as (value: boolean) => void)(e.target.checked);
                          }}
                          className="size-3.5 accent-primary"
                        />
                        {label as string}
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}

              {isFacebook && facebookLinkUrl ? (
                <div className="space-y-2">
                  <label
                    htmlFor="scheduled-facebook-link"
                    className="block text-xs font-medium text-on-surface"
                  >
                    Facebook link URL
                  </label>
                  <input
                    id="scheduled-facebook-link"
                    value={facebookLinkUrl}
                    disabled={isSaving}
                    onChange={(e) => {
                      setFacebookLinkUrl(e.target.value);
                    }}
                    className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2 text-sm text-on-surface outline-none transition focus:border-primary/60 focus:ring-1 focus:ring-primary/20 disabled:opacity-60"
                    placeholder="https://example.com"
                  />
                </div>
              ) : null}

              {isInstagram ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label
                      htmlFor="scheduled-instagram-caption"
                      className="block text-xs font-medium text-on-surface"
                    >
                      Instagram caption
                    </label>
                    <input
                      id="scheduled-instagram-caption"
                      value={instagramCaption}
                      maxLength={2200}
                      disabled={isSaving}
                      onChange={(e) => {
                        setInstagramCaption(e.target.value.slice(0, 2200));
                      }}
                      className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2 text-sm text-on-surface outline-none transition focus:border-primary/60 focus:ring-1 focus:ring-primary/20 disabled:opacity-60"
                      placeholder="Add Instagram caption"
                    />
                    <p className="text-right text-[11px] text-on-surface-variant">
                      {instagramCaption.length} / 2200
                    </p>
                  </div>
                  <label className="flex items-center gap-2 rounded-xl border border-outline-variant/15 bg-surface-container-low px-3 py-2 text-xs font-medium text-on-surface">
                    <input
                      type="checkbox"
                      checked={instagramShareToFeed}
                      disabled={isSaving}
                      onChange={(e) => {
                        setInstagramShareToFeed(e.target.checked);
                      }}
                      className="size-3.5 accent-primary"
                    />
                    Share to feed (Reels)
                  </label>
                </div>
              ) : null}

              {isThreads ? (
                <div className="space-y-2">
                  <label
                    htmlFor="scheduled-threads-caption"
                    className="block text-xs font-medium text-on-surface"
                  >
                    Threads caption
                  </label>
                  <textarea
                    id="scheduled-threads-caption"
                    value={threadsCaption}
                    maxLength={500}
                    disabled={isSaving}
                    onChange={(e) => {
                      setThreadsCaption(e.target.value.slice(0, 500));
                    }}
                    className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2 text-sm text-on-surface outline-none transition focus:border-primary/60 focus:ring-1 focus:ring-primary/20 disabled:opacity-60"
                    placeholder="Add Threads caption"
                    rows={3}
                  />
                  <p className="text-right text-[11px] text-on-surface-variant">
                    {threadsCaption.length} / 500
                  </p>
                </div>
              ) : null}

              {isBluesky ? (
                <div className="space-y-2">
                  <label
                    htmlFor="scheduled-bluesky-caption"
                    className="block text-xs font-medium text-on-surface"
                  >
                    Bluesky caption
                  </label>
                  <textarea
                    id="scheduled-bluesky-caption"
                    value={blueskyCaption}
                    maxLength={300}
                    disabled={isSaving}
                    onChange={(e) => {
                      setBlueskyCaption(e.target.value.slice(0, 300));
                    }}
                    className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2 text-sm text-on-surface outline-none transition focus:border-primary/60 focus:ring-1 focus:ring-primary/20 disabled:opacity-60"
                    placeholder="Add Bluesky caption"
                    rows={3}
                  />
                  <p className="text-right text-[11px] text-on-surface-variant">
                    {blueskyCaption.length} / 300
                  </p>
                </div>
              ) : null}

              {isMastodon ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label
                      htmlFor="scheduled-mastodon-caption"
                      className="block text-xs font-medium text-on-surface"
                    >
                      Mastodon caption
                    </label>
                    <textarea
                      id="scheduled-mastodon-caption"
                      value={mastodonCaption}
                      disabled={isSaving}
                      onChange={(e) => {
                        setMastodonCaption(e.target.value);
                      }}
                      className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2 text-sm text-on-surface outline-none transition focus:border-primary/60 focus:ring-1 focus:ring-primary/20 disabled:opacity-60"
                      placeholder="Add Mastodon caption"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="scheduled-mastodon-visibility"
                      className="block text-xs font-medium text-on-surface"
                    >
                      Visibility
                    </label>
                    <select
                      id="scheduled-mastodon-visibility"
                      value={mastodonVisibility}
                      disabled={isSaving}
                      onChange={(e) => {
                        setMastodonVisibility(e.target.value);
                      }}
                      className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2 text-sm text-on-surface outline-none transition focus:border-primary/60 focus:ring-1 focus:ring-primary/20 disabled:opacity-60"
                    >
                      <option value="public">Public</option>
                      <option value="unlisted">Unlisted</option>
                      <option value="private">Followers only</option>
                      <option value="direct">Direct</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="scheduled-mastodon-alttext"
                      className="block text-xs font-medium text-on-surface"
                    >
                      Image alt text
                    </label>
                    <textarea
                      id="scheduled-mastodon-alttext"
                      value={mastodonAltText}
                      maxLength={1500}
                      disabled={isSaving}
                      onChange={(e) => {
                        setMastodonAltText(e.target.value.slice(0, 1500));
                      }}
                      className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2 text-sm text-on-surface outline-none transition focus:border-primary/60 focus:ring-1 focus:ring-primary/20 disabled:opacity-60"
                      placeholder="Describe the image for accessibility"
                      rows={2}
                    />
                    <p className="text-right text-[11px] text-on-surface-variant">
                      {mastodonAltText.length} / 1500
                    </p>
                  </div>
                </div>
              ) : null}

              {isLinkedin ? (
                <div className="space-y-2">
                  <label
                    htmlFor="scheduled-linkedin-visibility"
                    className="block text-xs font-medium text-on-surface"
                  >
                    LinkedIn visibility
                  </label>
                  <select
                    id="scheduled-linkedin-visibility"
                    value={linkedinVisibility}
                    disabled={isSaving}
                    onChange={(e) => {
                      setLinkedinVisibility(e.target.value);
                    }}
                    className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2 text-sm text-on-surface outline-none transition focus:border-primary/60 focus:ring-1 focus:ring-primary/20 disabled:opacity-60"
                  >
                    <option value="PUBLIC">Public</option>
                    <option value="CONNECTIONS">Connections only</option>
                  </select>
                </div>
              ) : null}
            </div>
          </details>
        ) : null}

        {isYoutube ? (
          <details className="group rounded-xl border border-outline-variant/15 bg-surface-container-low/40">
            <summary className="cursor-pointer list-none px-3 py-2 text-xs font-bold uppercase tracking-wide text-on-surface-variant marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="inline-flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] transition-transform group-open:rotate-90">
                  chevron_right
                </span>
                YouTube thumbnail
              </span>
            </summary>
            <div className="border-t border-outline-variant/10 px-3 py-3">
              <DraftEditorDraftSummary
                draft={thumbnailDraft}
                accountLabel="Thumbnail"
                onPickImage={(file) => {
                  requestReplaceImage(file, "youtubeThumbnail");
                }}
                onPickLibraryImage={(url, name, mediaId) => {
                  requestReplaceImageUrl(url, name, mediaId, "youtubeThumbnail");
                }}
                mediaKindOverride="youtubeThumbnail"
                mediaBusy={mediaBusy}
                mediaError={mediaError}
                disabled={isSaving}
                compact
                hideAccount
              />
            </div>
          </details>
        ) : null}

        {isLinkedin && isVideoPost ? (
          <details className="group rounded-xl border border-outline-variant/15 bg-surface-container-low/40">
            <summary className="cursor-pointer list-none px-3 py-2 text-xs font-bold uppercase tracking-wide text-on-surface-variant marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="inline-flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] transition-transform group-open:rotate-90">
                  chevron_right
                </span>
                LinkedIn video thumbnail
              </span>
            </summary>
            <div className="border-t border-outline-variant/10 px-3 py-3">
              <DraftEditorDraftSummary
                draft={thumbnailDraft}
                accountLabel="Thumbnail"
                onPickImage={(file) => {
                  requestReplaceImage(file, "thumbnail");
                }}
                onPickLibraryImage={(url, name, mediaId) => {
                  requestReplaceImageUrl(url, name, mediaId, "thumbnail");
                }}
                mediaKindOverride="thumbnail"
                mediaBusy={mediaBusy}
                mediaError={mediaError}
                disabled={isSaving}
                compact
                hideAccount
              />
            </div>
          </details>
        ) : null}

        {actionError ? (
          <p
            className="rounded-xl border border-error/30 bg-error/10 px-3 py-2 text-xs text-error"
            role="alert"
          >
            {actionError}
          </p>
        ) : null}
      </div>

      <div className="shrink-0 border-t border-outline-variant/10 pt-3">
        <ScheduledPostPrimaryActions
          isSaving={isSaving}
          compact
          timeChanged={timeChanged}
          hasChanges={contentDirty}
          onUpdateClick={() => {
            if (timeChanged && selectedIsoUtc) {
              requestReschedule(selectedIsoUtc);
            } else {
              requestUpdateScheduled();
            }
          }}
          onPublishClick={() => {
            requestPublish(formatDraftPublishChannelLabel(draft, channelLabels));
          }}
          onDeleteClick={requestDeleteScheduled}
          onMoveToDraftClick={requestMoveToDraft}
        />
      </div>

      <DraftEditorActionConfirmModal
        open={confirm !== null && modalCopy !== null}
        title={modalCopy?.title ?? ""}
        description={modalCopy?.description ?? ""}
        confirmLabel={modalCopy?.confirmLabel ?? t("content.actionConfirm")}
        isDanger={modalCopy?.isDanger ?? false}
        isBusy={false}
        mediaPreviewUrl={
          confirm?.kind === "replaceImageUrl" ? confirm.url : null
        }
        mediaPreviewFile={
          confirm?.kind === "replaceImage" ? confirm.file : null
        }
        mediaPreviewIsVideo={
          confirm?.kind === "replaceImage" || confirm?.kind === "replaceImageUrl"
            ? confirm.mediaKind === "video"
            : false
        }
        onConfirm={runConfirmedAction}
        onCancel={close}
      />

      {!actionCallbacks.onUpdateSuccess && toast ? (
        <DraftEditorSuccessToast
          key={toastKey}
          title={toast.title}
          subtitle={toast.subtitle}
          onDismiss={dismissToast}
        />
      ) : null}

      <DraftEditorAccountPickerModal
        open={accountPickerOpen}
        currentPlatform={item.platform}
        currentPlatformUserId={item.platform_user_id}
        onClose={() => setAccountPickerOpen(false)}
        onSelect={handleAccountSelect}
        disabled={isSaving}
      />
    </div>
  );
}
