import type { ComposerAttachedMedia } from "./composerDraftTypes";

export interface PreviewIdentityProps {
  displayName?: string;
  avatarUrl?: string;
  /** LinkedIn personal feed: show "· 1st" next to the name (omit for company pages). */
  linkedinShowFirstDegree?: boolean;
  /** Live caption from the composer (same for all or per destination). */
  bodyText?: string;
  /** YouTube video title (composer field); description is {@link bodyText}. */
  youtubeTitle?: string | null;
  /** Optional selected thumbnail URL for YouTube video cover preview. */
  youtubeThumbnailUrl?: string | null;
  /** True when thumbnail will be generated at publish/schedule time. */
  youtubeGenerateThumbnail?: boolean;
  linkedinThumbnailUrl?: string | null;
  linkedinGenerateThumbnail?: boolean;
  /** Pinterest pin title (composer field); description is {@link bodyText}. */
  pinterestTitle?: string | null;
  /** TikTok Business photo title (composer field); caption is {@link bodyText}. */
  tiktokTitle?: string | null;
  /** Images and/or one video from the media library — shown in mockup cards. */
  attachedMedia?: readonly ComposerAttachedMedia[];
  /** True while AI is generating or editing an image — shimmer on preview media area. */
  imageGenerationShimmer?: boolean;
  /** Remove attached image/video from the composer (live preview overlay). */
  onRemoveMedia?: (mediaKey: string) => void;
  /** Reorder attached media from live preview drag/drop. */
  onMoveMedia?: (fromKey: string, toKey: string) => void;
  /** Stretch mockup card + media to fill synced preview column (composer modal). */
  fillAvailableHeight?: boolean;
  /** CSS aspect-ratio for single-image preview frame (e.g. Canva design size). */
  mediaAspectRatio?: string | null;
  /** Facebook link post: OG scrape preview (replaces media block). */
  facebookLinkPreview?: {
    readonly url: string;
    readonly title: string | null;
    readonly description: string | null;
    readonly imageUrl: string | null;
    readonly siteName: string | null;
    readonly engagementSummary: string | null;
    readonly loading: boolean;
    readonly error: string | null;
    readonly publishBlockMessage?: string | null;
  } | null;
}
