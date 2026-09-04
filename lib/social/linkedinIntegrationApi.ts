import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";

export interface LinkedInPendingDestination {
  destinationKey: string;
  kind: "personal" | "page" | string;
  name: string | null;
  avatarUrl: string | null;
  pageId: string | null;
  alreadyConnected: boolean;
}

export interface LinkedInPendingSelection {
  accountDisplayName: string | null;
  destinations: LinkedInPendingDestination[];
}

export interface LinkedInConnectedAccount {
  id: string;
  destinationKey: string;
  kind: string;
  displayName: string | null;
  avatarUrl: string | null;
  pageId: string | null;
}

function authHeaders(workspaceId: string) {
  return (t: string) => ({
    Authorization: `Bearer ${t}`,
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Workspace-Id": workspaceId,
  });
}

function errorFrom(raw: Record<string, unknown>, fallback: string): Error {
  const detail = raw.detail;
  if (detail && typeof detail === "object") {
    const d = detail as { message?: unknown; code?: unknown };
    return new Error(String(d.message ?? d.code ?? fallback));
  }
  return new Error(String(raw.message ?? raw.detail ?? fallback));
}

export async function getLinkedInPendingSelection(
  accessToken: string,
  workspaceId: string,
  handle: string,
): Promise<LinkedInPendingSelection> {
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/api/integrations/linkedin/oauth/pending/${encodeURIComponent(handle)}`,
    accessToken,
    authHeaders(workspaceId),
    { method: "GET" },
  );
  const raw = (await res.json()) as Record<string, unknown>;
  if (!res.ok || raw.success === false) {
    throw errorFrom(raw, "Could not load your LinkedIn accounts.");
  }
  const account = (raw.account ?? {}) as Record<string, unknown>;
  const destinations = Array.isArray(raw.destinations) ? raw.destinations : [];
  return {
    accountDisplayName:
      typeof account.display_name === "string" ? account.display_name : null,
    destinations: destinations.map((entry) => {
      const d = entry as Record<string, unknown>;
      return {
        destinationKey: String(d.destination_key ?? ""),
        kind: String(d.kind ?? "page"),
        name: typeof d.name === "string" ? d.name : null,
        avatarUrl: typeof d.avatar_url === "string" ? d.avatar_url : null,
        pageId: typeof d.page_id === "string" ? d.page_id : null,
        alreadyConnected: Boolean(d.already_connected),
      };
    }),
  };
}

export async function confirmLinkedInDestinations(
  accessToken: string,
  workspaceId: string,
  handle: string,
  destinationKeys: string[],
): Promise<LinkedInConnectedAccount[]> {
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/api/integrations/linkedin/oauth/confirm`,
    accessToken,
    authHeaders(workspaceId),
    {
      method: "POST",
      body: JSON.stringify({
        handle,
        destination_keys: destinationKeys,
      }),
    },
  );
  const raw = (await res.json()) as Record<string, unknown>;
  if (!res.ok || raw.success === false) {
    throw errorFrom(raw, "Could not finish the LinkedIn connection.");
  }
  const accounts = Array.isArray(raw.accounts) ? raw.accounts : [];
  return accounts.map((entry) => {
    const a = entry as Record<string, unknown>;
    return {
      id: String(a.id ?? ""),
      destinationKey: String(a.destination_key ?? ""),
      kind: String(a.kind ?? ""),
      displayName: typeof a.display_name === "string" ? a.display_name : null,
      avatarUrl: typeof a.avatar_url === "string" ? a.avatar_url : null,
      pageId: typeof a.page_id === "string" ? a.page_id : null,
    };
  });
}
