import type { SocialPlatformIconId } from "@/lib/social/socialPlatformIconSrc";

import type { ComposerAttachedMedia } from "./composerAttachedMediaTypes";
import type { ComposerPostFormat } from "./composerPostFormat";
import type { ComposerPostingAccount } from "./composerPostingAccount";

const PLATFORM_LABEL: Record<SocialPlatformIconId, string> = {
  threads: "Threads",
  x: "X",
  bluesky: "Bluesky",
  mastodon: "Mastodon",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  pinterest: "Pinterest",
  facebook: "Facebook",
  youtube: "YouTube",
  wordpress: "WordPress",
  whatsapp: "WhatsApp",
};

/** API-oriented caps used in the composer (not always native-app max). */
type VideoLimits = {
  readonly maxSeconds?: number;
  readonly maxBytes?: number;
};

function videoLimitsForPlatform(
  platform: SocialPlatformIconId,
  postFormat: ComposerPostFormat,
): VideoLimits {
  if (platform === "wordpress" || platform === "whatsapp") {
    return {};
  }
  if (postFormat === "reel") {
    if (platform === "instagram" || platform === "facebook") {
      // Meta Reels via API: keep a practical composer cap (15 min / 300 MB).
      return { maxSeconds: 900, maxBytes: 300 * 1024 * 1024 };
    }
    return {};
  }
  if (postFormat === "story") {
    if (platform === "instagram" || platform === "facebook") {
      return { maxSeconds: 60, maxBytes: 100 * 1024 * 1024 };
    }
    return {};
  }
  switch (platform) {
    case "x":
      return { maxSeconds: 140, maxBytes: 512 * 1024 * 1024 };
    case "threads":
      return { maxSeconds: 300, maxBytes: 1024 * 1024 * 1024 };
    case "bluesky":
      return { maxSeconds: 180, maxBytes: 100 * 1024 * 1024 };
    case "instagram":
      return { maxSeconds: 60, maxBytes: 100 * 1024 * 1024 };
    case "tiktok":
      return { maxSeconds: 600, maxBytes: 4 * 1024 * 1024 * 1024 };
    case "linkedin":
      return { maxSeconds: 30 * 60, maxBytes: 500 * 1024 * 1024 };
    case "facebook":
      return { maxSeconds: 45 * 60, maxBytes: 1024 * 1024 * 1024 };
    case "youtube":
      return { maxSeconds: 12 * 60 * 60, maxBytes: 256 * 1024 * 1024 * 1024 };
    case "pinterest":
      return { maxSeconds: 15 * 60, maxBytes: 2 * 1024 * 1024 * 1024 };
    case "mastodon":
      return { maxSeconds: 24 * 60 * 60, maxBytes: 99 * 1024 * 1024 };
    default:
      return {};
  }
}

function maxVideoSecondsForPlatform(
  platform: SocialPlatformIconId,
  postFormat: ComposerPostFormat,
): number | undefined {
  return videoLimitsForPlatform(platform, postFormat).maxSeconds;
}

function maxVideoBytesForPlatform(
  platform: SocialPlatformIconId,
  postFormat: ComposerPostFormat,
): number | undefined {
  return videoLimitsForPlatform(platform, postFormat).maxBytes;
}

export function formatVideoDurationClock(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

export function formatVideoDurationHuman(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  if (minutes > 0 && secs > 0) {
    const minuteLabel = minutes === 1 ? "minute" : "minutes";
    const secondLabel = secs === 1 ? "second" : "seconds";
    return `${minutes} ${minuteLabel} and ${secs} ${secondLabel}`;
  }
  if (minutes > 0) {
    return minutes === 1 ? "1 minute" : `${minutes} minutes`;
  }
  return secs === 1 ? "1 second" : `${secs} seconds`;
}

export function formatVideoSizeHuman(bytes: number): string {
  const n = Math.max(0, bytes);
  const mb = n / (1024 * 1024);
  if (mb >= 1024) {
    const gb = mb / 1024;
    return `${gb >= 10 ? gb.toFixed(0) : gb.toFixed(1)} GB`;
  }
  if (mb >= 1) {
    return `${mb >= 10 ? mb.toFixed(0) : mb.toFixed(1)} MB`;
  }
  const kb = n / 1024;
  return `${Math.max(1, Math.round(kb))} KB`;
}

export function videoDurationFromMedia(
  media: readonly ComposerAttachedMedia[],
): number | null | undefined {
  return media.find((m) => m.mediaType === "video")?.durationSeconds;
}

export function videoFileSizeFromMedia(
  media: readonly ComposerAttachedMedia[],
): number | null | undefined {
  return media.find((m) => m.mediaType === "video")?.fileSizeBytes;
}

export function maxVideoDurationForSelectedAccounts(
  accounts: readonly { platform: SocialPlatformIconId }[],
  postFormat: ComposerPostFormat,
): number | undefined {
  if (accounts.length === 0) {
    return undefined;
  }
  const limits: number[] = [];
  for (const account of accounts) {
    const limit = maxVideoSecondsForPlatform(account.platform, postFormat);
    if (limit !== undefined) {
      limits.push(limit);
    }
  }
  if (limits.length === 0) {
    return undefined;
  }
  return Math.min(...limits);
}

export function maxVideoBytesForSelectedAccounts(
  accounts: readonly { platform: SocialPlatformIconId }[],
  postFormat: ComposerPostFormat,
): number | undefined {
  if (accounts.length === 0) {
    return undefined;
  }
  const limits: number[] = [];
  for (const account of accounts) {
    const limit = maxVideoBytesForPlatform(account.platform, postFormat);
    if (limit !== undefined) {
      limits.push(limit);
    }
  }
  if (limits.length === 0) {
    return undefined;
  }
  return Math.min(...limits);
}

export function validateComposerVideoDurationForJob(input: {
  readonly account: ComposerPostingAccount;
  readonly durationSeconds: number | null | undefined;
  readonly postFormat: ComposerPostFormat;
  readonly fileSizeBytes?: number | null;
}): string | null {
  const name = PLATFORM_LABEL[input.account.platform] ?? input.account.platform;
  const limits = videoLimitsForPlatform(input.account.platform, input.postFormat);

  if (
    limits.maxSeconds !== undefined &&
    input.durationSeconds != null &&
    Number.isFinite(input.durationSeconds) &&
    input.durationSeconds > limits.maxSeconds
  ) {
    return (
      `${input.account.displayName}: Video is too long for ${name}. ` +
      `Maximum is ${formatVideoDurationHuman(limits.maxSeconds)}, but your video is about ` +
      `${formatVideoDurationHuman(input.durationSeconds)}.`
    );
  }

  if (
    limits.maxBytes !== undefined &&
    input.fileSizeBytes != null &&
    Number.isFinite(input.fileSizeBytes) &&
    input.fileSizeBytes > limits.maxBytes
  ) {
    return (
      `${input.account.displayName}: Video file is too large for ${name}. ` +
      `Maximum is ${formatVideoSizeHuman(limits.maxBytes)}, but your video is about ` +
      `${formatVideoSizeHuman(input.fileSizeBytes)}.`
    );
  }

  return null;
}

export function describeVideoDurationViolationsForSelectedAccounts(input: {
  readonly accounts: readonly ComposerPostingAccount[];
  readonly durationSeconds: number | null | undefined;
  readonly postFormat: ComposerPostFormat;
  readonly fileSizeBytes?: number | null;
}): string | null {
  const durationProblems: string[] = [];
  const sizeProblems: string[] = [];

  for (const account of input.accounts) {
    const limits = videoLimitsForPlatform(account.platform, input.postFormat);
    const label = PLATFORM_LABEL[account.platform] ?? account.platform;
    if (
      limits.maxSeconds !== undefined &&
      input.durationSeconds != null &&
      Number.isFinite(input.durationSeconds) &&
      input.durationSeconds > limits.maxSeconds
    ) {
      durationProblems.push(
        `${account.displayName} (${label}: ${formatVideoDurationHuman(limits.maxSeconds)})`,
      );
    }
    if (
      limits.maxBytes !== undefined &&
      input.fileSizeBytes != null &&
      Number.isFinite(input.fileSizeBytes) &&
      input.fileSizeBytes > limits.maxBytes
    ) {
      sizeProblems.push(
        `${account.displayName} (${label}: ${formatVideoSizeHuman(limits.maxBytes)})`,
      );
    }
  }

  const parts: string[] = [];
  if (durationProblems.length > 0 && input.durationSeconds != null) {
    parts.push(
      `Video is too long for: ${durationProblems.join(", ")}. ` +
        `Your video is about ${formatVideoDurationHuman(input.durationSeconds)}.`,
    );
  }
  if (sizeProblems.length > 0 && input.fileSizeBytes != null) {
    parts.push(
      `Video file is too large for: ${sizeProblems.join(", ")}. ` +
        `Your video is about ${formatVideoSizeHuman(input.fileSizeBytes)}.`,
    );
  }
  if (parts.length === 0) {
    return null;
  }
  return `${parts.join(" ")} Use a shorter/smaller video or deselect those platforms.`;
}
