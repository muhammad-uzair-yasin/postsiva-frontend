"use client";

import { useEffect, useRef } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import type { ComposerAttachedMedia } from "@/lib/post-composer/composerAttachedMediaTypes";
import type { UnifiedMediaUploadWebResult } from "@/lib/social/unifiedMediaUploadWeb";

import { usePostSchedulerComposerDraft } from "../_context/PostSchedulerComposerDraftContext";
import { replaceOrMergeAttachedMedia } from "../_utils/postSchedulerComposerMediaPick";
import { usePostSchedulerComposerMediaSourceFlow } from "../_hooks/usePostSchedulerComposerMediaSourceFlow";
import { PostSchedulerComposerDashedUploadTrigger } from "./PostSchedulerComposerDashedUploadTrigger";

interface PostSchedulerComposerMediaAttachZoneProps {
  readonly disabled: boolean;
  readonly onUploaded: (result: UnifiedMediaUploadWebResult) => void;
  readonly wordpressConnectionId?: string | null;
  readonly onMediaPicked?: (media: ComposerAttachedMedia) => void;
  readonly heightClass?: string;
}

export function PostSchedulerComposerMediaAttachZone({
  disabled,
  onUploaded,
  wordpressConnectionId,
  onMediaPicked,
  heightClass = "h-20",
}: PostSchedulerComposerMediaAttachZoneProps): React.ReactElement {
  const { t } = useTranslations();
  const {
    mediaLibraryPickMode,
    setEditorMedia,
    setMediaLibraryPickMode,
    setYoutubeGenerateThumbnail,
    setYoutubeThumbnailMediaId,
    setYoutubeThumbnailPreviewUrl,
    setLinkedinGenerateThumbnail,
    setLinkedinThumbnailMediaId,
    setLinkedinThumbnailPreviewUrl,
  } = usePostSchedulerComposerDraft();

  const pickModeRef = useRef(mediaLibraryPickMode);
  useEffect(() => {
    pickModeRef.current = mediaLibraryPickMode;
  }, [mediaLibraryPickMode]);

  const pickThumbnailForMode = (media: {
    readonly mediaId: string;
    readonly mediaType: string;
    readonly publicUrl: string;
    readonly thumbnailUrl?: string;
  }): boolean => {
    if (media.mediaType !== "image") {
      return false;
    }
    const previewUrl = media.publicUrl || media.thumbnailUrl || null;
    if (pickModeRef.current === "youtube_thumbnail") {
      setYoutubeGenerateThumbnail(false);
      setYoutubeThumbnailMediaId(media.mediaId);
      setYoutubeThumbnailPreviewUrl(previewUrl);
      setMediaLibraryPickMode("default");
      return true;
    }
    if (pickModeRef.current === "linkedin_thumbnail") {
      setLinkedinGenerateThumbnail(false);
      setLinkedinThumbnailMediaId(media.mediaId);
      setLinkedinThumbnailPreviewUrl(previewUrl);
      setMediaLibraryPickMode("default");
      return true;
    }
    return false;
  };

  const { openSourcePicker, modals, fileInput, uploading, progress, hint } =
    usePostSchedulerComposerMediaSourceFlow({
      wordpressConnectionId,
      disabled,
      onPick: (media, opts) => {
        if (pickThumbnailForMode(media)) {
          onMediaPicked?.(media);
          return;
        }
        setEditorMedia((prev) =>
          replaceOrMergeAttachedMedia(prev, media, opts?.replaceMediaKey),
        );
        onMediaPicked?.(media);
      },
      onDeviceUpload: (result) => {
        if (pickThumbnailForMode(result)) {
          return;
        }
        onUploaded(result);
      },
      onDismiss: () => {
        if (
          pickModeRef.current === "youtube_thumbnail" ||
          pickModeRef.current === "linkedin_thumbnail"
        ) {
          setMediaLibraryPickMode("default");
        }
      },
    });

  const inputDisabled = disabled || uploading;

  return (
    <div className="relative w-full">
      {fileInput}
      <PostSchedulerComposerDashedUploadTrigger
        disabled={inputDisabled}
        onClick={openSourcePicker}
        emptyHint={t("postScheduler.composer.composerMediaUploadHint")}
        heightClass={heightClass}
      />
      {uploading ? (
        <div className="absolute inset-x-0 bottom-2 z-20 mx-3 rounded-lg border border-outline-variant/25 bg-surface-container-high/95 px-2 py-1.5 shadow-md backdrop-blur-sm">
          <div className="mb-1 h-1 overflow-hidden rounded-full bg-outline-variant/20">
            <div
              className="h-full rounded-full bg-secondary transition-[width] duration-200"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
          <p className="truncate text-[10px] font-medium text-on-surface-variant">
            {progress}%{hint ? ` · ${hint}` : ""}
          </p>
        </div>
      ) : null}
      {hint && !uploading ? (
        <p className="mt-2 truncate text-[10px] text-amber-800 dark:text-amber-200">{hint}</p>
      ) : null}
      {modals}
    </div>
  );
}
