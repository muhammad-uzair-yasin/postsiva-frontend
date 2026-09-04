import type { ComposerAttachedMedia } from "./composerAttachedMediaTypes";
import type { ComposerPostingAccount } from "./composerPostingAccount";

export type ComposerPostFormat = "standard" | "reel" | "story" | "link";

export function selectionIncludesFacebook(
  accounts: readonly Pick<ComposerPostingAccount, "platform">[],
): boolean {
  return accounts.some((a) => a.platform === "facebook");
}

/** Channels selected while post format is Link (Facebook Page only). */
export function accountsUnsupportedForLinkPostFormat(
  accounts: readonly Pick<ComposerPostingAccount, "displayName" | "platform">[],
): readonly Pick<ComposerPostingAccount, "displayName" | "platform">[] {
  return accounts.filter((a) => a.platform !== "facebook");
}

export function formatLinkPostUnsupportedChannelsMessage(
  unsupported: readonly Pick<ComposerPostingAccount, "displayName">[],
): string {
  if (unsupported.length === 0) {
    return "";
  }
  return [
    "Kindly deselect the channels below. Link posts are only supported on Facebook Pages.",
    "",
    ...unsupported.map((a) => `- ${a.displayName}`),
    "",
    "Remove those channels, or switch Post format back to Standard.",
  ].join("\n");
}

export function selectionIncludesMetaShortForm(
  accounts: readonly Pick<ComposerPostingAccount, "platform">[],
): boolean {
  return accounts.some(
    (a) => a.platform === "facebook" || a.platform === "instagram",
  );
}

export function validateMediaForPostFormat(
  format: ComposerPostFormat,
  media: readonly ComposerAttachedMedia[],
): { ok: true } | { ok: false; message: string } {
  if (format === "standard") {
    return { ok: true };
  }
  const images = media.filter((m) => m.mediaType === "image");
  const videos = media.filter((m) => m.mediaType === "video");
  const documents = media.filter((m) => m.mediaType === "document");
  if (documents.length > 0) {
    return {
      ok: false,
      message: "Reels and Stories cannot include documents.",
    };
  }
  if (format === "link") {
    if (media.length > 0) {
      return {
        ok: false,
        message: "Link posts cannot include attached media.",
      };
    }
    return { ok: true };
  }
  if (format === "reel") {
    if (videos.length !== 1) {
      return { ok: false, message: "Reels require exactly one video." };
    }
    if (images.length > 0) {
      return {
        ok: false,
        message: "Reels support one video only. Remove attached images.",
      };
    }
    return { ok: true };
  }
  if (videos.length === 1 && images.length === 0) {
    return { ok: true };
  }
  if (images.length === 1 && videos.length === 0) {
    return { ok: true };
  }
  return {
    ok: false,
    message: "Stories require exactly one image or one video.",
  };
}
