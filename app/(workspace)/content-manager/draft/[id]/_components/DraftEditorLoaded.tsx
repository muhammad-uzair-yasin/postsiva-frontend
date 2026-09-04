"use client";

import { useEffect, useMemo, useState } from "react";

import type { UnifiedDraftResponseJson } from "@/lib/social/unifiedDraftsApi";

import { useWorkspaceHeaderAccounts } from "@/app/(workspace)/_components/WorkspaceHeaderAccountsProvider";

import {
  getStoredAccessToken,
  getStoredActiveWorkspaceId,
} from "@/lib/auth/session";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { composerMainTextLimitForPlatform } from "@/lib/post-composer/composerMainTextCharLimits";
import { fetchWorkspaceMediaList } from "@/lib/social/unifiedMediaApi";
import {
  useDraftEditorConfirmFlow,
  type DraftEditorMediaKind,
} from "../_hooks/useDraftEditorConfirmFlow";
import { useDraftChannelLabels } from "../_hooks/useDraftChannelLabels";
import {
  formatDraftAccountSummaryLabel,
  formatDraftPublishChannelLabel,
} from "../_utils/formatDraftPublishChannelLabel";
import { useDraftActionSuccessToast } from "../_hooks/useDraftActionSuccessToast";
import { DraftEditorActionConfirmModal } from "./DraftEditorActionConfirmModal";
import { DraftEditorAccountPickerModal } from "./DraftEditorAccountPickerModal";
import { DraftEditorCaptionField } from "./DraftEditorCaptionField";
import { DraftEditorDraftSummary } from "./DraftEditorDraftSummary";
import { DraftEditorImageBlock } from "./DraftEditorImageBlock";
import { DraftEditorPrimaryActions } from "./DraftEditorPrimaryActions";
import { DraftEditorScheduleAndMedia } from "./DraftEditorScheduleAndMedia";
import { DraftEditorSuccessToast } from "./DraftEditorSuccessToast";
import { useActiveWorkspaceYoutubePlaylists } from "../../../../post-scheduler/_hooks/useActiveWorkspaceYoutubePlaylists";
import type { PostingDestinationFromHeaderAccount } from "@/lib/workspace/resolvePostingDestinationFromHeaderAccount";
import { resolvePostingDestinationFromHeaderAccount } from "@/lib/workspace/resolvePostingDestinationFromHeaderAccount";
import type { WorkspaceHeaderAccountRow } from "@/lib/workspace/headerAccountsTypes";

interface DraftEditorLoadedProps {
  draft: UnifiedDraftResponseJson;
  caption: string;
  onCaptionChange: (v: string) => void;
  actionError: string | null;
  isSaving: boolean;
  mediaBusy: boolean;
  mediaError: string | null;
  scheduleBusy: boolean;
  scheduleError: string | null;
  onPickMedia: (file: File, kind: DraftEditorMediaKind) => void;
  onPickLibraryMedia: (
    url: string,
    mediaId: string | null,
    kind: DraftEditorMediaKind,
  ) => void;
  onSchedule: (isoUtc: string) => void;
  onSave: (extraPostDataPatch?: Record<string, unknown>) => Promise<boolean>;
  onPublish: () => void;
  onRemove: () => void;
  /** Change posting destination (platform / account). */
  onChangeAccount?: (
    dest: PostingDestinationFromHeaderAccount,
  ) => Promise<boolean>;
  /** When set (e.g. modal), successful update calls this instead of inline toast — close editor and show toast at host. */
  onUpdateSuccess?: () => void;
  /** Match ScheduledPostEditorModal dense layout (Content Manager draft modal). */
  compact?: boolean;
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

export function DraftEditorLoaded({
  draft,
  caption,
  onCaptionChange,
  actionError,
  isSaving,
  mediaBusy,
  mediaError,
  scheduleBusy,
  scheduleError,
  onPickMedia,
  onPickLibraryMedia,
  onSchedule,
  onSave,
  onPublish,
  onRemove,
  onChangeAccount,
  onUpdateSuccess,
  compact = false,
}: DraftEditorLoadedProps): React.ReactElement {
  const { t } = useTranslations();
  const { unifiedProfiles } = useWorkspaceHeaderAccounts();
  const [accountPickerOpen, setAccountPickerOpen] = useState(false);
  const channelLabels = useDraftChannelLabels();
  const captionMaxLength = composerMainTextLimitForPlatform(draft.platform);
  const platformKey = draft.platform?.trim().toLowerCase();
  const isYoutube = platformKey === "youtube";
  const isPinterest = platformKey === "pinterest";
  const isTiktok = platformKey === "tiktok";
  const isFacebook = platformKey === "facebook";
  const isLinkedin = platformKey === "linkedin";
  const youtubeBlock = useMemo(
    () => (draft.youtube && typeof draft.youtube === "object" ? draft.youtube : {}),
    [draft.youtube],
  );
  const platformBlock = useMemo(() => {
    const value =
      platformKey === "pinterest"
        ? draft.pinterest
        : platformKey === "tiktok"
          ? draft.tiktok
          : platformKey === "facebook"
            ? draft.facebook
            : platformKey === "linkedin"
              ? draft.linkedin
              : null;
    return value && typeof value === "object" ? value : {};
  }, [draft.facebook, draft.linkedin, draft.pinterest, draft.tiktok, platformKey]);
  const postData = useMemo(
    () =>
      draft.post_data && typeof draft.post_data === "object"
        ? draft.post_data
        : {},
    [draft.post_data],
  );
  const stringField = (keys: readonly string[]): string => {
    for (const source of [postData, youtubeBlock, platformBlock]) {
      for (const key of keys) {
        const value = source[key];
        if (typeof value === "string" && value.trim()) {
          return value.trim();
        }
      }
    }
    return "";
  };
  const boolField = (key: string): boolean =>
    Boolean(postData[key] ?? youtubeBlock[key] ?? platformBlock[key]);
  const [youtubeTitle, setYoutubeTitle] = useState(() =>
    stringField(["youtube_title", "title"]),
  );
  const [youtubePlaylistId, setYoutubePlaylistId] = useState(() =>
    stringField(["youtube_playlist_id"]),
  );
  const youtubeChannelId = isYoutube ? draft.platform_user_id?.trim() || null : null;
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
  const [youtubeMadeForKids, setYoutubeMadeForKids] = useState(() =>
    boolField("self_declared_made_for_kids"),
  );
  const [pinterestTitle, setPinterestTitle] = useState(() =>
    stringField(["title", "pinterest_text"]),
  );
  const [tiktokTitle, setTiktokTitle] = useState(() =>
    stringField(["tiktok_title", "title"]),
  );
  const [tiktokPrivacyLevel, setTiktokPrivacyLevel] = useState(() =>
    stringField(["privacy_level"]) || "PUBLIC_TO_EVERYONE",
  );
  const [tiktokDisableComment, setTiktokDisableComment] = useState(() =>
    boolField("disable_comment"),
  );
  const [tiktokAutoAddMusic, setTiktokAutoAddMusic] = useState(() =>
    boolField("auto_add_music"),
  );
  const [tiktokBrandContent, setTiktokBrandContent] = useState(() =>
    boolField("brand_content_toggle"),
  );
  const [tiktokBrandOrganic, setTiktokBrandOrganic] = useState(() =>
    boolField("brand_organic_toggle"),
  );
  const [facebookLinkUrl, setFacebookLinkUrl] = useState(() =>
    stringField(["link_url", "link"]),
  );
  const [resolvedThumbnailUrl, setResolvedThumbnailUrl] = useState<string | null>(null);
  useEffect(() => {
    setYoutubeTitle(stringField(["youtube_title", "title"]));
    setYoutubePlaylistId(stringField(["youtube_playlist_id"]));
    setYoutubeMadeForKids(boolField("self_declared_made_for_kids"));
    setPinterestTitle(stringField(["title", "pinterest_text"]));
    setTiktokTitle(stringField(["tiktok_title", "title"]));
    setTiktokPrivacyLevel(stringField(["privacy_level"]) || "PUBLIC_TO_EVERYONE");
    setTiktokDisableComment(boolField("disable_comment"));
    setTiktokAutoAddMusic(boolField("auto_add_music"));
    setTiktokBrandContent(boolField("brand_content_toggle"));
    setTiktokBrandOrganic(boolField("brand_organic_toggle"));
    setFacebookLinkUrl(stringField(["link_url", "link"]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.id]);
  const platformSavePatch = useMemo<Record<string, unknown> | undefined>(() => {
    if (isYoutube) {
    const cleanTitle = youtubeTitle.trim();
    const cleanCaption = caption.trim();
    const youtube = {
      ...youtubeBlock,
      youtube_title: cleanTitle,
      title: cleanTitle,
      youtube_description: cleanCaption,
      youtube_playlist_id: youtubePlaylistId.trim() || undefined,
      self_declared_made_for_kids: youtubeMadeForKids,
    };
    return {
      youtube_title: cleanTitle,
      title: cleanTitle,
      youtube_description: cleanCaption,
      default_text: cleanCaption,
      youtube_playlist_id: youtubePlaylistId.trim() || undefined,
      self_declared_made_for_kids: youtubeMadeForKids,
      youtube,
    };
    }
    if (isPinterest) {
      const cleanTitle = pinterestTitle.trim();
      const cleanCaption = caption.trim();
      return {
        title: cleanTitle,
        default_text: cleanTitle || cleanCaption,
        description: cleanCaption,
        pinterest: {
          ...platformBlock,
          pinterest_text: cleanTitle,
          pinterest_description: cleanCaption,
        },
      };
    }
    if (isTiktok) {
      const cleanCaption = caption.trim();
      return {
        default_text: cleanCaption,
        tiktok_title: tiktokTitle.trim(),
        privacy_level: tiktokPrivacyLevel,
        disable_comment: tiktokDisableComment,
        auto_add_music: tiktokAutoAddMusic,
        brand_content_toggle: tiktokBrandContent,
        brand_organic_toggle: tiktokBrandOrganic,
        tiktok: {
          ...platformBlock,
          tiktok_text: cleanCaption,
          tiktok_title: tiktokTitle.trim(),
          privacy_level: tiktokPrivacyLevel,
          disable_comment: tiktokDisableComment,
          auto_add_music: tiktokAutoAddMusic,
          brand_content_toggle: tiktokBrandContent,
          brand_organic_toggle: tiktokBrandOrganic,
        },
      };
    }
    if (isFacebook && facebookLinkUrl.trim()) {
      return {
        link_url: facebookLinkUrl.trim(),
        link: facebookLinkUrl.trim(),
        facebook: {
          ...platformBlock,
          link_url: facebookLinkUrl.trim(),
        },
      };
    }
    return undefined;
  }, [
    caption,
    facebookLinkUrl,
    isFacebook,
    isPinterest,
    isTiktok,
    isYoutube,
    pinterestTitle,
    platformBlock,
    tiktokAutoAddMusic,
    tiktokBrandContent,
    tiktokBrandOrganic,
    tiktokDisableComment,
    tiktokPrivacyLevel,
    tiktokTitle,
    youtubeBlock,
    youtubeMadeForKids,
    youtubePlaylistId,
    youtubeTitle,
  ]);
  const thumbnailDraft: UnifiedDraftResponseJson = {
    ...draft,
    post_type: "image",
    default_image_id: stringField(["thumbnail_image_id"]) || null,
    default_image_url:
      stringField(["thumbnail_url"]) || resolvedThumbnailUrl || null,
    image_ids: [],
    image_urls: [],
    video_id: null,
    video_url: null,
  };
  const thumbnailMediaId = stringField(["thumbnail_image_id"]);
  useEffect(() => {
    const directUrl = stringField(["thumbnail_url"]);
    if (directUrl || !thumbnailMediaId) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.id, thumbnailMediaId]);
  const isVideoPost =
    (draft.post_type ?? "").trim().toLowerCase() === "video" ||
    Boolean(draft.video_id || draft.video_url);
  const { toast, toastKey, dismissToast, showToast } =
    useDraftActionSuccessToast();
  const {
    confirm,
    modalCopy,
    close,
    requestUpdate,
    requestPublish,
    requestDelete,
    requestSchedule,
    requestReplaceImage,
    requestReplaceImageUrl,
  } = useDraftEditorConfirmFlow();

  const runConfirmedAction = (): void => {
    if (!confirm) {
      return;
    }
    const state = confirm;
    close();
    switch (state.kind) {
      case "updateScheduled":
      case "deleteScheduled":
      case "reschedule":
      case "moveToDraft":
        return;
      case "update":
        void (async (): Promise<void> => {
          const ok = await onSave(platformSavePatch);
          if (ok) {
            if (onUpdateSuccess) {
              onUpdateSuccess();
            } else {
              showToast(t("content.toastSaved"), t("content.toastSavedHint"));
            }
          }
        })();
        return;
      case "publish":
        onPublish();
        return;
      case "delete":
        onRemove();
        return;
      case "schedule":
        onSchedule(state.isoUtc);
        return;
      case "replaceImage":
        onPickMedia(state.file, state.mediaKind);
        return;
      case "replaceImageUrl":
        onPickLibraryMedia(state.url, state.mediaId, state.mediaKind);
        return;
    }
  };

  const handleAccountSelect = (row: WorkspaceHeaderAccountRow): void => {
    if (!onChangeAccount) {
      return;
    }
    const dest = resolvePostingDestinationFromHeaderAccount(row, unifiedProfiles);
    void onChangeAccount(dest);
  };

  return (
    <div
      className={
        compact
          ? "flex min-h-0 flex-1 flex-col gap-0"
          : "space-y-6"
      }
    >
      {compact ? (
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pr-0.5">
          <DraftEditorDraftSummary
            draft={draft}
            accountLabel={formatDraftAccountSummaryLabel(draft, channelLabels)}
            onPickImage={requestReplaceImage}
            onPickLibraryImage={requestReplaceImageUrl}
            videoChangeEnabled
            mediaBusy={mediaBusy}
            mediaError={null}
            disabled={isSaving}
            compact
            hideMedia
            onEditAccount={
              onChangeAccount ? () => setAccountPickerOpen(true) : undefined
            }
          />

          <div className="grid gap-3 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:items-start">
            <DraftEditorDraftSummary
              draft={draft}
              accountLabel={formatDraftAccountSummaryLabel(draft, channelLabels)}
              onPickImage={requestReplaceImage}
              onPickLibraryImage={requestReplaceImageUrl}
              videoChangeEnabled
              mediaBusy={mediaBusy}
              mediaError={mediaError}
              disabled={isSaving}
              compact
              hideAccount
            />
            <DraftEditorCaptionField
              caption={caption}
              onCaptionChange={onCaptionChange}
              maxLength={captionMaxLength}
              compact
            />
          </div>

          {isYoutube ||
          isPinterest ||
          isTiktok ||
          isFacebook ||
          isLinkedin ? (
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
                      htmlFor="draft-youtube-title"
                      className="block text-xs font-medium text-on-surface"
                    >
                      YouTube title
                    </label>
                    <input
                      id="draft-youtube-title"
                      value={youtubeTitle}
                      maxLength={100}
                      disabled={isSaving}
                      onChange={(e) => {
                        setYoutubeTitle(e.target.value.slice(0, 100));
                      }}
                      className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2 text-sm text-on-surface outline-none transition focus:border-primary/60 focus:ring-1 focus:ring-primary/20 disabled:opacity-60"
                      placeholder="Add a YouTube title"
                    />
                  </div>
                ) : null}
                {isYoutube ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label
                        htmlFor="draft-youtube-playlist"
                        className="block text-xs font-medium text-on-surface"
                      >
                        YouTube playlist
                      </label>
                      <select
                        id="draft-youtube-playlist"
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
                  <div className="space-y-2">
                    <label
                      htmlFor="draft-pinterest-title"
                      className="block text-xs font-medium text-on-surface"
                    >
                      Pinterest title
                    </label>
                    <input
                      id="draft-pinterest-title"
                      value={pinterestTitle}
                      maxLength={100}
                      disabled={isSaving}
                      onChange={(e) => {
                        setPinterestTitle(e.target.value.slice(0, 100));
                      }}
                      className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2 text-sm text-on-surface outline-none transition focus:border-primary/60 focus:ring-1 focus:ring-primary/20 disabled:opacity-60"
                      placeholder="Add a Pinterest title"
                    />
                  </div>
                ) : null}
                {isTiktok ? (
                  <div className="space-y-2">
                    <label
                      htmlFor="draft-tiktok-title"
                      className="block text-xs font-medium text-on-surface"
                    >
                      TikTok title
                    </label>
                    <input
                      id="draft-tiktok-title"
                      value={tiktokTitle}
                      maxLength={90}
                      disabled={isSaving}
                      onChange={(e) => {
                        setTiktokTitle(e.target.value.slice(0, 90));
                      }}
                      className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2 text-sm text-on-surface outline-none transition focus:border-primary/60 focus:ring-1 focus:ring-primary/20 disabled:opacity-60"
                      placeholder="Add a TikTok title"
                    />
                  </div>
                ) : null}
                {isFacebook && facebookLinkUrl ? (
                  <div className="space-y-2">
                    <label
                      htmlFor="draft-facebook-link"
                      className="block text-xs font-medium text-on-surface"
                    >
                      Facebook link URL
                    </label>
                    <input
                      id="draft-facebook-link"
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
                {isYoutube ? (
                  <DraftEditorDraftSummary
                    draft={thumbnailDraft}
                    accountLabel="Thumbnail"
                    onPickImage={(file) => {
                      requestReplaceImage(file, "youtubeThumbnail");
                    }}
                    onPickLibraryImage={(url, name, mediaId) => {
                      requestReplaceImageUrl(
                        url,
                        name,
                        mediaId,
                        "youtubeThumbnail",
                      );
                    }}
                    mediaKindOverride="youtubeThumbnail"
                    mediaBusy={mediaBusy}
                    mediaError={mediaError}
                    disabled={isSaving}
                    compact
                    hideAccount
                  />
                ) : null}
                {isLinkedin && isVideoPost ? (
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
                ) : null}
              </div>
            </details>
          ) : null}

          <DraftEditorScheduleAndMedia
            disabled={isSaving}
            scheduleBusy={scheduleBusy}
            scheduleError={scheduleError}
            onSchedule={requestSchedule}
            compact
          />

          {actionError ? (
            <p
              className="rounded-xl border border-error/30 bg-error/10 px-3 py-2 text-xs text-error"
              role="alert"
            >
              {actionError}
            </p>
          ) : null}
        </div>
      ) : (
        <>
      <DraftEditorDraftSummary
        draft={draft}
        accountLabel={formatDraftAccountSummaryLabel(draft, channelLabels)}
        onPickImage={requestReplaceImage}
        onPickLibraryImage={requestReplaceImageUrl}
        videoChangeEnabled
        mediaBusy={mediaBusy}
        mediaError={mediaError}
        disabled={isSaving}
        onEditAccount={
          onChangeAccount ? () => setAccountPickerOpen(true) : undefined
        }
      />

      {isYoutube ? (
        <div className="space-y-2">
          <label
            htmlFor="draft-youtube-title"
            className="block text-sm font-medium text-on-surface"
          >
            YouTube title
          </label>
          <input
            id="draft-youtube-title"
            value={youtubeTitle}
            maxLength={100}
            disabled={isSaving}
            onChange={(e) => {
              setYoutubeTitle(e.target.value.slice(0, 100));
            }}
            className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
            placeholder="Add a YouTube title"
          />
          <p className="text-right text-xs text-on-surface-variant">
            {youtubeTitle.length} / 100
          </p>
        </div>
      ) : null}

      {isYoutube ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="draft-youtube-playlist"
              className="block text-sm font-medium text-on-surface"
            >
              YouTube playlist
            </label>
            <select
              id="draft-youtube-playlist"
              value={youtubePlaylistId}
              disabled={isSaving}
              onChange={(e) => {
                setYoutubePlaylistId(e.target.value);
              }}
              className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
            >
              <option value="">No playlist</option>
              {youtubePlaylistOptions.map((playlist) => (
                <option key={playlist.id} value={playlist.id}>
                  {playlist.name}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-3 rounded-2xl border border-outline-variant/15 bg-surface-container-low px-4 py-3 text-sm font-medium text-on-surface">
            <input
              type="checkbox"
              checked={youtubeMadeForKids}
              disabled={isSaving}
              onChange={(e) => {
                setYoutubeMadeForKids(e.target.checked);
              }}
              className="size-4 accent-primary"
            />
            Made for kids
          </label>
        </div>
      ) : null}

      {isPinterest ? (
        <div className="space-y-2">
          <label
            htmlFor="draft-pinterest-title"
            className="block text-sm font-medium text-on-surface"
          >
            Pinterest title
          </label>
          <input
            id="draft-pinterest-title"
            value={pinterestTitle}
            maxLength={100}
            disabled={isSaving}
            onChange={(e) => {
              setPinterestTitle(e.target.value.slice(0, 100));
            }}
            className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
            placeholder="Add a Pinterest title"
          />
          <p className="text-right text-xs text-on-surface-variant">
            {pinterestTitle.length} / 100
          </p>
        </div>
      ) : null}

      {isTiktok ? (
        <div className="space-y-4 rounded-2xl border border-outline-variant/10 bg-surface-container-low/50 p-4">
          <div className="space-y-2">
            <label
              htmlFor="draft-tiktok-title"
              className="block text-sm font-medium text-on-surface"
            >
              TikTok photo title
            </label>
            <input
              id="draft-tiktok-title"
              value={tiktokTitle}
              maxLength={90}
              disabled={isSaving}
              onChange={(e) => {
                setTiktokTitle(e.target.value.slice(0, 90));
              }}
              className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
              placeholder="Optional photo title"
            />
            <p className="text-right text-xs text-on-surface-variant">
              {tiktokTitle.length} / 90
            </p>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="draft-tiktok-privacy"
              className="block text-sm font-medium text-on-surface"
            >
              TikTok privacy
            </label>
            <select
              id="draft-tiktok-privacy"
              value={tiktokPrivacyLevel}
              disabled={isSaving}
              onChange={(e) => {
                setTiktokPrivacyLevel(e.target.value);
              }}
              className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
            >
              <option value="PUBLIC_TO_EVERYONE">Public</option>
              <option value="MUTUAL_FOLLOW_FRIENDS">Friends</option>
              <option value="SELF_ONLY">Only me</option>
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Disable comments", tiktokDisableComment, setTiktokDisableComment],
              ["Auto add music", tiktokAutoAddMusic, setTiktokAutoAddMusic],
              ["Branded content", tiktokBrandContent, setTiktokBrandContent],
              ["Brand organic", tiktokBrandOrganic, setTiktokBrandOrganic],
            ].map(([label, checked, setter]) => (
              <label
                key={label as string}
                className="flex items-center gap-3 rounded-xl border border-outline-variant/15 bg-surface-container-low px-3 py-2 text-xs font-bold text-on-surface"
              >
                <input
                  type="checkbox"
                  checked={Boolean(checked)}
                  disabled={isSaving}
                  onChange={(e) => {
                    (setter as (value: boolean) => void)(e.target.checked);
                  }}
                  className="size-4 accent-primary"
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
            htmlFor="draft-facebook-link"
            className="block text-sm font-medium text-on-surface"
          >
            Facebook link URL
          </label>
          <input
            id="draft-facebook-link"
            value={facebookLinkUrl}
            disabled={isSaving}
            onChange={(e) => {
              setFacebookLinkUrl(e.target.value);
            }}
            className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
            placeholder="https://example.com"
          />
        </div>
      ) : null}

      <DraftEditorCaptionField
        caption={caption}
        onCaptionChange={onCaptionChange}
        maxLength={captionMaxLength}
      />

      {isYoutube ? (
        <div className="space-y-2 rounded-2xl border border-outline-variant/10 bg-surface-container-low/50 p-4">
          <p className="text-sm font-semibold text-on-surface">
            YouTube thumbnail
          </p>
          <DraftEditorImageBlock
            draft={thumbnailDraft}
            onPickImage={(file) => {
              requestReplaceImage(file, "youtubeThumbnail");
            }}
            onPickLibraryImage={(url, _name, mediaId) => {
              requestReplaceImageUrl(url, _name, mediaId, "youtubeThumbnail");
            }}
            mediaKindOverride="youtubeThumbnail"
            mediaBusy={mediaBusy}
            mediaError={mediaError}
            disabled={isSaving}
          />
        </div>
      ) : null}

      {isLinkedin && isVideoPost ? (
        <div className="space-y-2 rounded-2xl border border-outline-variant/10 bg-surface-container-low/50 p-4">
          <p className="text-sm font-semibold text-on-surface">
            LinkedIn video thumbnail
          </p>
          <DraftEditorImageBlock
            draft={thumbnailDraft}
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
          />
        </div>
      ) : null}

      <DraftEditorScheduleAndMedia
        disabled={isSaving}
        scheduleBusy={scheduleBusy}
        scheduleError={scheduleError}
        onSchedule={requestSchedule}
      />

      {actionError ? (
        <p
          className="rounded-2xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error"
          role="alert"
        >
          {actionError}
        </p>
      ) : null}
        </>
      )}

      <div
        className={
          compact
            ? "shrink-0 border-t border-outline-variant/10 pt-3"
            : undefined
        }
      >
        <DraftEditorPrimaryActions
          isSaving={isSaving}
          compact={compact}
          onUpdateClick={requestUpdate}
          onPublishClick={() => {
            requestPublish(formatDraftPublishChannelLabel(draft, channelLabels));
          }}
          onDeleteClick={requestDelete}
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

      {!onUpdateSuccess && toast ? (
        <DraftEditorSuccessToast
          key={toastKey}
          title={toast.title}
          subtitle={toast.subtitle}
          onDismiss={dismissToast}
        />
      ) : null}

      <DraftEditorAccountPickerModal
        open={accountPickerOpen}
        currentPlatform={draft.platform}
        currentPlatformUserId={draft.platform_user_id}
        onClose={() => setAccountPickerOpen(false)}
        onSelect={handleAccountSelect}
        disabled={isSaving}
      />
    </div>
  );
}
