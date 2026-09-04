import type { WordPressComposerFields } from "@/lib/post-composer/buildComposerPostJobs";
import type { ComposerAttachedMedia } from "@/lib/post-composer/composerAttachedMediaTypes";
import type { ComposerContentMode } from "@/lib/post-composer/composerContentModeTypes";
import type {
  ComposerDraftScope,
  PerChannelDraftSnapshot,
} from "@/lib/post-composer/composerDraftScopeTypes";
import type { ComposerPostFormat } from "@/lib/post-composer/composerPostFormat";
import type { ComposerPublishProgressRow } from "@/lib/post-composer/composerPublishProgressRows";

import type { ComposerChannelAccount } from "../_data/postSchedulerComposerChannelAccounts";

export interface ComposerPublishOverlayState {
  readonly mode: "progress" | "summary";
  readonly warnings: readonly string[];
  readonly rows: readonly ComposerPublishProgressRow[];
  readonly variant: "success" | "partial";
}

export interface PostSchedulerUnifiedPostParams {
  readonly postTargetIds: readonly string[];
  readonly accounts: readonly ComposerChannelAccount[];
  readonly postNowDisabled: boolean;
  readonly draftScope: ComposerDraftScope;
  readonly contentMode: ComposerContentMode;
  readonly unifiedBody: string;
  readonly unifiedMedia: readonly ComposerAttachedMedia[];
  readonly perChannelDrafts: Readonly<Record<string, PerChannelDraftSnapshot>>;
  readonly youtubeTitle: string | null;
  readonly youtubePlaylistId: string | null;
  readonly youtubeThumbnailMediaId: string | null;
  readonly youtubeGenerateThumbnail: boolean;
  readonly youtubeMadeForKids: boolean;
  readonly linkedinThumbnailMediaId: string | null;
  readonly linkedinGenerateThumbnail: boolean;
  readonly pinterestTitle: string | null;
  readonly tiktokTitle: string | null;
  /** WordPress composer fields; without these a blog post publishes untitled. */
  readonly wordpress?: WordPressComposerFields | null;
  /** Creates missing AI-suggested WordPress terms immediately before publish. */
  readonly prepareWordpressFields?: (
    fields: WordPressComposerFields,
  ) => Promise<WordPressComposerFields>;
  readonly postFormat: ComposerPostFormat;
  readonly facebookLinkUrl: string;
  readonly facebookLinkPublishBlockMessage?: string | null;
  readonly onBlockingMessage: (title: string, message: string) => void;
  /** Fired when every publish job succeeds (before overlay stays on summary). */
  readonly onPublishFullySucceeded?: () => void;
}
