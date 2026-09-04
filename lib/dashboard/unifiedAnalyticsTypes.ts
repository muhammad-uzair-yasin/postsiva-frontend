/** GET /unified/analytics/ response shapes (database-backed aggregates). */

export interface UnifiedAnalyticsPlatformSlice {
  readonly post_count: number;
  readonly total_likes: number;
  readonly total_comments: number;
  readonly total_reach: number;
  readonly average_engagement_rate: number;
  readonly message: string | null;
  readonly error: string | null;
}

export interface UnifiedAnalyticsResponseBody {
  readonly success: boolean;
  readonly message?: string;
  readonly source?: string;
  readonly last_updated?: string | null;
  readonly platforms: Record<string, UnifiedAnalyticsPlatformSlice>;
  readonly totals: Record<string, number>;
}
