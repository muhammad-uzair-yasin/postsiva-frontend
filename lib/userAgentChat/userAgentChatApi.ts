import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";

export interface UserAgentChatTurn {
  channel: string;
  user: { text: string; at?: string };
  assistant: { text: string; raw?: string; at?: string };
}

export interface UserAgentChatItem {
  id: number;
  workspace_id: string;
  created_at: string;
  turn: UserAgentChatTurn;
}

export interface UserAgentChatListResponse {
  success: boolean;
  items: UserAgentChatItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface DeleteUserAgentChatsResponse {
  success: boolean;
  deleted_archived_turns: number;
}

export interface ListUserAgentChatsParams {
  channel?: string;
  since?: string;
  until?: string;
  limit?: number;
  offset?: number;
}

function workspaceAuthHeaders(accessToken: string, workspaceId: string): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json",
    "X-Workspace-Id": workspaceId,
  };
}

function listUserAgentChatsQuery(params: ListUserAgentChatsParams): string {
  const sp = new URLSearchParams();
  if (params.channel?.trim()) {
    sp.set("channel", params.channel.trim());
  }
  if (params.since?.trim()) {
    sp.set("since", params.since.trim());
  }
  if (params.until?.trim()) {
    sp.set("until", params.until.trim());
  }
  sp.set("limit", String(params.limit ?? 50));
  sp.set("offset", String(params.offset ?? 0));
  return sp.toString();
}

/** Concurrent identical list calls share one GET (e.g. Strict Mode, layout remounts). */
const inflightUserAgentChatList = new Map<
  string,
  Promise<UserAgentChatListResponse>
>();

async function fetchUserAgentChatListOnce(
  accessToken: string,
  workspaceId: string,
  query: string,
): Promise<UserAgentChatListResponse> {
  const base = getApiBaseUrl();
  const url = `${base}/user-agent-chats${query ? `?${query}` : ""}`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => workspaceAuthHeaders(t, workspaceId),
    { method: "GET" },
  );
  return (await res.json()) as UserAgentChatListResponse;
}

/**
 * GET /user-agent-chats — archived turns (newest first). Filter e.g. channel=website.
 */
export async function listUserAgentChats(
  accessToken: string,
  workspaceId: string,
  params: ListUserAgentChatsParams = {},
): Promise<UserAgentChatListResponse> {
  const token = accessToken.trim();
  const ws = workspaceId.trim();
  const query = listUserAgentChatsQuery(params);
  const inflightKey = `${token}|${ws}|${query}`;
  const existing = inflightUserAgentChatList.get(inflightKey);
  if (existing) {
    return existing;
  }
  const promise = fetchUserAgentChatListOnce(token, ws, query).finally(() => {
    inflightUserAgentChatList.delete(inflightKey);
  });
  inflightUserAgentChatList.set(inflightKey, promise);
  return promise;
}

/**
 * DELETE /user-agent-chats — remove all archived turns for the workspace and clear agent thread memory.
 */
export async function deleteAllUserAgentChats(
  accessToken: string,
  workspaceId: string,
): Promise<DeleteUserAgentChatsResponse> {
  const url = `${getApiBaseUrl()}/user-agent-chats`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => workspaceAuthHeaders(t, workspaceId),
    { method: "DELETE" },
  );
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const errBody = (await res.json()) as { detail?: string };
      if (typeof errBody.detail === "string") {
        detail = errBody.detail;
      }
    } catch {
      /* ignore */
    }
    throw new Error(detail || `Delete failed (${res.status})`);
  }
  return (await res.json()) as DeleteUserAgentChatsResponse;
}

export interface WebsiteAgentChatParsed {
  response?: string;
  media?: Array<{ type: "image" | "video"; url: string }>;
  /** Optional GFM table for useful multi-row tool data. */
  table?: string;
  append_footer?: boolean;
}

export interface WebsiteAgentChatResponse {
  success: boolean;
  agent_response_json: string;
  parsed: WebsiteAgentChatParsed & Record<string, unknown>;
}

/** Matches backend `WebsiteAgentChatBody` — at least one field required. */
export interface WebsiteAgentChatRequestBody {
  text?: string;
  image_url?: string | null;
  video_url?: string | null;
  image_media_id?: string | null;
  video_media_id?: string | null;
}

/**
 * POST /workspace-agent/website/chat — run workspace agent (website channel).
 */
export async function postWebsiteAgentChat(
  accessToken: string,
  workspaceId: string,
  body: WebsiteAgentChatRequestBody,
): Promise<WebsiteAgentChatResponse> {
  const url = `${getApiBaseUrl()}/workspace-agent/website/chat`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => ({
      ...workspaceAuthHeaders(t, workspaceId),
      "Content-Type": "application/json",
    }),
    { method: "POST", body: JSON.stringify(body) },
  );
  const data = (await res.json()) as WebsiteAgentChatResponse;
  if (data.success !== true) {
    throw new Error("Agent did not return success.");
  }
  if (data.parsed === null || data.parsed === undefined) {
    throw new Error("Agent response was missing parsed payload.");
  }
  return data;
}

export async function transcribeWorkspaceAudio(
  blob: Blob,
  accessToken: string,
  workspaceId: string,
): Promise<string> {
  const url = `${getApiBaseUrl()}/workspace-agent/website/transcribe`;
  const form = new FormData();
  form.append("file", blob, "voice.webm");
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => workspaceAuthHeaders(t, workspaceId),
    { method: "POST", body: form },
  );
  if (!res.ok) throw new Error(`Transcription failed (${res.status})`);
  const data = (await res.json()) as { success: boolean; transcript: string };
  if (!data.success || !data.transcript) throw new Error("Empty transcript.");
  return data.transcript;
}
