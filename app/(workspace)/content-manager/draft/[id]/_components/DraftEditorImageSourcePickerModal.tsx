"use client";

import { useEffect, useRef, type ReactElement } from "react";

import type { UnifiedMediaUploadWebResult } from "@/lib/social/unifiedMediaUploadWeb";
import type { ComposerAttachedMedia } from "@/lib/post-composer/composerAttachedMediaTypes";

import { usePostSchedulerComposerMediaSourceFlow } from "../../../../post-scheduler/_hooks/usePostSchedulerComposerMediaSourceFlow";
import {
  mediaKindFromLibraryType,
  type DraftEditorMediaKind,
} from "../_hooks/useDraftEditorConfirmFlow";

interface DraftEditorImageSourcePickerModalProps {
  open: boolean;
  /** Which media type the picker offers (default image). */
  mediaKind?: DraftEditorMediaKind;
  onClose: () => void;
  /** User picked a media item from any composer media source. */
  onPickLibraryImage: (
    url: string,
    name: string,
    mediaId: string | null,
    mediaKind?: DraftEditorMediaKind,
  ) => void;
}

function allowsMediaKind(
  mediaKind: DraftEditorMediaKind,
  mediaType: ComposerAttachedMedia["mediaType"],
): boolean {
  if (mediaKind === "imageOrVideo") {
    return mediaType === "image" || mediaType === "video";
  }
  if (mediaKind === "video") {
    return mediaType === "video";
  }
  return mediaType === "image";
}

function mediaName(media: ComposerAttachedMedia): string {
  return media.filename?.trim() || media.publicUrl.split("/").pop() || "Selected media";
}

/** Scheduled/draft media chooser using the same full media source flow as the composer. */
export function DraftEditorImageSourcePickerModal({
  open,
  mediaKind = "image",
  onClose,
  onPickLibraryImage,
}: DraftEditorImageSourcePickerModalProps): ReactElement | null {
  const openedRef = useRef(false);
  const acceptPickedMedia = (media: ComposerAttachedMedia): void => {
    if (!media.publicUrl?.trim() || !allowsMediaKind(mediaKind, media.mediaType)) {
      return;
    }
    const resolved =
      mediaKind === "imageOrVideo"
        ? mediaKindFromLibraryType(media.mediaType, "image")
        : mediaKind;
    onPickLibraryImage(
      media.publicUrl.trim(),
      mediaName(media),
      media.mediaId || null,
      resolved,
    );
    onClose();
  };

  const acceptUploadedMedia = (result: UnifiedMediaUploadWebResult): void => {
    if (!result.publicUrl?.trim() || !allowsMediaKind(mediaKind, result.mediaType)) {
      return;
    }
    const resolved =
      mediaKind === "imageOrVideo"
        ? mediaKindFromLibraryType(result.mediaType, "image")
        : mediaKind;
    onPickLibraryImage(
      result.publicUrl.trim(),
      result.filename?.trim() || "Uploaded media",
      result.mediaId || null,
      resolved,
    );
    onClose();
  };

  const { openSourcePicker, modals, fileInput } =
    usePostSchedulerComposerMediaSourceFlow({
      onPick: acceptPickedMedia,
      onDeviceUpload: acceptUploadedMedia,
      onDismiss: onClose,
      libraryOverlayClassName: "z-[1300]",
      composerHandoffsEnabled: false,
      listenToGlobalOpenEvents: false,
    });

  useEffect(() => {
    if (!open) {
      openedRef.current = false;
      return;
    }
    if (!openedRef.current) {
      openedRef.current = true;
      openSourcePicker();
    }
  }, [open, openSourcePicker]);

  if (!open) {
    return null;
  }

  return (
    <>
      {fileInput}
      {modals}
    </>
  );
}
