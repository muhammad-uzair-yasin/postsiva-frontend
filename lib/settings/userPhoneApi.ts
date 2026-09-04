import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";

export interface WorkspacePhoneData {
  phone_number?: string;
  user_id?: string;
  workspace_id?: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface UserPhoneApiResponse {
  success: boolean;
  message: string;
  data?: WorkspacePhoneData | null;
  error?: string | null;
}

function workspaceHeaders(
  accessToken: string,
  workspaceId: string,
): Record<string, string> {
  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Workspace-Id": workspaceId,
  };
}

export async function getWorkspacePhone(
  accessToken: string,
  workspaceId: string,
): Promise<UserPhoneApiResponse> {
  const url = `${getApiBaseUrl()}/user/phone/me`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    { method: "GET" },
  );
  const body: unknown = await res.json().catch(() => null);
  return body as UserPhoneApiResponse;
}

export async function setWorkspacePhone(
  accessToken: string,
  workspaceId: string,
  phoneNumber: string,
): Promise<UserPhoneApiResponse> {
  const url = `${getApiBaseUrl()}/user/phone/me`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    {
      method: "PUT",
      body: JSON.stringify({ phone_number: phoneNumber.trim() }),
    },
  );
  const body: unknown = await res.json().catch(() => null);
  return body as UserPhoneApiResponse;
}

export async function deleteWorkspacePhone(
  accessToken: string,
  workspaceId: string,
): Promise<UserPhoneApiResponse> {
  const url = `${getApiBaseUrl()}/user/phone/me`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    { method: "DELETE" },
  );
  const body: unknown = await res.json().catch(() => null);
  return body as UserPhoneApiResponse;
}
