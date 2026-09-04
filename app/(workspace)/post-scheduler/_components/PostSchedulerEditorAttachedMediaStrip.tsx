"use client";

import { useCallback, useState, type ReactElement } from "react";

import type { ComposerAttachedMedia } from "@/lib/post-composer/composerAttachedMediaTypes";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { openComposerMediaInCanva } from "@/lib/social/openCanvaDesignEditor";
import canvaIcon from "@/assets/social-icons/canva_icon.png";

interface PostSchedulerEditorAttachedMediaStripProps {
  readonly media: readonly ComposerAttachedMedia[];
  readonly onRemove: (mediaKey: string) => void;
  readonly onMove?: (fromKey: string, toKey: string) => void;
  readonly embedded?: boolean;
}

function attachedMediaKey(item: ComposerAttachedMedia): string {
  return item.mediaId || item.publicUrl;
}

function AttachedMediaTile({
  media: m,
  onRemove,
  onMove,
  onDragStart,
  onDragEnter,
  onDragEnd,
  dragging,
  compact,
}: {
  readonly media: ComposerAttachedMedia;
  readonly onRemove: (mediaKey: string) => void;
  readonly onMove?: (fromKey: string, toKey: string) => void;
  readonly onDragStart: (mediaKey: string) => void;
  readonly onDragEnter: (mediaKey: string) => void;
  readonly onDragEnd: () => void;
  readonly dragging: boolean;
  readonly compact?: boolean;
}): ReactElement {
  const { t } = useTranslations();
  const previewSrc = m.mediaType === "image" ? m.publicUrl : m.thumbnailUrl;
  const key = attachedMediaKey(m);

  const openCanvaDesign = useCallback(async (): Promise<void> => {
    if (m.mediaType !== "image" && m.mediaType !== "video") {
      return;
    }
    if (!m.publicUrl?.trim() && !m.canvaDesignId?.trim()) {
      return;
    }
    try {
      await openComposerMediaInCanva({
        publicUrl: m.publicUrl,
        mediaType: m.mediaType,
        mediaId: m.mediaId,
        filename: m.filename,
        canvaDesignId: m.canvaDesignId,
        replaceMediaKey: key,
      });
    } catch {
      // Keep the hover affordance quiet if Canva cannot reopen.
    }
  }, [key, m.canvaDesignId, m.filename, m.mediaId, m.mediaType, m.publicUrl]);

  return (
    <div
      key={key}
      title={m.filename}
      draggable={Boolean(onMove)}
      onDragStart={(event) => {
        if (!onMove) {
          return;
        }
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", key);
        onDragStart(key);
      }}
      onDragOver={(event) => {
        if (!onMove) {
          return;
        }
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
      }}
      onDragEnter={() => {
        if (onMove) {
          onDragEnter(key);
        }
      }}
      onDrop={(event) => {
        if (!onMove) {
          return;
        }
        event.preventDefault();
        onDragEnd();
      }}
      onDragEnd={onDragEnd}
      className={
        compact
          ? `group relative h-[4.5rem] w-[7.25rem] shrink-0 overflow-hidden rounded-lg border border-outline-variant/25 bg-surface-container-lowest shadow-sm transition ${
              onMove ? "cursor-grab active:cursor-grabbing" : ""
            } ${dragging ? "opacity-55 ring-2 ring-secondary/60" : ""}`
          : `group relative aspect-[16/10] w-full overflow-hidden rounded-lg border border-outline-variant/25 bg-surface-container-lowest shadow-sm transition ${
              onMove ? "cursor-grab active:cursor-grabbing" : ""
            } ${dragging ? "opacity-55 ring-2 ring-secondary/60" : ""}`
      }
    >
      <div className="flex h-full w-full items-center justify-center bg-secondary/10 text-secondary">
        <span
          className="material-symbols-outlined text-[28px] leading-none"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {m.mediaType === "video" ? "videocam" : "description"}
        </span>
      </div>
      {previewSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewSrc}
          alt={m.filename}
          className="absolute inset-0 h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : null}
      {m.mediaType === "video" && previewSrc ? (
        <span
          className="material-symbols-outlined pointer-events-none absolute bottom-2 left-2 text-[22px] leading-none text-white drop-shadow-md"
          style={{ fontVariationSettings: "'FILL' 1" }}
          aria-hidden
        >
          play_circle
        </span>
      ) : null}
      {onMove ? (
        <div className="absolute left-1.5 top-1.5 z-[18] flex h-6 min-w-6 items-center justify-center rounded-full bg-black/45 text-white opacity-0 shadow-md backdrop-blur-sm transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <span className="material-symbols-outlined text-[15px] leading-none" aria-hidden>
            drag_indicator
          </span>
        </div>
      ) : null}
      {(m.mediaType === "image" || m.mediaType === "video") &&
      (m.publicUrl?.trim() || m.canvaDesignId?.trim()) ? (
        <button
          type="button"
          aria-label={t("postScheduler.canva.editInCanva")}
          title={t("postScheduler.canva.editInCanva")}
          onClick={openCanvaDesign}
          className="absolute right-8 top-1.5 z-[18] flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-surface/92 shadow-md ring-1 ring-outline-variant/20 opacity-0 backdrop-blur-sm transition-opacity hover:bg-surface group-hover:opacity-100 group-focus-within:opacity-100"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- static brand asset */}
          <img src={canvaIcon.src} alt="" className="h-3.5 w-3.5 object-contain" />
        </button>
      ) : null}
      <button
        type="button"
        aria-label={t("postScheduler.composer.removeAttachedMedia", {
          name: m.filename,
        })}
        onClick={() => onRemove(key)}
        className="absolute right-1.5 top-1.5 z-[18] flex h-6 w-6 items-center justify-center rounded-full bg-black/55 text-white shadow-md backdrop-blur-sm transition-colors hover:bg-error"
      >
        <span className="material-symbols-outlined text-[16px] leading-none">close</span>
      </button>
    </div>
  );
}

/** Removable previews — horizontal row below post body in composer. */
export function PostSchedulerEditorAttachedMediaStrip({
  media,
  onRemove,
  onMove,
  embedded = false,
}: PostSchedulerEditorAttachedMediaStripProps): ReactElement | null {
  const { t } = useTranslations();
  const [draggingKey, setDraggingKey] = useState<string | null>(null);

  if (media.length === 0) {
    return null;
  }

  const attributed = media.find((m) => m.attribution);

  return (
    <div
      className={
        embedded
          ? "min-w-0 flex-[1_1_45%]"
          : "mt-3 shrink-0 rounded-xl border border-outline-variant/15 bg-surface-container-low/60 px-3 py-2.5 sm:px-4"
      }
    >
      {!embedded ? (
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">
          {t("postScheduler.composer.attachedMediaLabel")}
        </p>
      ) : null}
      <div
        className={`no-scrollbar flex gap-2.5 overflow-x-auto pb-0.5 ${
          embedded ? "min-w-0 flex-row-reverse justify-start" : ""
        }`}
      >
        {media.map((m) => (
          <AttachedMediaTile
            key={attachedMediaKey(m)}
            compact
            media={m}
            onRemove={onRemove}
            onMove={onMove}
            onDragStart={setDraggingKey}
            onDragEnter={(targetKey) => {
              if (draggingKey && draggingKey !== targetKey) {
                onMove?.(draggingKey, targetKey);
              }
            }}
            onDragEnd={() => setDraggingKey(null)}
            dragging={draggingKey === attachedMediaKey(m)}
          />
        ))}
      </div>
      {attributed?.attribution ? (
        <p className="mt-2.5 text-[10px] font-medium leading-relaxed text-on-surface-variant">
          {t("postScheduler.mediaLibrary.unsplashPhotoBy")}{" "}
          <a
            href={attributed.attribution.creatorProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-secondary underline-offset-2 hover:underline"
          >
            {attributed.attribution.creatorName}
          </a>{" "}
          {t("postScheduler.mediaLibrary.unsplashOn")}{" "}
          <a
            href="https://unsplash.com/?utm_source=postsiva&utm_medium=referral"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-secondary underline-offset-2 hover:underline"
          >
            Unsplash
          </a>
        </p>
      ) : null}
    </div>
  );
}
