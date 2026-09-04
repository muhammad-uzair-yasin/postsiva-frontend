import type { ComposerAttachedMedia } from "@/lib/post-composer/composerAttachedMediaTypes";
import type { UnifiedMediaListItem } from "@/lib/social/unifiedMediaApi";

export function unifiedMediaItemToComposerAttached(
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
    filename: item.original_filename?.trim() || item.filename || "",
    thumbnailUrl: item.thumbnail_url?.trim() || undefined,
  };
}
