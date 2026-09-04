import type { ComposerAttachedMedia } from "./composerAttachedMediaTypes";

const BLUESKY_IMAGE_MAX_BYTES = 2_000_000;

function formatBytesMb(bytes: number): string {
  return `${(bytes / (1000 * 1000)).toFixed(1)} MB`;
}

export function validateBlueskyImageSize(
  media: readonly ComposerAttachedMedia[],
): string | null {
  const oversized = media.find(
    (m) =>
      m.mediaType === "image" &&
      typeof m.fileSizeBytes === "number" &&
      Number.isFinite(m.fileSizeBytes) &&
      m.fileSizeBytes > BLUESKY_IMAGE_MAX_BYTES,
  );
  if (!oversized?.fileSizeBytes) {
    return null;
  }
  return `Bluesky images must be 2 MB or smaller. This image is about ${formatBytesMb(oversized.fileSizeBytes)}.`;
}
