/** Admin scheduled posts — types + grant builder (no API imports for tests). */

export interface AdminScheduledPostRow {
  scheduled_post_id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  workspace_id: string;
  workspace_name: string;
  platform: string;
  platform_user_id: string;
  post_type: string;
  scheduled_time: string | null;
  status: string;
  error_message: string | null;
  created_at: string | null;
  published_at: string | null;
  published_post_url: string | null;
  caption_preview: string;
}

export const SCHEDULED_POST_STATUSES = [
  "scheduled",
  "publishing",
  "failed",
  "cancelled",
  "published",
] as const;

export function canCancelScheduledPost(status: string): boolean {
  const s = status.toLowerCase();
  return s === "scheduled" || s === "failed" || s === "publishing";
}

export function canPublishNowScheduledPost(status: string): boolean {
  const s = status.toLowerCase();
  return s === "scheduled" || s === "failed";
}

export function scheduledPostStatusTone(status: string): string {
  const s = status.toLowerCase();
  if (s === "scheduled") return "text-primary";
  if (s === "publishing") return "text-tertiary";
  if (s === "published") return "text-emerald-600";
  if (s === "failed") return "text-error";
  if (s === "cancelled") return "text-on-surface-variant";
  return "text-on-surface-variant";
}
