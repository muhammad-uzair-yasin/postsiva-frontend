import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";

export interface WorkspaceEmailNotifications {
  draft_saved: boolean;
  post_scheduled: boolean;
  post_published: boolean;
  scheduled_post_failed: boolean;
  account_connected: boolean;
  account_disconnected: boolean;
  lead_detected: boolean;
  is_owner: boolean;
}

export type WorkspaceEmailNotificationValues = Omit<
  WorkspaceEmailNotifications,
  "is_owner"
>;

const KEYS: (keyof WorkspaceEmailNotificationValues)[] = [
  "draft_saved",
  "post_scheduled",
  "post_published",
  "scheduled_post_failed",
  "account_connected",
  "account_disconnected",
  "lead_detected",
];

function parse(raw: unknown): WorkspaceEmailNotifications {
  if (!raw || typeof raw !== "object") throw new Error("Invalid notification settings response.");
  const value = raw as Record<string, unknown>;
  for (const key of KEYS) {
    if (typeof value[key] !== "boolean") throw new Error("Invalid notification settings response.");
  }
  if (typeof value.is_owner !== "boolean") throw new Error("Invalid notification settings response.");
  return value as unknown as WorkspaceEmailNotifications;
}

async function request(
  token: string,
  workspaceId: string,
  method: "GET" | "PUT",
  values?: WorkspaceEmailNotificationValues,
): Promise<WorkspaceEmailNotifications> {
  const response = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/workspaces/${encodeURIComponent(workspaceId)}/email-notifications`,
    token,
    (nextToken) => ({
      Authorization: `Bearer ${nextToken}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    }),
    { method, body: values ? JSON.stringify(values) : undefined },
  );
  return parse(await response.json());
}

export const fetchWorkspaceEmailNotifications = (token: string, workspaceId: string) =>
  request(token, workspaceId, "GET");

export const saveWorkspaceEmailNotifications = (
  token: string,
  workspaceId: string,
  values: WorkspaceEmailNotificationValues,
) => request(token, workspaceId, "PUT", values);
