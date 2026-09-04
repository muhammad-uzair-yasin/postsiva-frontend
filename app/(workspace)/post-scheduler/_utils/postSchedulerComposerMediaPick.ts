import type { ComposerAttachedMedia } from "../_types/composerDraftTypes";

const MAX_IMAGES = 10;

export function composerAttachedMediaKey(item: ComposerAttachedMedia): string {
  return item.mediaId || item.publicUrl;
}

function mediaKey(item: ComposerAttachedMedia): string {
  return composerAttachedMediaKey(item);
}

function canvaDesignKey(item: ComposerAttachedMedia): string {
  return item.canvaDesignId?.trim() || "";
}

/**
 * Replace an existing attachment by media key / design id, otherwise merge as pick.
 */
export function replaceOrMergeAttachedMedia(
  prev: readonly ComposerAttachedMedia[],
  item: ComposerAttachedMedia,
  replaceKey?: string | null,
): ComposerAttachedMedia[] {
  const key = replaceKey?.trim();
  if (key) {
    const idx = prev.findIndex(
      (m) => mediaKey(m) === key || canvaDesignKey(m) === key,
    );
    if (idx >= 0) {
      const next = [...prev];
      next[idx] = item;
      return next;
    }
  }
  return mergeAttachedMediaOnPick(prev, item);
}

/**
 * Multiple images for non-video posts (toggle on/off per tap), or one video with
 * optional one image thumbnail. Selection order does not matter.
 * Returning from Canva with the same design_id replaces the prior attachment.
 */
export function mergeAttachedMediaOnPick(
  prev: readonly ComposerAttachedMedia[],
  item: ComposerAttachedMedia,
): ComposerAttachedMedia[] {
  if (item.mediaType === "document") {
    const onlyDoc = prev.length === 1 && mediaKey(prev[0]) === mediaKey(item);
    return onlyDoc ? [] : [item];
  }
  if (prev.some((m) => m.mediaType === "document")) {
    return item.mediaType === "video" ? [item] : [item];
  }

  const designKey = canvaDesignKey(item);
  if (designKey) {
    const withoutSameDesign = prev.filter((m) => canvaDesignKey(m) !== designKey);
    if (withoutSameDesign.length !== prev.length) {
      const existingVideo = withoutSameDesign.find((m) => m.mediaType === "video");
      const otherImages = withoutSameDesign.filter((m) => m.mediaType === "image");
      if (item.mediaType === "video") {
        return otherImages.length > 0 ? [otherImages[0], item] : [item];
      }
      if (existingVideo) {
        return [item, existingVideo];
      }
      if (otherImages.length >= MAX_IMAGES) {
        return [...otherImages.slice(0, MAX_IMAGES - 1), item];
      }
      return [...otherImages, item];
    }
  }

  const existingVideo = prev.find((m) => m.mediaType === "video");
  const existingImages = prev.filter((m) => m.mediaType === "image");

  if (item.mediaType === "video") {
    const onlyThisVideo =
      existingVideo ? mediaKey(existingVideo) === mediaKey(item) && existingImages.length === 0 : false;
    if (onlyThisVideo) {
      return [];
    }
    return existingImages.length > 0 ? [existingImages[0], item] : [item];
  }

  if (existingVideo) {
    const sameThumb = existingImages[0] ? mediaKey(existingImages[0]) === mediaKey(item) : false;
    if (sameThumb) {
      return [existingVideo];
    }
    return [item, existingVideo];
  }

  if (existingImages.some((m) => mediaKey(m) === mediaKey(item))) {
    return existingImages.filter((m) => mediaKey(m) !== mediaKey(item));
  }
  if (existingImages.length >= MAX_IMAGES) {
    return [...prev];
  }
  return [...existingImages, item];
}
