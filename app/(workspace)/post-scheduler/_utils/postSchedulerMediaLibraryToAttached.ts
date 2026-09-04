import type { UnifiedMediaListItem } from "@/lib/social/unifiedMediaApi";
import { mediaDisplayFilename } from "@/lib/social/mediaDisplayFilename";

import type { ComposerAttachedMedia } from "../_types/composerDraftTypes";

export function mediaLibraryItemToAttached(
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
    fileSizeBytes:
      typeof item.file_size === "number" && item.file_size > 0
        ? item.file_size
        : undefined,
  };
}
