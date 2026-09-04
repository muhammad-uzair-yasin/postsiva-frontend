import type { UnifiedMediaListItem } from "@/lib/social/unifiedMediaApi";
import { mediaDisplayFilename } from "@/lib/social/mediaDisplayFilename";

import type { ComposerAttachedMedia } from "../_types/composerDraftTypes";

const HANDOFF_KEY = "postsiva:library-use-in-post";

export function unifiedMediaToAttachedMedia(
  item: UnifiedMediaListItem,
): ComposerAttachedMedia {
  const mediaType =
    item.media_type === "video"
      ? "video"
      : item.media_type === "document"
        ? "document"
        : "image";
  return {
    mediaId: item.media_id,
    publicUrl: item.public_url,
    mediaType,
    filename: mediaDisplayFilename(item),
    thumbnailUrl: item.thumbnail_url?.trim() || undefined,
  };
}

/** Stash a Library "Use in post" pick for the composer to attach after navigation. */
export function stashLibraryUseInPost(media: ComposerAttachedMedia): void {
  try {
    sessionStorage.setItem(HANDOFF_KEY, JSON.stringify(media));
  } catch {
    // Storage unavailable — navigation still works, media just is not pre-attached.
  }
}

export function consumeLibraryUseInPost(): ComposerAttachedMedia | null {
  try {
    const raw = sessionStorage.getItem(HANDOFF_KEY);
    if (!raw) {
      return null;
    }
    sessionStorage.removeItem(HANDOFF_KEY);
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof (parsed as ComposerAttachedMedia).mediaId !== "string" ||
      typeof (parsed as ComposerAttachedMedia).publicUrl !== "string"
    ) {
      return null;
    }
    return parsed as ComposerAttachedMedia;
  } catch {
    return null;
  }
}
