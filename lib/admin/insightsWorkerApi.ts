/**
 * Insights Worker Admin API Client & Normalizers
 */
import { adminGet, adminSend } from "./adminFetch";

export interface InsightsCronSettings {
  id: number;
  is_enabled: boolean;
  post_lookback_limit: number;
  include_paid_users: boolean;
  include_developer_users: boolean;
  custom_user_ids: string[] | null;
  updated_at?: string;
}

export interface InsightsExecutionLog {
  id: string;
  run_id: string;
  workspace_id: string;
  user_id: string;
  user_email: string | null;
  platform: string;
  group_type: string;
  apis_called: string[] | null;
  data_summary: Record<string, unknown> | null;
  records_saved: number;
  status: string;
  error_message: string | null;
  executed_at: string;
}

export interface InsightsLogsResponse {
  success: boolean;
  total: number;
  offset: number;
  limit: number;
  logs: InsightsExecutionLog[];
}

export interface InsightsRunNowResult {
  ok: boolean;
  run_id: string;
  total_users_processed: number;
  total_workspaces_processed: number;
  total_records_saved: number;
  duration_seconds: number;
  platform_results: Record<string, number>;
  error?: string;
}

export function fetchInsightsSettings(): Promise<InsightsCronSettings> {
  return adminGet<InsightsCronSettings>("/admin/api/insights-worker/settings");
}

export function updateInsightsSettings(
  settings: Partial<InsightsCronSettings>,
): Promise<InsightsCronSettings> {
  return adminSend<InsightsCronSettings>("PUT", "/admin/api/insights-worker/settings", settings);
}

export function fetchInsightsLogs(params: {
  platform?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<InsightsLogsResponse> {
  const query = new URLSearchParams();
  if (params.platform) query.set("platform", params.platform);
  if (params.status) query.set("status", params.status);
  if (params.limit) query.set("limit", String(params.limit));
  if (params.offset) query.set("offset", String(params.offset));

  return adminGet<InsightsLogsResponse>(`/admin/api/insights-worker/logs?${query.toString()}`);
}

export function triggerInsightsSnapshotRun(): Promise<InsightsRunNowResult> {
  return adminSend<InsightsRunNowResult>("POST", "/admin/api/insights-worker/run-now");
}
