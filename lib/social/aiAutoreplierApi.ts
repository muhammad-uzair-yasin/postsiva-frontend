import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";

export type AiAutoreplierPlatform =
  | "linkedin"
  | "youtube"
  | "instagram"
  | "facebook"
  | "tiktok"
  | "threads"
  | "bluesky"
  | "mastodon"
  | "wordpress";

export interface EnabledWatcherPost {
  post_id: string;
  platform: string;
  page_id: string | null;
  organization_id: string | null;
  channel_id: string | null;
  last_checked: string | null;
  total_comments: number;
  ai_replies_posted: number;
  leads_count: number;
  lead_keywords: string | null;
  lead_custom_rule: string | null;
}

export interface UpdateLeadRulesBody {
  post_id: string;
  platform: AiAutoreplierPlatform;
  lead_keywords?: string | null;
  lead_custom_rule?: string | null;
  channel_id?: string | null;
}

function workspaceHeaders(
  accessToken: string,
  workspaceId: string,
  json = false,
): HeadersInit {
  const h: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    "X-Workspace-Id": workspaceId,
    Accept: "application/json",
  };
  if (json) {
    h["Content-Type"] = "application/json";
  }
  return h;
}

/** GET /unified/ai-autoreplier/list */
export async function listEnabledWatcherPosts(
  accessToken: string,
  workspaceId: string,
): Promise<EnabledWatcherPost[]> {
  const url = `${getApiBaseUrl()}/unified/ai-autoreplier/list`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    { method: "GET" },
  );
  const data = (await res.json()) as { enabled_posts?: unknown[] };
  return (data.enabled_posts ?? []).map((p) => {
    const row = p as Record<string, unknown>;
    return {
      post_id: String(row.post_id ?? ""),
      platform: String(row.platform ?? ""),
      page_id: row.page_id != null ? String(row.page_id) : null,
      organization_id: row.organization_id != null ? String(row.organization_id) : null,
      channel_id: row.channel_id != null ? String(row.channel_id) : null,
      last_checked: row.last_checked != null ? String(row.last_checked) : null,
      total_comments: Number(row.total_comments ?? 0),
      ai_replies_posted: Number(row.ai_replies_posted ?? 0),
      leads_count: Number(row.leads_count ?? 0),
      lead_keywords: row.lead_keywords != null ? String(row.lead_keywords) : null,
      lead_custom_rule:
        row.lead_custom_rule != null ? String(row.lead_custom_rule) : null,
    };
  });
}

/** POST /unified/ai-autoreplier/enable */
export async function enableAiAutoreplier(
  accessToken: string,
  workspaceId: string,
  body: {
    post_id: string;
    platform: string;
    page_id?: string | null;
    organization_id?: string | null;
    channel_id?: string | null;
  },
): Promise<void> {
  const url = `${getApiBaseUrl()}/unified/ai-autoreplier/enable`;
  await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId, true),
    { method: "POST", body: JSON.stringify(body) },
  );
}

/** POST /unified/ai-autoreplier/disable */
export async function disableAiAutoreplier(
  accessToken: string,
  workspaceId: string,
  body: { post_id: string; platform: string; channel_id?: string | null },
): Promise<void> {
  const url = `${getApiBaseUrl()}/unified/ai-autoreplier/disable`;
  await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId, true),
    { method: "POST", body: JSON.stringify(body) },
  );
}

/** PATCH /unified/ai-autoreplier/rules */
export async function updateLeadRules(
  accessToken: string,
  workspaceId: string,
  body: UpdateLeadRulesBody,
): Promise<{ lead_keywords: string | null; lead_custom_rule: string | null }> {
  const url = `${getApiBaseUrl()}/unified/ai-autoreplier/rules`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId, true),
    { method: "PATCH", body: JSON.stringify(body) },
  );
  const data = (await res.json()) as Record<string, unknown>;
  return {
    lead_keywords: data.lead_keywords != null ? String(data.lead_keywords) : null,
    lead_custom_rule:
      data.lead_custom_rule != null ? String(data.lead_custom_rule) : null,
  };
}
