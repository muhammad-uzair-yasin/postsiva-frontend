import type { ComposerAttachedMedia } from "./composerAttachedMediaTypes";
import type { InferComposerPostKindResult } from "./inferComposerPostKind";

/**
 * WordPress blog posts carry long HTML in `wordpress.wordpress_content`; composer
 * attachments (featured image, inline gallery, video) ride alongside as unified
 * media fields — not as a single-platform "text only" post.
 */
export function inferWordPressComposerPostKind(
  media: readonly ComposerAttachedMedia[],
): InferComposerPostKindResult {
  const images = media.filter((m) => m.mediaType === "image");
  const videos = media.filter((m) => m.mediaType === "video");
  const documents = media.filter((m) => m.mediaType === "document");

  if (documents.length > 0) {
    return {
      ok: false,
      message: "WordPress articles cannot include document attachments in the composer.",
    };
  }
  if (videos.length > 1) {
    return { ok: false, message: "Attach only one video per WordPress article." };
  }
  if (videos.length === 1) {
    return { ok: true, kind: "video" };
  }
  if (images.length >= 2) {
    if (images.length > 20) {
      return { ok: false, message: "WordPress supports at most 20 attached images." };
    }
    return { ok: true, kind: "carousel" };
  }
  if (images.length === 1) {
    return { ok: true, kind: "image" };
  }
  return { ok: true, kind: "text" };
}

/** Merge all composer attachments onto a WordPress job (video posts may still carry image_ids). */
export function mergeWordPressAttachedMediaFields(
  body: Record<string, unknown>,
  media: readonly ComposerAttachedMedia[],
): Record<string, unknown> {
  const images = media.filter((m) => m.mediaType === "image");
  const videos = media.filter((m) => m.mediaType === "video");
  const out = { ...body };

  if (videos.length === 1) {
    const v = videos[0];
    if (v?.mediaId?.trim()) {
      out.video_id = v.mediaId.trim();
    } else if (v?.publicUrl?.trim()) {
      out.video_url = v.publicUrl.trim();
    }
  }

  if (images.length === 1) {
    const img = images[0];
    if (img?.mediaId?.trim()) {
      out.default_image_id = img.mediaId.trim();
    } else if (img?.publicUrl?.trim()) {
      out.default_image_url = img.publicUrl.trim();
    }
  } else if (images.length >= 2) {
    const ids = images.map((m) => m.mediaId?.trim() || "");
    const urls = images.map((m) =>
      !m.mediaId?.trim() && m.publicUrl?.trim() ? m.publicUrl.trim() : "",
    );
    const hasIds = ids.some((id) => id.length > 0);
    const hasUrls = urls.some((url) => url.length > 0);
    if (hasIds) {
      out.image_ids = ids;
    }
    if (hasUrls) {
      out.image_urls = urls;
    }
  }

  return out;
}
