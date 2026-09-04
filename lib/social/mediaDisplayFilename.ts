import type { UnifiedMediaListItem } from "@/lib/social/unifiedMediaApi";

/** User-facing document/media label (original upload name when available). */
export function mediaDisplayFilename(item: {
  filename?: string | null;
  original_filename?: string | null;
}): string {
  const original = item.original_filename?.trim();
  if (original) {
    return original;
  }
  return item.filename?.trim() || "Document";
}

export function mediaThumbnailUrl(item: UnifiedMediaListItem): string | null {
  const url = item.thumbnail_url?.trim();
  return url || null;
}
