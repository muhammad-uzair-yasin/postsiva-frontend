import type { ComposerAttachedMedia } from "./composerAttachedMediaTypes";

export type ComposerPostKind = "text" | "image" | "video" | "carousel" | "document";

export interface ComposerPostKindInvalid {
  readonly ok: false;
  readonly message: string;
}

export type InferComposerPostKindResult =
  | { readonly ok: true; readonly kind: ComposerPostKind }
  | ComposerPostKindInvalid;

export function inferComposerPostKind(
  media: readonly ComposerAttachedMedia[],
): InferComposerPostKindResult {
  const images = media.filter((m) => m.mediaType === "image");
  const videos = media.filter((m) => m.mediaType === "video");
  const documents = media.filter((m) => m.mediaType === "document");
  if (documents.length > 1) {
    return { ok: false, message: "Attach only one document per post." };
  }
  if (documents.length === 1) {
    if (images.length > 0 || videos.length > 0) {
      return {
        ok: false,
        message: "Document posts cannot be combined with images or video.",
      };
    }
    return { ok: true, kind: "document" };
  }
  if (videos.length > 1) {
    return { ok: false, message: "Attach only one video per post." };
  }
  if (videos.length === 1) {
    if (images.length > 1) {
      return {
        ok: false,
        message: "For video posts, attach at most one image as thumbnail.",
      };
    }
    return { ok: true, kind: "video" };
  }
  if (images.length >= 2) {
    if (images.length > 20) {
      return { ok: false, message: "Carousel supports at most 20 images." };
    }
    return { ok: true, kind: "carousel" };
  }
  if (images.length === 1) {
    return { ok: true, kind: "image" };
  }
  return { ok: true, kind: "text" };
}
