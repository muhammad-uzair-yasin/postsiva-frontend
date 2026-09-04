import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";

export interface WorkspaceAiPrompt {
  id: string;
  title: string;
  body: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceAiPromptListResponse {
  items: WorkspaceAiPrompt[];
}

function parsePrompt(raw: unknown): WorkspaceAiPrompt {
  if (!raw || typeof raw !== "object") throw new Error("Invalid prompt response.");
  const v = raw as Record<string, unknown>;
  if (typeof v.id !== "string") throw new Error("Invalid prompt response.");
  if (typeof v.title !== "string") throw new Error("Invalid prompt response.");
  if (typeof v.body !== "string") throw new Error("Invalid prompt response.");
  if (typeof v.sort_order !== "number") throw new Error("Invalid prompt response.");
  if (typeof v.created_at !== "string") throw new Error("Invalid prompt response.");
  if (typeof v.updated_at !== "string") throw new Error("Invalid prompt response.");
  return v as unknown as WorkspaceAiPrompt;
}

function parseList(raw: unknown): WorkspaceAiPromptListResponse {
  if (!raw || typeof raw !== "object") throw new Error("Invalid prompts list response.");
  const items = (raw as Record<string, unknown>).items;
  if (!Array.isArray(items)) throw new Error("Invalid prompts list response.");
  return { items: items.map(parsePrompt) };
}

function baseUrl(workspaceId: string): string {
  return `${getApiBaseUrl()}/workspaces/${encodeURIComponent(workspaceId)}/ai-prompts`;
}

function authHeaders(accessToken: string): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

export async function fetchWorkspaceAiPrompts(
  token: string,
  workspaceId: string,
): Promise<WorkspaceAiPromptListResponse> {
  const response = await fetchWithAccessTokenRetry(
    baseUrl(workspaceId),
    token,
    authHeaders,
    { method: "GET" },
  );
  return parseList(await response.json());
}

export async function createWorkspaceAiPrompt(
  token: string,
  workspaceId: string,
  input: { title: string; body: string },
): Promise<WorkspaceAiPrompt> {
  const response = await fetchWithAccessTokenRetry(
    baseUrl(workspaceId),
    token,
    authHeaders,
    { method: "POST", body: JSON.stringify(input) },
  );
  return parsePrompt(await response.json());
}

export async function updateWorkspaceAiPrompt(
  token: string,
  workspaceId: string,
  promptId: string,
  input: { title?: string; body?: string },
): Promise<WorkspaceAiPrompt> {
  const response = await fetchWithAccessTokenRetry(
    `${baseUrl(workspaceId)}/${encodeURIComponent(promptId)}`,
    token,
    authHeaders,
    { method: "PATCH", body: JSON.stringify(input) },
  );
  return parsePrompt(await response.json());
}

export async function generateWorkspaceAiPrompt(
  token: string,
  workspaceId: string,
  input: { intent: string; language: string },
): Promise<{ title: string; body: string }> {
  const response = await fetchWithAccessTokenRetry(
    `${baseUrl(workspaceId)}/generate`,
    token,
    authHeaders,
    { method: "POST", body: JSON.stringify(input) },
  );
  const raw = await response.json();
  if (!raw || typeof raw !== "object") throw new Error("Invalid generate response.");
  const v = raw as Record<string, unknown>;
  if (typeof v.title !== "string" || typeof v.body !== "string") {
    throw new Error("Invalid generate response.");
  }
  return { title: v.title, body: v.body };
}

export async function deleteWorkspaceAiPrompt(
  token: string,
  workspaceId: string,
  promptId: string,
): Promise<void> {
  await fetchWithAccessTokenRetry(
    `${baseUrl(workspaceId)}/${encodeURIComponent(promptId)}`,
    token,
    authHeaders,
    { method: "DELETE" },
  );
}
