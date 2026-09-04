"use client";

import type { ComposerAttachedMedia } from "@/lib/post-composer/composerAttachedMediaTypes";
import type { StockMediaItem } from "@/lib/social/stockMediaApi";
import type { ReactElement } from "react";

function label(item: StockMediaItem): string {
  if (item.stock_id.startsWith("px:")) return "Pexels";
  if (item.stock_id.startsWith("pb:")) return "Pixabay";
  return "Unsplash";
}

export function PostSchedulerWordPressRecommendedImages({
  images,
  onPick,
}: {
  readonly images: readonly StockMediaItem[];
  readonly onPick: (media: ComposerAttachedMedia) => void;
}): ReactElement | null {
  if (images.length === 0) return null;

  const pick = (item: StockMediaItem): void => {
    onPick({
      mediaId: "",
      publicUrl: item.full_url,
      mediaType: "image",
      filename: `recommended-${item.stock_id.replace(":", "-")}`,
      thumbnailUrl: item.thumb_url || item.preview_url,
    });
  };

  return (
    <section className="rounded-xl border border-outline-variant/15 bg-surface-container-low/80 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold text-on-surface">Recommended images</p>
        <p className="text-[11px] text-on-surface-variant">1200 x 675 when saved</p>
      </div>
      <div className="mt-3 grid auto-cols-[171px] grid-flow-col grid-rows-2 gap-2 overflow-x-auto pb-1">
        {images.slice(0, 36).map((item) => (
          <button
            key={item.stock_id}
            type="button"
            onClick={() => pick(item)}
            className="group relative h-[96px] w-[171px] overflow-hidden rounded-lg border border-outline-variant/20 bg-surface-container text-left"
            style={{ aspectRatio: "16 / 9" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- stock provider image preview */}
            <img
              src={item.preview_url || item.thumb_url}
              alt={item.alt || label(item)}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
            <span className="absolute bottom-1 left-1 rounded bg-black/65 px-1.5 py-0.5 text-[10px] font-bold text-white">
              {label(item)}
            </span>
            <span className="material-symbols-outlined absolute right-1 top-1 rounded-full bg-black/65 p-1 text-[15px] leading-none text-white">
              add_photo_alternate
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
