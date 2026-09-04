import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";
import { parseApiErrorBody } from "@/lib/api/parseApiError";

import type { AiUsageEventFilters, AiUsageEventsPage, AiUsageSummary } from "./types";

function authHeaders(token: string, workspaceId: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "X-Workspace-Id": workspaceId,
  };
}

async function getJson<T>(path: string, accessToken: string, workspaceId: string): Promise<T> {
  const response = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}${path}`,
    accessToken,
    (token) => authHeaders(token, workspaceId),
    { method: "GET", cache: "no-store" },
  );
  if (!response.ok) throw new Error(await parseApiErrorBody(response));
  return (await response.json()) as T;
}

export function fetchAiUsageSummary(accessToken: string, workspaceId: string): Promise<AiUsageSummary> {
  return getJson<Record<string, unknown>>("/ai-usage/summary", accessToken, workspaceId).then((raw) => {
    if (raw.period && raw.credits && raw.breakdown) return raw as unknown as AiUsageSummary;
    const used = Number(raw.credits_used ?? 0);
    const reserved = Number(raw.credits_reserved ?? 0);
    const remaining = Number(raw.credits_remaining ?? 0);
    const mapRows = (rows: unknown) => Array.isArray(rows) ? rows.map((row) => {
      const item = row as Record<string, unknown>;
      return { key: String(item.key ?? "unknown"), credits: Number(item.credits ?? 0), count: Number(item.operations ?? item.count ?? 0) };
    }) : [];
    return {
      period: { start: String(raw.period_start ?? ""), end: String(raw.period_end ?? "") },
      credits: { limit: used + reserved + remaining, used, reserved, remaining },
      totals: {},
      breakdown: { by_operation: mapRows(raw.by_operation), by_channel: mapRows(raw.by_channel), by_workspace: [], daily: [] },
    };
  });
}

export function fetchAiUsageEvents(
  accessToken: string,
  workspaceId: string,
  filters: AiUsageEventFilters = {},
): Promise<AiUsageEventsPage> {
  const params = new URLSearchParams();
  if (filters.operation) params.set("operation", filters.operation);
  if (filters.channel) params.set("channel", filters.channel);
  if (filters.workspaceId) params.set("workspace_id", filters.workspaceId);
  if (filters.cursor) params.set("cursor", filters.cursor);
  const query = params.size ? `?${params.toString()}` : "";
  return getJson<Record<string, unknown>>(`/ai-usage/events${query}`, accessToken, workspaceId).then((raw) => ({
    items: (Array.isArray(raw.items) ? raw.items : []).map((value) => {
      const item = value as Record<string, unknown>;
      return {
        id: String(item.id), created_at: String(item.created_at),
        operation_type: String(item.operation_type ?? "unknown"), channel: String(item.channel ?? "unknown"),
        workspace_id: item.workspace_id ? String(item.workspace_id) : null,
        workspace_name: item.workspace_name ? String(item.workspace_name) : null,
        status: String(item.status ?? "unknown"), credits: Number(item.credits ?? item.charged_credits ?? 0),
        steps: (Array.isArray(item.steps) ? item.steps : []).map((stepValue) => {
          const step = stepValue as Record<string, unknown>;
          return {
            route_key: String(step.route_key ?? "ai_step"),
            status: String(step.status ?? "unknown"),
          };
        }),
      };
    }),
    next_cursor: raw.next_cursor ? String(raw.next_cursor) : null,
  }));
}
