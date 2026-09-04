/**
 * Admin Insights Snapshot Access API client.
 */
import { adminGet, adminSend } from "./adminFetch";
import {
  buildGrantsFromWorkspaces,
  type InsightsGrantInput,
  type InsightsPlatform,
  type InsightsSubAccount,
  type InsightsWorkspace,
} from "./insightsSnapshotsGrantUtils";

export {
  buildGrantsFromWorkspaces,
  type InsightsGrantInput,
  type InsightsPlatform,
  type InsightsSubAccount,
  type InsightsWorkspace,
} from "./insightsSnapshotsGrantUtils";

export const INSIGHTS_SNAPSHOTS_USERS_PATH = "/admin/api/insights-snapshots/users";

export const LINKEDIN_PERSONAL_ACCOUNT_ID = "__linkedin_personal__";

export interface InsightsSnapshotUserDetail {
  user_id: string;
  email: string;
  full_name: string;
  insights_enabled: boolean;
  scope_mode: "all" | "custom" | string;
  scope_summary: string;
  workspaces: InsightsWorkspace[];
  grants: InsightsGrantInput[];
}

export interface InsightsSnapshotUserListItem {
  user_id: string;
  email: string;
  full_name: string;
  insights_enabled: boolean;
  scope_mode: string;
  scope_summary: string;
}

export interface InsightsSnapshotUsersResponse {
  success: boolean;
  items: InsightsSnapshotUserListItem[];
  total: number;
  limit: number;
  offset: number;
}

export function insightsSnapshotUserPath(userId: string): string {
  return `${INSIGHTS_SNAPSHOTS_USERS_PATH}/${encodeURIComponent(userId)}`;
}

export function fetchInsightsSnapshotUsers(params: {
  search?: string;
  insights_only?: boolean;
  limit?: number;
  offset?: number;
}): Promise<InsightsSnapshotUsersResponse> {
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  if (params.insights_only) q.set("insights_only", "true");
  if (params.limit) q.set("limit", String(params.limit));
  if (params.offset) q.set("offset", String(params.offset));
  const qs = q.toString();
  return adminGet<InsightsSnapshotUsersResponse>(
    qs ? `${INSIGHTS_SNAPSHOTS_USERS_PATH}?${qs}` : INSIGHTS_SNAPSHOTS_USERS_PATH,
  );
}

export function fetchInsightsSnapshotUser(userId: string): Promise<InsightsSnapshotUserDetail> {
  return adminGet<InsightsSnapshotUserDetail>(insightsSnapshotUserPath(userId));
}

export function saveInsightsSnapshotUser(
  userId: string,
  body: {
    insights_enabled: boolean;
    scope_mode: "all" | "custom";
    grants: InsightsGrantInput[];
  },
): Promise<InsightsSnapshotUserDetail> {
  return adminSend<InsightsSnapshotUserDetail>("PUT", insightsSnapshotUserPath(userId), body);
}
