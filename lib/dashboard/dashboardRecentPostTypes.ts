/** Normalized row for dashboard “Recent Performance” cards. */
export interface DashboardRecentPostView {
  readonly id: string;
  readonly imageSrc: string | null;
  readonly caption: string;
  readonly dateLabel: string;
  readonly likesLabel: string;
  readonly commentsLabel: string;
  readonly reachLabel: string;
  /** Short label from unified `type`: Video, Image, Multi, Text — omit when unknown. */
  readonly mediaTypeBadge: string | null;
}
