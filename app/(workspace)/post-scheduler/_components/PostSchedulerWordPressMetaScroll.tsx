"use client";

import type { ReactElement, ReactNode } from "react";

import type { StockMediaItem } from "@/lib/social/stockMediaApi";

import type { ComposerAttachedMedia } from "../_types/composerDraftTypes";
import { PostSchedulerWordPressRecommendedImages } from "./PostSchedulerWordPressRecommendedImages";

/** Recommended stock images — separate block directly above post body. */
export function PostSchedulerWordPressRecommendedImagesAboveBody({
  images,
  onPick,
}: {
  readonly images: readonly StockMediaItem[];
  readonly onPick: (media: ComposerAttachedMedia) => void;
}): ReactElement | null {
  if (images.length === 0) {
    return null;
  }
  return (
    <div className="mt-4 shrink-0 rounded-2xl border border-outline-variant/15 bg-surface-container-low/35 p-3 ring-1 ring-white/[0.03]">
      <PostSchedulerWordPressRecommendedImages images={images} onPick={onPick} />
    </div>
  );
}

/** Fixed-height scroll region for WordPress title/slug/taxonomies only. */
export function PostSchedulerWordPressMetaScroll({
  children,
}: {
  readonly children: ReactNode;
}): ReactElement {
  return (
    <div className="h-[min(14.5rem,32vh)] shrink-0 overflow-x-hidden overflow-y-auto rounded-2xl border border-outline-variant/15 bg-surface-container-low/35 p-3 ring-1 ring-white/[0.03] postsiva-scrollbar">
      <div className="space-y-4 pr-1">{children}</div>
    </div>
  );
}
