"use client";

import { useEffect, useMemo, useState, type CSSProperties, type ReactElement, type ReactNode } from "react";

import { TEXT_POST_PLACEHOLDER_IMAGE_SRC } from "@/lib/ui/textPostPlaceholderImage";

import type { ComposerAttachedMedia } from "../_types/composerDraftTypes";

import { PostSchedulerVideoWithControls } from "./PostSchedulerVideoWithControls";
import { PreviewMediaTopRightActions } from "./PreviewMediaTopRightActions";
import { PREVIEW_SINGLE_IMAGE_CENTERED } from "./postSchedulerPreviewMediaClasses";

interface PostSchedulerPreviewMediaBlockProps {
  readonly attachedMedia?: readonly ComposerAttachedMedia[];
  /** Outer layout: aspect, min-height, flex centering, etc. */
  readonly className: string;
  readonly style?: CSSProperties;
  /** Applied to the single-image `<img>` (default: letterboxed, centered). */
  readonly singleImageImgClassName?: string;
  /** Applied to each cell when rendering multiple images. */
  readonly multiImageImgClassName?: string;
  readonly placeholder?: ReactNode;
  /** AI image generate/edit in progress — shimmer over the media region. */
  readonly imageGenerationShimmer?: boolean;
  readonly onRemoveMedia?: (mediaKey: string) => void;
  readonly onMoveMedia?: (fromKey: string, toKey: string) => void;
}

function attachedMediaKey(item: ComposerAttachedMedia): string {
  return item.mediaId || item.publicUrl;
}

function PreviewMediaShimmerOverlay({
  active,
}: {
  readonly active: boolean;
}): ReactElement | null {
  if (!active) {
    return null;
  }
  return (
    <div
      className="preview-media-generating-shimmer pointer-events-none absolute inset-0 z-[25] overflow-hidden rounded-[inherit]"
      aria-hidden
    />
  );
}

function useSingleImageNaturalSize(src: string | null): { width: number; height: number } | null {
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!src?.trim()) {
      const timeoutId = window.setTimeout(() => {
        if (!cancelled) {
          setSize(null);
        }
      }, 0);
      return () => {
        cancelled = true;
        window.clearTimeout(timeoutId);
      };
    }
    const image = new Image();
    const updateSize = (): void => {
      if (cancelled) {
        return;
      }
      if (image.naturalWidth > 0 && image.naturalHeight > 0) {
        setSize({ width: image.naturalWidth, height: image.naturalHeight });
      } else {
        setSize(null);
      }
    };
    image.onload = updateSize;
    image.onerror = (): void => {
      if (!cancelled) {
        setSize(null);
      }
    };
    image.src = src;
    if (image.complete) {
      queueMicrotask(updateSize);
    }
    return () => {
      cancelled = true;
    };
  }, [src]);

  return size;
}

export function PostSchedulerPreviewMediaBlock({
  attachedMedia = [],
  className,
  style,
  singleImageImgClassName = PREVIEW_SINGLE_IMAGE_CENTERED,
  placeholder,
  imageGenerationShimmer = false,
  onRemoveMedia,
  onMoveMedia,
}: PostSchedulerPreviewMediaBlockProps): ReactElement {
  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const video = attachedMedia.find((m) => m.mediaType === "video");
  const document = attachedMedia.find((m) => m.mediaType === "document");
  const images = attachedMedia.filter((m) => m.mediaType === "image");
  const singleImageSrc = images.length === 1 ? images[0]?.publicUrl?.trim() || null : null;
  const singleImageSize = useSingleImageNaturalSize(singleImageSrc);
  const resolvedStyle = useMemo(() => {
    if (!singleImageSize) {
      return style;
    }
    return {
      ...style,
      aspectRatio: `${singleImageSize.width} / ${singleImageSize.height}`,
    };
  }, [singleImageSize, style]);

  if (document) {
    const positioned =
      className.includes("absolute") || className.includes("fixed")
        ? ""
        : "relative ";
    const thumbUrl = document.thumbnailUrl?.trim();
    return (
      <div
        className={`${positioned}flex min-h-0 flex-col items-start justify-center gap-2 overflow-hidden bg-surface-container-high p-4 ${className}`}
      >
        {thumbUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- document preview thumbnail
          <img
            alt=""
            className="max-h-full w-full rounded-md object-cover object-top shadow-sm"
            src={thumbUrl}
          />
        ) : (
          <span className="material-symbols-outlined text-5xl text-outline/40" aria-hidden>
            description
          </span>
        )}
        <p className="line-clamp-2 text-sm font-semibold text-on-surface">
          {document.filename || "Document"}
        </p>
        <p className="text-xs text-on-surface-variant">PDF · PPT · DOC</p>
        <PreviewMediaShimmerOverlay active={imageGenerationShimmer} />
      </div>
    );
  }

  if (video) {
    const wrapClass =
      className.includes("absolute") || className.includes("fixed")
        ? className
        : `relative ${className}`;
    return (
      <div className={wrapClass}>
        <PostSchedulerVideoWithControls
          src={video.publicUrl}
          size="preview"
          className="h-full w-full min-h-0"
        />
        <PreviewMediaTopRightActions
          filename={video.filename}
          media={video}
          onRemove={
            onRemoveMedia ? () => onRemoveMedia(attachedMediaKey(video)) : undefined
          }
        />
        <PreviewMediaShimmerOverlay active={imageGenerationShimmer} />
      </div>
    );
  }

  if (images.length === 1) {
    const image = images[0];
    const positioned =
      className.includes("absolute") || className.includes("fixed")
        ? ""
        : "relative ";
    const imgClassName =
      image.source === "canva" ? PREVIEW_SINGLE_IMAGE_CENTERED : singleImageImgClassName;
    return (
      <div
        className={`${positioned}flex min-h-0 items-center justify-center overflow-hidden bg-surface-container-high ${className}`}
        style={resolvedStyle}
      >
        <img alt="" className={imgClassName} src={image.publicUrl} />
        {singleImageSize ? (
          <div className="pointer-events-none absolute left-2 bottom-2 z-20 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
            {singleImageSize.width} × {singleImageSize.height}
          </div>
        ) : null}
        <PreviewMediaTopRightActions
          filename={image.filename}
          media={image}
          onRemove={
            onRemoveMedia ? () => onRemoveMedia(attachedMediaKey(image)) : undefined
          }
        />
        <PreviewMediaShimmerOverlay active={imageGenerationShimmer} />
      </div>
    );
  }

  if (images.length > 1) {
    return (
      <div
        className={`relative h-full min-h-0 overflow-hidden bg-surface-container-high ${className}`}
      >
        <div className="no-scrollbar h-full min-h-0 overflow-y-auto p-1">
          <div className="columns-2 gap-1 [column-fill:_balance]">
            {images.map((img) => {
              const key = attachedMediaKey(img);
              return (
                <div
                  key={key}
                  draggable={Boolean(onMoveMedia)}
                  onDragStart={(event) => {
                    if (!onMoveMedia) {
                      return;
                    }
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", key);
                    setDraggingKey(key);
                  }}
                  onDragOver={(event) => {
                    if (!onMoveMedia) {
                      return;
                    }
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "move";
                  }}
                  onDragEnter={() => {
                    if (draggingKey && draggingKey !== key) {
                      onMoveMedia?.(draggingKey, key);
                    }
                  }}
                  onDrop={(event) => {
                    if (!onMoveMedia) {
                      return;
                    }
                    event.preventDefault();
                    setDraggingKey(null);
                  }}
                  onDragEnd={() => setDraggingKey(null)}
                  className={`group relative mb-1 break-inside-avoid overflow-hidden rounded-md bg-surface-container-low ${
                    onMoveMedia ? "cursor-grab active:cursor-grabbing" : ""
                  } ${draggingKey === key ? "opacity-60 ring-2 ring-secondary/70" : ""}`}
                >
                  <img alt="" className="h-auto w-full object-cover" src={img.publicUrl} />
                  {onMoveMedia ? (
                    <span className="absolute left-2 top-2 z-30 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                      <span className="material-symbols-outlined text-[16px] leading-none" aria-hidden>
                        drag_indicator
                      </span>
                    </span>
                  ) : null}
                  <PreviewMediaTopRightActions
                    filename={img.filename}
                    media={img}
                    showOnHoverOnly
                    onRemove={onRemoveMedia ? () => onRemoveMedia(key) : undefined}
                  />
                </div>
              );
            })}
          </div>
        </div>
        {images.length > 4 ? (
          <span className="pointer-events-none absolute bottom-2 right-2 z-[5] rounded-full bg-black/75 px-2 py-0.5 text-[11px] font-bold text-white">
            {images.length} images
          </span>
        ) : null}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-surface-container-high to-transparent" />
        <PreviewMediaShimmerOverlay active={imageGenerationShimmer} />
      </div>
    );
  }
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-surface-container-high ${className}`}
    >
      {placeholder ?? (
        // eslint-disable-next-line @next/next/no-img-element -- static text-post placeholder asset
        <img
          alt=""
          className={singleImageImgClassName}
          src={TEXT_POST_PLACEHOLDER_IMAGE_SRC}
        />
      )}
      <PreviewMediaShimmerOverlay active={imageGenerationShimmer} />
    </div>
  );
}
