import { adminGet, adminSend } from "./adminFetch";
import type { AdminScheduledPostRow } from "./scheduledPostsApi";

export const SCHEDULED_POSTS_PATH = "/admin/api/scheduled-posts";

export interface ScheduledPostsListResponse {
  success: boolean;
  items: AdminScheduledPostRow[];
  total: number;
  limit: number;
  offset: number;
}

export function fetchAdminScheduledPosts(params: {
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<ScheduledPostsListResponse> {
  const q = new URLSearchParams();
  if (params.status) q.set("status", params.status);
  if (params.search) q.set("search", params.search);
  if (params.limit) q.set("limit", String(params.limit));
  if (params.offset) q.set("offset", String(params.offset));
  const qs = q.toString();
  return adminGet<ScheduledPostsListResponse>(qs ? `${SCHEDULED_POSTS_PATH}?${qs}` : SCHEDULED_POSTS_PATH);
}

export function cancelAdminScheduledPost(id: string): Promise<{ success: boolean; message?: string }> {
  return adminSend("POST", `${SCHEDULED_POSTS_PATH}/${encodeURIComponent(id)}/cancel`);
}

export function publishAdminScheduledPostNow(id: string): Promise<{ success: boolean; message?: string }> {
  return adminSend("POST", `${SCHEDULED_POSTS_PATH}/${encodeURIComponent(id)}/publish-now`);
}

export {
  canCancelScheduledPost,
  canPublishNowScheduledPost,
  scheduledPostStatusTone,
  type AdminScheduledPostRow,
} from "./scheduledPostsApi";
