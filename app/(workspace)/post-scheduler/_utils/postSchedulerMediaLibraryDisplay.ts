import type { WorkspaceUnifiedMediaFilter } from "../_hooks/useWorkspaceUnifiedMediaLibrary";
import type { UnifiedMediaListItem } from "@/lib/social/unifiedMediaApi";

/** Legacy copy for callers not yet on i18n (e.g. AI pipeline picker). */
export const MEDIA_LIBRARY_EMPTY_COPY: Record<
  WorkspaceUnifiedMediaFilter,
  string
> = {
  all: "No media in this workspace yet. Upload from the web app or other flows.",
  image: "No images in this workspace yet.",
  video: "No videos in this workspace yet.",
  document: "No documents in this workspace yet.",
};

export function mediaLibraryEmptyCopy(
  filter: WorkspaceUnifiedMediaFilter,
  t: (key: string) => string,
): string {
  switch (filter) {
    case "all":
      return t("postScheduler.mediaLibrary.emptyAll");
    case "image":
      return t("postScheduler.mediaLibrary.emptyImages");
    case "video":
      return t("postScheduler.mediaLibrary.emptyVideos");
    case "document":
      return t("postScheduler.mediaLibrary.emptyDocuments");
  }
}

export function isEmptyForFilter(
  list: readonly UnifiedMediaListItem[],
  f: WorkspaceUnifiedMediaFilter,
): boolean {
  if (list.length === 0) {
    return true;
  }
  if (f === "all") {
    return false;
  }
  if (f === "image") {
    return !list.some((i) => i.media_type !== "video" && i.media_type !== "document");
  }
  if (f === "document") {
    return !list.some((i) => i.media_type === "document");
  }
  return !list.some((i) => i.media_type === "video");
}
