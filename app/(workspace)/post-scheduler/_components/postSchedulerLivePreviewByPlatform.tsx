import type { ReactElement } from "react";

import type { ComposerPlatformKind } from "../_data/postSchedulerComposerChannelAccounts";
import type { ComposerAttachedMedia } from "../_types/composerDraftTypes";
import type { PreviewIdentityProps } from "../_types/postSchedulerPreviewIdentity";
import { PostSchedulerFeedStylePreviewMockup } from "./PostSchedulerFeedStylePreviewMockup";
import { PostSchedulerYouTubePreviewMockup } from "./PostSchedulerYouTubePreviewMockup";

export const PREVIEW_TAB_LABEL_KEY: Record<ComposerPlatformKind, string> = {
  instagram: "postScheduler.preview.tabInstagram",
  x: "postScheduler.preview.tabX",
  facebook: "postScheduler.preview.tabFacebook",
  linkedin: "postScheduler.preview.tabLinkedin",
  youtube: "postScheduler.preview.tabYoutube",
  tiktok: "postScheduler.preview.tabTiktok",
  pinterest: "postScheduler.preview.tabPinterest",
  threads: "postScheduler.preview.tabThreads",
  bluesky: "postScheduler.preview.tabBluesky",
  mastodon: "postScheduler.preview.tabMastodon",
  wordpress: "WordPress",
  whatsapp: "postScheduler.preview.tabWhatsapp",
};

export function getPreviewTabLabel(
  platform: ComposerPlatformKind,
  t: (key: string) => string,
): string {
  return t(PREVIEW_TAB_LABEL_KEY[platform]);
}

/** @deprecated Use getPreviewTabLabel(platform, t) */
export const PREVIEW_TAB_LABEL: Record<ComposerPlatformKind, string> = {
  instagram: "INSTAGRAM",
  x: "X / TWITTER",
  facebook: "FACEBOOK",
  linkedin: "LINKEDIN",
  youtube: "YOUTUBE",
  tiktok: "TIKTOK",
  pinterest: "PINTEREST",
  threads: "THREADS",
  bluesky: "BLUESKY",
  mastodon: "MASTODON",
  wordpress: "WORDPRESS",
  whatsapp: "WHATSAPP",
};

const FEED_STYLE_PLATFORMS = new Set<ComposerPlatformKind>([
  "instagram",
  "x",
  "facebook",
  "linkedin",
  "tiktok",
  "pinterest",
  "threads",
  "bluesky",
  "mastodon",
  "wordpress",
  "whatsapp",
]);

function isFeedStylePlatform(
  platform: ComposerPlatformKind,
): platform is Exclude<ComposerPlatformKind, "youtube"> {
  return FEED_STYLE_PLATFORMS.has(platform);
}

export function renderLivePreviewMockupForPlatform(
  platform: ComposerPlatformKind,
  identity: Pick<
    PreviewIdentityProps,
    "displayName" | "avatarUrl" | "linkedinShowFirstDegree"
  >,
  bodyText: string,
  attachedMedia: readonly ComposerAttachedMedia[] = [],
  youtubeTitle: string | null = null,
  youtubeThumbnailUrl: string | null = null,
  youtubeGenerateThumbnail = false,
  linkedinThumbnailUrl: string | null = null,
  linkedinGenerateThumbnail = false,
  pinterestTitle: string | null = null,
  tiktokTitle: string | null = null,
  imageGenerationShimmer = false,
  onRemoveMedia?: (mediaKey: string) => void,
  onMoveMedia?: (fromKey: string, toKey: string) => void,
  fillAvailableHeight = false,
  facebookLinkPreview: PreviewIdentityProps["facebookLinkPreview"] = null,
  mediaAspectRatio: string | null = null,
): ReactElement {
  const trimmedYt = youtubeTitle?.trim();
  const trimmedPinterest = pinterestTitle?.trim();
  const trimmedTiktok = tiktokTitle?.trim();
  const props: PreviewIdentityProps = {
    ...identity,
    bodyText,
    attachedMedia,
    youtubeTitle: trimmedYt ? trimmedYt : null,
    youtubeThumbnailUrl: youtubeThumbnailUrl?.trim() ? youtubeThumbnailUrl.trim() : null,
    youtubeGenerateThumbnail,
    linkedinThumbnailUrl:
      linkedinThumbnailUrl?.trim() ? linkedinThumbnailUrl.trim() : null,
    linkedinGenerateThumbnail,
    pinterestTitle: trimmedPinterest ? trimmedPinterest : null,
    tiktokTitle: trimmedTiktok ? trimmedTiktok : null,
    imageGenerationShimmer,
    onRemoveMedia,
    onMoveMedia,
    fillAvailableHeight,
    facebookLinkPreview,
    mediaAspectRatio,
  };
  if (platform === "youtube") {
    return <PostSchedulerYouTubePreviewMockup {...props} />;
  }
  if (isFeedStylePlatform(platform)) {
    return <PostSchedulerFeedStylePreviewMockup platform={platform} {...props} />;
  }
  return <PostSchedulerFeedStylePreviewMockup platform="facebook" {...props} />;
}
