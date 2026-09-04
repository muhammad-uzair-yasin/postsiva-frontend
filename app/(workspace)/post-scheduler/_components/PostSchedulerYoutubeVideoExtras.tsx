"use client";

import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";
import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import type { UnifiedMediaUploadWebResult } from "@/lib/social/unifiedMediaUploadWeb";
import { generateYoutubeThumbnailFromText } from "@/lib/social/youtubeThumbnailApi";
import type { YoutubePlaylistOption } from "@/lib/post-composer/parseYoutubePlaylists";
import { useEffect, useMemo, useState, type ReactElement } from "react";

import { userFacingAiErrorMessage } from "@/lib/ai/userFacingAiError";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

interface PostSchedulerYoutubeVideoExtrasProps {
  readonly playlists: readonly YoutubePlaylistOption[];
  readonly channelId: string | null;
  readonly playlistId: string;
  readonly onPlaylistIdChange: (value: string) => void;
  readonly thumbnailMediaId: string | null;
  readonly thumbnailPreviewUrl: string | null;
  readonly generateThumbnail: boolean;
  readonly madeForKids: boolean;
  readonly youtubeTitle: string;
  readonly descriptionText: string;
  readonly onThumbnailUploaded: (result: UnifiedMediaUploadWebResult) => void;
  readonly onClearThumbnail: () => void;
  readonly setGenerateThumbnail: (value: boolean) => void;
  readonly onMadeForKidsChange: (value: boolean) => void;
  readonly onOpenMediaLibraryForThumbnail: () => void;
}

/** Optional playlist + thumbnail controls for YouTube video jobs (16:9 long-form; not Shorts). */
export function PostSchedulerYoutubeVideoExtras({
  playlists,
  channelId,
  playlistId,
  onPlaylistIdChange,
  thumbnailMediaId,
  thumbnailPreviewUrl,
  generateThumbnail,
  madeForKids,
  youtubeTitle,
  descriptionText,
  onThumbnailUploaded,
  onClearThumbnail,
  setGenerateThumbnail,
  onMadeForKidsChange,
  onOpenMediaLibraryForThumbnail,
}: PostSchedulerYoutubeVideoExtrasProps): ReactElement {
  const { t } = useTranslations();
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);
  const [createPlaylistError, setCreatePlaylistError] = useState<string | null>(null);
  const [showThumbnailSourceModal, setShowThumbnailSourceModal] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [localPlaylists, setLocalPlaylists] = useState<YoutubePlaylistOption[]>([]);

  useEffect(() => {
    setLocalPlaylists([]);
    setShowCreatePlaylist(false);
    setCreatePlaylistError(null);
    setNewPlaylistName("");
  }, [channelId]);

  const availablePlaylists = useMemo(() => {
    const map = new Map<string, YoutubePlaylistOption>();
    for (const p of playlists) {
      map.set(p.id, p);
    }
    for (const p of localPlaylists) {
      map.set(p.id, p);
    }
    return Array.from(map.values());
  }, [playlists, localPlaylists]);
  async function handleCreatePlaylist(): Promise<void> {
    const name = newPlaylistName.trim();
    if (!name) {
      setCreatePlaylistError(t("postScheduler.youtube.enterPlaylistName"));
      return;
    }
    const token = getStoredAccessToken();
    const workspaceId = getStoredActiveWorkspaceId();
    if (!token?.trim() || !workspaceId?.trim()) {
      setCreatePlaylistError(t("postScheduler.youtube.signInWorkspace"));
      return;
    }
    setCreatingPlaylist(true);
    setCreatePlaylistError(null);
    try {
      const url = `${getApiBaseUrl()}/youtube/user-playlist/`;
      const res = await fetchWithAccessTokenRetry(
        url,
        token,
        (t) => ({
          Authorization: `Bearer ${t}`,
          "X-Workspace-Id": workspaceId,
          "Content-Type": "application/json",
          Accept: "application/json",
        }),
        {
          method: "POST",
          body: JSON.stringify({
            channel_id: channelId,
            playlist_name: name,
            description: "",
            privacy_status: "private",
          }),
        },
      );
      const data = (await res.json()) as {
        success?: boolean;
        playlist_id?: string;
        playlist_name?: string;
        message?: string;
      };
      const newId = typeof data.playlist_id === "string" ? data.playlist_id.trim() : "";
      if (!res.ok || !newId) {
        setCreatePlaylistError(data.message || t("postScheduler.youtube.createPlaylistFailed"));
        return;
      }
      const created: YoutubePlaylistOption = {
        id: newId,
        name:
          (typeof data.playlist_name === "string" && data.playlist_name.trim()) || name,
      };
      setLocalPlaylists((prev) => [created, ...prev]);
      onPlaylistIdChange(created.id);
      setNewPlaylistName("");
      setShowCreatePlaylist(false);
    } catch (e) {
      setCreatePlaylistError(
        e instanceof Error ? e.message : t("postScheduler.youtube.createPlaylistFailed"),
      );
    } finally {
      setCreatingPlaylist(false);
    }
  }

  async function handleGenerateThumbnailConfirm(): Promise<void> {
    const token = getStoredAccessToken();
    const workspaceId = getStoredActiveWorkspaceId();
    if (!token?.trim() || !workspaceId?.trim()) {
      setGenerateError(t("postScheduler.youtube.signInWorkspace"));
      return;
    }
    const title = youtubeTitle.trim();
    const description = descriptionText.trim();
    const content = [title, description].filter(Boolean).join("\n\n").trim();
    if (!content) {
      setGenerateError(t("postScheduler.youtube.addTitleOrDescription"));
      return;
    }
    setGenerateError(null);
    setShowThumbnailSourceModal(false);
    setGenerateThumbnail(true);
    try {
      const response = await generateYoutubeThumbnailFromText(token, workspaceId, {
        ...(title ? { youtube_title: title } : {}),
        ...(description ? { youtube_description: description } : {}),
      });
      if (!response.success) {
        throw new Error(response.message || t("postScheduler.youtube.thumbnailGenFailed"));
      }
      const mediaId =
        typeof response.media_id === "string" ? response.media_id.trim() : "";
      const imageUrl =
        typeof response.image_url === "string" ? response.image_url.trim() : "";
      if (!mediaId || !imageUrl) {
        throw new Error(t("postScheduler.youtube.noThumbnailReturned"));
      }
      onThumbnailUploaded({
        mediaId,
        publicUrl: imageUrl,
        filename: t("postScheduler.aiToolkit.aiGeneratedImage"),
        mediaType: "image",
      });
    } catch (e) {
      setGenerateError(
        userFacingAiErrorMessage(e, {
          aiDown: t("postScheduler.aiToolkit.aiTemporarilyDown"),
          network: t("postScheduler.aiToolkit.aiConnectionIssue"),
          fallback: t("postScheduler.youtube.thumbnailGenFailed"),
        }),
      );
    } finally {
      setGenerateThumbnail(false);
    }
  }

  return (
    <div className="mb-4 rounded-xl border border-outline-variant/15 bg-surface-container-low/80 px-4 py-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant">
          {t("postScheduler.youtube.options")}
        </p>
        <button
          type="button"
          onClick={() => {
            setShowCreatePlaylist(true);
            setCreatePlaylistError(null);
          }}
          className="rounded-md border border-outline-variant/20 bg-surface-container-lowest px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-on-surface-variant hover:bg-surface-container-high/70"
        >
          {t("postScheduler.youtube.createPlaylist")}
        </button>
      </div>

      <label
        htmlFor="post-scheduler-youtube-playlist"
        className="mb-1 block text-[11px] font-semibold text-on-surface-variant"
      >
        {t("postScheduler.youtube.playlistOptional")}
      </label>
      <select
        id="post-scheduler-youtube-playlist"
        value={playlistId}
        onChange={(e) => {
          onPlaylistIdChange(e.target.value);
        }}
        className="mb-4 w-full rounded-lg border border-outline-variant/20 bg-surface-container-lowest px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/25"
      >
        <option value="">{t("postScheduler.youtube.none")}</option>
        {availablePlaylists.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <label className="mb-4 flex items-start gap-3 rounded-lg border border-outline-variant/15 bg-surface-container-lowest px-3 py-2">
        <input
          type="checkbox"
          checked={madeForKids}
          onChange={(e) => {
            onMadeForKidsChange(e.target.checked);
          }}
          className="mt-0.5 size-4 accent-primary"
        />
        <span className="min-w-0">
          <span className="block text-xs font-bold text-on-surface">
            {t("postScheduler.youtube.madeForKids")}
          </span>
          <span className="block text-[11px] leading-relaxed text-on-surface-variant">
            {t("postScheduler.youtube.madeForKidsHint")}
          </span>
        </span>
      </label>

      <p className="mb-2 text-[11px] font-semibold text-on-surface-variant">
        {t("postScheduler.youtube.thumbnailOptional")}
      </p>
      <p className="mb-2 text-[11px] leading-relaxed text-on-surface-variant">
        {t("postScheduler.youtube.shortsHint")}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={generateThumbnail}
          onClick={() => {
            setGenerateError(null);
            onOpenMediaLibraryForThumbnail();
          }}
          className="rounded-lg border border-outline-variant/25 bg-surface-container-lowest px-3 py-2 text-xs font-bold text-on-surface transition hover:bg-surface-container-high/80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t("postScheduler.youtube.chooseThumbnail")}
        </button>
        <button
          type="button"
          disabled={generateThumbnail}
          onClick={() => {
            setGenerateError(null);
            setShowThumbnailSourceModal(true);
          }}
          className="rounded-lg border border-outline-variant/25 px-3 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container-high/50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t("postScheduler.youtube.generateThumbnail")}
        </button>
        {thumbnailMediaId ? (
          <button
            type="button"
            onClick={() => {
              onClearThumbnail();
            }}
            className="rounded-lg border border-outline-variant/25 px-3 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container-high/50"
          >
            {t("postScheduler.youtube.clearImage")}
          </button>
        ) : null}
      </div>
      {generateError ? (
        <p className="mt-2 text-[11px] text-error">{generateError}</p>
      ) : null}
      {thumbnailPreviewUrl ? (
        <div className="mt-3 flex items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- CDN URL from upload */}
          <img
            src={thumbnailPreviewUrl}
            alt={t("postScheduler.preview.youtubeThumbnailAlt")}
            className="h-16 w-28 rounded-md border border-outline-variant/20 object-cover"
          />
          <p className="text-[10px] text-on-surface-variant">
            {t("postScheduler.youtube.thumbnailSentHint")}
          </p>
        </div>
      ) : null}

      {showCreatePlaylist ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-xl border border-outline-variant/20 bg-surface-container p-4 shadow-2xl">
            <p className="text-sm font-bold text-on-surface">{t("postScheduler.youtube.createPlaylistTitle")}</p>
            <p className="mt-1 text-xs text-on-surface-variant">
              {t("postScheduler.youtube.createPlaylistBody")}
            </p>
            <input
              type="text"
              maxLength={150}
              placeholder={t("postScheduler.youtube.playlistNamePlaceholder")}
              value={newPlaylistName}
              onChange={(e) => {
                setNewPlaylistName(e.target.value);
              }}
              className="mt-3 w-full rounded-md border border-outline-variant/20 bg-surface-container-low px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/25"
            />
            {createPlaylistError ? (
              <p className="mt-2 text-xs text-error">{createPlaylistError}</p>
            ) : null}
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={creatingPlaylist}
                onClick={() => {
                  setShowCreatePlaylist(false);
                  setCreatePlaylistError(null);
                }}
                className="rounded-md border border-outline-variant/20 px-3 py-2 text-xs font-bold text-on-surface-variant disabled:opacity-50"
              >
                {t("common.cancel")}
              </button>
              <button
                type="button"
                disabled={creatingPlaylist}
                onClick={() => {
                  void handleCreatePlaylist();
                }}
                className="rounded-md bg-secondary-container px-3 py-2 text-xs font-bold text-on-secondary-container disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creatingPlaylist ? t("postScheduler.youtube.creating") : t("postScheduler.youtube.create")}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showThumbnailSourceModal ? (
        <div className="fixed inset-0 z-[121] flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-xl border border-outline-variant/20 bg-surface-container p-4 shadow-2xl">
            <p className="text-sm font-bold text-on-surface">{t("postScheduler.youtube.generateThumbnail")}</p>
            <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">
              {t("postScheduler.youtube.generateThumbnailBody")}
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowThumbnailSourceModal(false);
                }}
                className="rounded-md border border-outline-variant/20 px-3 py-2 text-xs font-bold text-on-surface-variant"
              >
                {t("common.cancel")}
              </button>
              <button
                type="button"
                onClick={() => {
                  void handleGenerateThumbnailConfirm();
                }}
                className="rounded-md bg-secondary-container px-3 py-2 text-xs font-bold text-on-secondary-container"
              >
                {t("common.confirm")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
