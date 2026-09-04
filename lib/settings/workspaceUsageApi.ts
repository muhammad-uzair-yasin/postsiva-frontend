import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";

export interface WorkspaceUsageStats {
  workspace_id: string;
  user_id: string;
  post_generation_count: number;
  image_generation_count: number;
  message_count: number;
  tool_call_count: number;
  post_published_count: number;
  comments_posted_count: number;
  post_scheduled_count: number;
  draft_saved_count: number;
  updated_at: string | null;
}

function parseStats(raw: unknown): WorkspaceUsageStats | null {
  if (typeof raw !== "object" || raw === null) {
    return null;
  }
  const o = raw as Record<string, unknown>;
  const num = (k: string): number => {
    const v = o[k];
    return typeof v === "number" && Number.isFinite(v) ? v : 0;
  };
  const sid = o.workspace_id;
  const uid = o.user_id;
  if (sid == null || uid == null) {
    return null;
  }
  const updated = o.updated_at;
  return {
    workspace_id: String(sid),
    user_id: String(uid),
    post_generation_count: num("post_generation_count"),
    image_generation_count: num("image_generation_count"),
    message_count: num("message_count"),
    tool_call_count: num("tool_call_count"),
    post_published_count: num("post_published_count"),
    comments_posted_count: num("comments_posted_count"),
    post_scheduled_count: num("post_scheduled_count"),
    draft_saved_count: num("draft_saved_count"),
    updated_at:
      typeof updated === "string" && updated.length > 0 ? updated : null,
  };
}

export async function fetchWorkspaceUsageStats(
  accessToken: string,
  workspaceId: string,
): Promise<WorkspaceUsageStats> {
  const base = getApiBaseUrl();
  const res = await fetchWithAccessTokenRetry(
    `${base}/workspaces/${encodeURIComponent(workspaceId)}/usage`,
    accessToken,
    (t) => ({
      Authorization: `Bearer ${t}`,
      Accept: "application/json",
    }),
    { method: "GET" },
  );
  const raw: unknown = await res.json().catch(() => null);
  const parsed = parseStats(raw);
  if (!parsed) {
    throw new Error("Invalid usage response");
  }
  return parsed;
}
