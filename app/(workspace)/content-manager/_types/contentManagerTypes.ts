import type { UnifiedDraftResponseJson } from "@/lib/social/unifiedDraftsApi";
import type { UnifiedScheduledPostItemJson } from "@/lib/social/unifiedScheduledPostsApi";

export type ContentManagerTab = "draft" | "scheduled" | "published";

export type ContentManagerPostStatus = ContentManagerTab | "failed";

export type ContentManagerChannel =
  | "instagram"
  | "linkedin"
  | "facebook"
  | "threads"
  | "tiktok"
  | "youtube"
  | "pinterest"
  | "bluesky"
  | "mastodon"
  | "wordpress"
  | "x";

type ContentManagerLinkedInOrgFilter = `linkedin:${string}`;

type ContentManagerFacebookPageFilter = `facebook:${string}`;

/** Channel filter including “all” for the manager UI. */
export type ContentManagerChannelFilter =
  | "all"
  | ContentManagerChannel
  | ContentManagerLinkedInOrgFilter
  | ContentManagerFacebookPageFilter;

export const CONTENT_MANAGER_CHANNEL_FILTERS: readonly ContentManagerChannelFilter[] =
  [
    "all",
    "instagram",
    "linkedin",
    "facebook",
    "threads",
    "tiktok",
    "youtube",
    "pinterest",
    "bluesky",
    "mastodon",
    "wordpress",
    "x",
  ];

export interface ContentManagerPost {
  id: string;
  status: ContentManagerPostStatus;
  channel: ContentManagerChannel;
  handle: string;
  body: string;
  title?: string;
  imageUrl?: string;
  /** Public video URL — cards render a <video> first-frame thumbnail when no imageUrl. */
  videoUrl?: string;
  scheduleLabel?: string;
  /** Draft: empty media placeholder vs dimmed image */
  draftMedia?: "empty" | "image" | "video";
  /** Unified API draft UUID — opens draft editor (mobile `openEditDraftPost`). */
  sourceDraftId?: string;
  /** Unified scheduled post id from `GET /unified/scheduled-posts`. */
  sourceScheduledPostId?: string;
  /** Full scheduled row for opening the scheduled editor without refetch. */
  scheduledPayload?: UnifiedScheduledPostItemJson;
  /** Full draft from `GET /unified/drafts` so the editor can open without a second GET. */
  draftPayload?: UnifiedDraftResponseJson;
  metrics?: {
    reach: string;
    likes: string;
    comments: string;
  };
  /** Public URL for the live post (`permalink` from GET /unified/posts/). */
  publishedPostUrl?: string;
  /** ISO instant from unified `published_at` — calendar + cache reuse. */
  publishedAtIso?: string;
  /** Facebook page ID — required for enable AI watcher on FB posts. */
  pageId?: string;
  /** LinkedIn organization ID — required for enable AI watcher on LinkedIn org posts. */
  organizationId?: string;
  /** YouTube channel ID owning this post. */
  youtubeChannelId?: string;
  /** Whether AI comment watcher is enabled for this post (from unified posts API). */
  aiWatcherEnabled?: boolean;
}
