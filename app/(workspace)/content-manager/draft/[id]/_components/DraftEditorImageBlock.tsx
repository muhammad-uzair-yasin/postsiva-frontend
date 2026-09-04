"use client";

import { useId, useRef, useState } from "react";

import type { UnifiedDraftResponseJson } from "@/lib/social/unifiedDraftsApi";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import {
  mediaKindFromFile,
  type DraftEditorMediaKind,
} from "../_hooks/useDraftEditorConfirmFlow";
import { WorkspaceVideoWithControls } from "@/app/(workspace)/_components/WorkspaceVideoWithControls";
import { DraftEditorImageSourcePickerModal } from "./DraftEditorImageSourcePickerModal";
import { DraftEditorMediaPreviewModal } from "./DraftEditorMediaPreviewModal";

interface DraftEditorImageBlockProps {
  draft: UnifiedDraftResponseJson;
  onPickImage: (file: File, mediaKind: DraftEditorMediaKind) => void;
  /** When set, "Add/Change image" first asks: media library or device upload. */
  onPickLibraryImage?: (
    url: string,
    name: string,
    mediaId: string | null,
    mediaKind: DraftEditorMediaKind,
  ) => void;
  /** Allow replacing with image or video (scheduled-post editor). */
  videoChangeEnabled?: boolean;
  /** When true with videoChangeEnabled, picker accepts image and video (type swap). */
  allowMediaTypeSwap?: boolean;
  mediaKindOverride?: DraftEditorMediaKind;
  mediaBusy: boolean;
  mediaError: string | null;
  disabled: boolean;
  /** Square-ish thumbnail sized for compact scheduled editor. */
  compact?: boolean;
}

export function DraftEditorImageBlock({
  draft,
  onPickImage,
  onPickLibraryImage,
  videoChangeEnabled = false,
  allowMediaTypeSwap = false,
  mediaKindOverride,
  mediaBusy,
  mediaError,
  disabled,
  compact = false,
}: DraftEditorImageBlockProps): React.ReactElement {
  const { t } = useTranslations();
  const fileId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [sourcePickerOpen, setSourcePickerOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const imagePreviewUrl =
    draft.default_image_url?.trim() ||
    (Array.isArray(draft.image_urls)
      ? draft.image_urls.find((u) => typeof u === "string" && /^https?:/i.test(u.trim()))
      : undefined);
  const videoPreviewUrl = imagePreviewUrl ? undefined : draft.video_url?.trim();
  const hasPreview = Boolean(imagePreviewUrl || videoPreviewUrl);

  const postType = (draft.post_type ?? "").trim().toLowerCase();
  const isVideoPost =
    Boolean(videoPreviewUrl) ||
    (!hasPreview && (postType === "video" || postType === "reel"));
  // Dual-media platforms: accept image or video so an image post can become a video.
  const mediaKind: DraftEditorMediaKind =
    mediaKindOverride ??
    (videoChangeEnabled && allowMediaTypeSwap
      ? "imageOrVideo"
      : videoChangeEnabled && isVideoPost
        ? "video"
        : "image");
  const acceptsVideo =
    mediaKind === "video" || mediaKind === "imageOrVideo";
  const acceptsImage =
    mediaKind === "image" || mediaKind === "imageOrVideo";
  const acceptAttr =
    acceptsVideo && acceptsImage
      ? "image/*,video/*"
      : acceptsVideo
        ? "video/*"
        : "image/*";

  const changeLabel = acceptsVideo && acceptsImage
    ? t("content.draftMediaChange")
    : acceptsVideo
      ? t("content.draftVideoChange")
      : t("content.draftImageChange");
  const addLabel = acceptsVideo && acceptsImage
    ? t("content.draftMediaAdd")
    : acceptsVideo
      ? t("content.draftVideoAdd")
      : t("content.draftImageAdd");

  const busy = disabled || mediaBusy;
  const openPicker = (): void => {
    if (busy) {
      return;
    }
    if (onPickLibraryImage) {
      setSourcePickerOpen(true);
      return;
    }
    fileInputRef.current?.click();
  };

  const openPreview = (): void => {
    if (busy || !hasPreview) {
      return;
    }
    setPreviewOpen(true);
  };

  return (
    <div className="space-y-2">
      <input
        id={fileId}
        ref={fileInputRef}
        type="file"
        accept={acceptAttr}
        className="sr-only"
        disabled={busy}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) {
            const resolved =
              mediaKind === "imageOrVideo"
                ? mediaKindFromFile(file, "image")
                : mediaKind;
            onPickImage(file, resolved);
          }
        }}
      />

      {hasPreview ? (
        videoPreviewUrl && !compact ? (
          <div className="mx-auto w-full max-w-xl space-y-2">
            <WorkspaceVideoWithControls
              src={videoPreviewUrl}
              size="preview"
              objectFit="contain"
              className="flex w-full justify-center rounded-2xl"
            />
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={openPreview}
                className="inline-flex items-center gap-1.5 rounded-xl border border-outline-variant/25 bg-surface-container-high px-3 py-2 text-xs font-bold text-on-surface hover:border-primary/40"
              >
                <span className="material-symbols-outlined text-base">fullscreen</span>
                {t("content.draftMediaViewFull")}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={openPicker}
                className="inline-flex items-center gap-1.5 rounded-xl border border-outline-variant/25 bg-surface-container-high px-3 py-2 text-xs font-bold text-on-surface hover:border-primary/40"
              >
                <span className="material-symbols-outlined text-base">video_call</span>
                {mediaBusy ? t("content.draftImageUploading") : changeLabel}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={openPreview}
            aria-label={t("content.draftMediaViewFull")}
            className={`group relative block overflow-hidden border border-outline-variant/10 bg-surface-container-low text-left transition-opacity disabled:opacity-60 ${
              compact
                ? "mx-0 aspect-square w-full max-w-[7.5rem] rounded-xl p-1"
                : "mx-auto flex w-full max-w-xl justify-center rounded-2xl p-1.5"
            } ${busy ? "cursor-wait" : "cursor-pointer"}`}
          >
            {imagePreviewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imagePreviewUrl}
                alt=""
                className={
                  compact
                    ? "h-full w-full object-cover"
                    : "h-auto max-h-[min(38vh,320px)] w-full max-w-full object-contain"
                }
              />
            ) : (
              <video
                src={videoPreviewUrl}
                className="h-full w-full object-cover"
                muted
                playsInline
                preload="metadata"
              />
            )}
            <div
              className={`pointer-events-none absolute inset-0 flex items-center justify-center bg-black/55 transition-opacity opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100`}
            >
              <span
                className={`bg-surface font-bold text-on-surface shadow-lg ring-2 ring-white/30 ${
                  compact
                    ? "rounded-lg px-2 py-1.5 text-[10px]"
                    : "rounded-xl px-5 py-2.5 text-sm"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span
                    className={`material-symbols-outlined ${compact ? "text-base" : "text-lg"}`}
                  >
                    fullscreen
                  </span>
                  {compact ? null : t("content.draftMediaViewFull")}
                </span>
              </span>
            </div>
          </button>
        )
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={openPicker}
          className={`group relative flex flex-col items-center justify-center gap-1 border-2 border-dashed border-outline-variant/35 bg-surface-container-low text-on-surface-variant transition-colors hover:border-primary/40 hover:bg-surface-container disabled:opacity-60 ${
            compact
              ? "aspect-square w-full max-w-[7.5rem] rounded-xl px-2 py-3"
              : "mx-auto min-h-[120px] w-full max-w-xl rounded-2xl px-4 py-5"
          }`}
        >
          <span
            className={`material-symbols-outlined text-on-surface-variant transition-colors group-hover:text-primary ${
              compact ? "text-2xl" : "text-3xl"
            }`}
          >
            {acceptsVideo && !acceptsImage
              ? "video_call"
              : "add_photo_alternate"}
          </span>
          {!compact ? (
            <>
              <span className="text-sm font-semibold text-on-surface">
                {mediaBusy ? t("content.draftImageUploading") : addLabel}
              </span>
              <span className="text-xs text-on-surface-variant">
                {onPickLibraryImage
                  ? t("content.imageSourceSubtitle")
                  : t("content.draftImageHint")}
              </span>
            </>
          ) : null}
        </button>
      )}

      {mediaError ? (
        <p className="text-sm text-error" role="alert">
          {mediaError}
        </p>
      ) : null}

      <DraftEditorMediaPreviewModal
        open={previewOpen}
        imageUrl={imagePreviewUrl}
        videoUrl={videoPreviewUrl}
        busy={busy}
        onClose={() => setPreviewOpen(false)}
        onChange={openPicker}
      />

      {onPickLibraryImage ? (
        <DraftEditorImageSourcePickerModal
          open={sourcePickerOpen}
          mediaKind={mediaKind}
          onClose={() => {
            setSourcePickerOpen(false);
          }}
          onPickLibraryImage={(url, name, mediaId, resolvedKind) => {
            setSourcePickerOpen(false);
            onPickLibraryImage(
              url,
              name,
              mediaId,
              resolvedKind ??
                (mediaKind === "imageOrVideo" ? "image" : mediaKind),
            );
          }}
        />
      ) : null}
    </div>
  );
}
