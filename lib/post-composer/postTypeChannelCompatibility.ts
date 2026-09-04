import type { ComposerPostKind } from "./inferComposerPostKind";
import type { ComposerPostingAccount } from "./composerPostingAccount";
import type { UnifiedApiPlatform } from "./unifiedPostingPlatforms";
import {
  filterPlatformsForComposerKind,
  iconPlatformToUnifiedApiPlatform,
  UNIFIED_IMAGE_PLATFORMS,
  UNIFIED_TEXT_PLATFORMS,
  UNIFIED_VIDEO_PLATFORMS,
  UNIFIED_DOCUMENT_PLATFORMS,
} from "./unifiedPostingPlatforms";

type SupportedKindLabel = "Text" | "Image" | "Carousel" | "Video" | "Document";

function postKindLabel(kind: ComposerPostKind): SupportedKindLabel {
  switch (kind) {
    case "text":
      return "Text";
    case "image":
      return "Image";
    case "carousel":
      return "Carousel";
    case "video":
      return "Video";
    case "document":
      return "Document";
  }
}

function unifiedApiPlatformDisplayName(platform: UnifiedApiPlatform): string {
  switch (platform) {
    case "linkedin":
      return "LinkedIn";
    case "facebook":
      return "Facebook";
    case "instagram":
      return "Instagram";
    case "threads":
      return "Threads";
    case "tiktok":
      return "TikTok";
    case "youtube":
      return "YouTube";
    case "pinterest":
      return "Pinterest";
    case "bluesky":
      return "Bluesky";
    case "mastodon":
      return "Mastodon";
    case "wordpress":
      return "WordPress";
  }
}

export function getSupportedPostKindsForUnifiedPlatform(
  platform: UnifiedApiPlatform,
): ComposerPostKind[] {
  const supported: ComposerPostKind[] = [];

  if (UNIFIED_TEXT_PLATFORMS.has(platform)) {
    supported.push("text");
  }

  if (UNIFIED_IMAGE_PLATFORMS.has(platform)) {
    supported.push("image", "carousel");
  }

  if (UNIFIED_VIDEO_PLATFORMS.has(platform)) {
    supported.push("video");
  }

  if (UNIFIED_DOCUMENT_PLATFORMS.has(platform)) {
    supported.push("document");
  }

  const order: ComposerPostKind[] = ["text", "image", "carousel", "video", "document"];
  return order.filter((k) => supported.includes(k));
}

export function isPostKindSupportedOnChannel(
  account: Pick<ComposerPostingAccount, "platform">,
  postKind: ComposerPostKind,
): boolean {
  const apiPlat = iconPlatformToUnifiedApiPlatform(account.platform);
  if (!apiPlat) {
    return false;
  }
  const { skipped } = filterPlatformsForComposerKind([apiPlat], postKind);
  return skipped.length === 0;
}

export type UnsupportedChannelEntry = {
  readonly channelLabel: string;
  readonly unifiedPlatform: UnifiedApiPlatform;
  readonly postKind: ComposerPostKind;
  readonly supportedKinds: ComposerPostKind[];
};

export function buildUnsupportedChannelsPostTypeMessage(
  unsupported: readonly UnsupportedChannelEntry[],
): string {
  const lines = unsupported.map((u) => {
    const supportedText = u.supportedKinds.length
      ? u.supportedKinds.map(postKindLabel).join(", ")
      : "No supported formats";
    return `- ${u.channelLabel}: ${postKindLabel(u.postKind)} not supported. Supported: ${supportedText}.`;
  });

  const exampleHint = ((): string | null => {
    const hasText = unsupported.some((u) => u.postKind === "text");
    if (!hasText) {
      return null;
    }
    return "If this is a text-only post, try adding image/carousel/video media (or switch post format).";
  })();

  return [
    "Some of your selected channels cannot receive your current post format.",
    "",
    "Unsupported channels:",
    ...lines,
    "",
    "What you can do:",
    "1) Remove the unsupported channels from Post Targets.",
    "2) Or change your post format to a supported type for those channels, then try again.",
    exampleHint ? exampleHint : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildUnsupportedSinglePlatformPostTypeMessage(input: {
  readonly channelLabel: string;
  readonly unifiedPlatform: UnifiedApiPlatform;
  readonly postKind: ComposerPostKind;
}): string {
  const supportedKinds = getSupportedPostKindsForUnifiedPlatform(
    input.unifiedPlatform,
  );
  const supportedText = supportedKinds.length
    ? supportedKinds.map(postKindLabel).join(", ")
    : "No supported formats";
  const platformName = unifiedApiPlatformDisplayName(input.unifiedPlatform);

  return [
    `You can’t schedule this ${postKindLabel(input.postKind)} post on ${platformName}.`,
    `Supported formats: ${supportedText}.`,
    "",
    "Action needed:",
    "Create a new post for this channel using one of the supported formats, then Publish or Schedule it again.",
    input.channelLabel.trim() ? `(${input.channelLabel})` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
