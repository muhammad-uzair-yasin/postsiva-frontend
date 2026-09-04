import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";

export interface WorkspaceAPIKeyListItem {
  id: string;
  workspace_id: string;
  key_prefix: string;
  name: string | null;
  scope: string;
  created_at: string;
}

export interface CreateWorkspaceAPIKeyBody {
  name?: string | null;
  scope?: string;
}

export interface CreateWorkspaceAPIKeyResponse extends WorkspaceAPIKeyListItem {
  workspace_name: string;
  created_by: string;
  secret: string;
}

export interface WorkspaceAPIKeySecretResponse extends WorkspaceAPIKeyListItem {
  secret: string;
}

function workspaceHeaders(
  accessToken: string,
  workspaceId: string,
): Record<string, string> {
  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json",
    "X-Workspace-Id": workspaceId,
  };
}

export async function listWorkspaceApiKeys(
  accessToken: string,
  workspaceId: string,
): Promise<WorkspaceAPIKeyListItem[]> {
  const url = `${getApiBaseUrl()}/workspaces/${encodeURIComponent(workspaceId)}/api-keys`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    { method: "GET" },
  );
  const body: unknown = await res.json().catch(() => null);
  if (!Array.isArray(body)) {
    return [];
  }
  return body as WorkspaceAPIKeyListItem[];
}

export async function createWorkspaceApiKey(
  accessToken: string,
  workspaceId: string,
  payload: CreateWorkspaceAPIKeyBody,
): Promise<CreateWorkspaceAPIKeyResponse> {
  const url = `${getApiBaseUrl()}/workspaces/${encodeURIComponent(workspaceId)}/api-keys`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => ({
      ...workspaceHeaders(t, workspaceId),
      "Content-Type": "application/json",
    }),
    {
      method: "POST",
      body: JSON.stringify({
        name: payload.name ?? null,
        scope: payload.scope ?? "linkedin_only",
      }),
    },
  );
  const body: unknown = await res.json().catch(() => null);
  return body as CreateWorkspaceAPIKeyResponse;
}

export async function revokeWorkspaceApiKey(
  accessToken: string,
  workspaceId: string,
  keyId: string,
): Promise<void> {
  const url = `${getApiBaseUrl()}/workspaces/${encodeURIComponent(workspaceId)}/api-keys/${encodeURIComponent(keyId)}`;
  await fetchWithAccessTokenRetry(url, accessToken, (t) => workspaceHeaders(t, workspaceId), {
    method: "DELETE",
  });
}

export async function revealWorkspaceApiKeySecret(
  accessToken: string,
  workspaceId: string,
  keyId: string,
): Promise<WorkspaceAPIKeySecretResponse> {
  const url = `${getApiBaseUrl()}/workspaces/${encodeURIComponent(workspaceId)}/api-keys/${encodeURIComponent(keyId)}`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    { method: "GET" },
  );
  const body: unknown = await res.json().catch(() => null);
  return body as WorkspaceAPIKeySecretResponse;
}
