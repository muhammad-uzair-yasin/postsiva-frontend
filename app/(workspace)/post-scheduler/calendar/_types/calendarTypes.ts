import type { UnifiedScheduledPostItemJson } from "@/lib/social/unifiedScheduledPostsApi";

export type CalendarViewMode = "week" | "list";

export type CalendarPostKind = "published" | "scheduled" | "failed";

export interface CalendarPostMetrics {
  readonly likes: string;
  readonly comments: string;
  readonly reach: string;
}

export interface CalendarPost {
  id: string;
  scheduledAt: Date;
  postKind: CalendarPostKind;
  caption: string;
  /** Hover/card body; for WordPress articles this is excerpt or stripped content. */
  previewText: string;
  mediaUrl: string | null;
  mediaKind: "image" | "video" | null;
  platform: string;
  account: string;
  /** Page/channel/user id used to match the connected account name + avatar. */
  platformUserId?: string;
  status: string;
  /** Present when status is failed (from API error_message). */
  errorMessage?: string;
  source?: UnifiedScheduledPostItemJson;
  /** Live post URL when `postKind` is published. */
  publishedPostUrl?: string;
  /** Engagement stats when loaded from GET /unified/posts/. */
  metrics?: CalendarPostMetrics;
  /** WordPress blog scheduled posts — full article for hover preview. */
  wordpressTitle?: string;
  wordpressExcerpt?: string;
  wordpressContent?: string;
}

/** Equality for Calendar scheduled setState short-circuit (id+time alone ignored caption/media edits). */
export function calendarScheduledRowsEquivalent(
  a: CalendarPost,
  b: CalendarPost,
): boolean {
  return (
    a.id === b.id &&
    a.scheduledAt.getTime() === b.scheduledAt.getTime() &&
    a.status === b.status &&
    (a.errorMessage ?? "") === (b.errorMessage ?? "") &&
    a.postKind === b.postKind &&
    a.caption === b.caption &&
    a.previewText === b.previewText &&
    a.mediaUrl === b.mediaUrl &&
    a.mediaKind === b.mediaKind &&
    (a.wordpressTitle ?? "") === (b.wordpressTitle ?? "") &&
    (a.wordpressExcerpt ?? "") === (b.wordpressExcerpt ?? "")
  );
}
