import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";

export interface WordPressMediaItem {
  id: number;
  date?: string | null;
  slug?: string | null;
  type?: string | null;
  link?: string | null;
  title?: string | null;
  alt_text?: string | null;
  caption?: string | null;
  description?: string | null;
  mime_type?: string | null;
  source_url?: string | null;
}

interface WordPressMediaResponse {
  success: boolean;
  source: string;
  media: WordPressMediaItem[];
}

interface WordPressMediaUploadResponse {
  success: boolean;
  media: WordPressMediaItem;
}

function headers(accessToken: string, workspaceId: string): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json",
    "X-Workspace-Id": workspaceId,
  };
}

function parseError(raw: Record<string, unknown>, fallback: string): Error {
  const detail = raw.detail;
  if (detail && typeof detail === "object") {
    const d = detail as { message?: unknown; code?: unknown };
    return new Error(String(d.message ?? d.code ?? fallback));
  }
  return new Error(String(raw.message ?? raw.detail ?? fallback));
}

export async function fetchWordPressMedia(input: {
  accessToken: string;
  workspaceId: string;
  connectionId: string;
  limit?: number;
  forceRefresh?: boolean;
}): Promise<WordPressMediaItem[]> {
  const params = new URLSearchParams({ limit: String(input.limit ?? 50) });
  if (input.forceRefresh) params.set("force_refresh", "true");
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/api/integrations/wordpress/media/${encodeURIComponent(
      input.connectionId,
    )}?${params.toString()}`,
    input.accessToken,
    (token) => headers(token, input.workspaceId),
  );
  const raw = (await res.json()) as Record<string, unknown>;
  if (!res.ok || raw.success === false) {
    throw parseError(raw, "Could not load WordPress media.");
  }
  return (raw as unknown as WordPressMediaResponse).media;
}

export async function uploadWordPressMedia(input: {
  accessToken: string;
  workspaceId: string;
  connectionId: string;
  file: File;
}): Promise<WordPressMediaItem> {
  const form = new FormData();
  form.append("file", input.file);
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/api/integrations/wordpress/media/${encodeURIComponent(input.connectionId)}`,
    input.accessToken,
    (token) => headers(token, input.workspaceId),
    {
      method: "POST",
      body: form,
    },
  );
  const raw = (await res.json()) as Record<string, unknown>;
  if (!res.ok || raw.success === false) {
    throw parseError(raw, "Could not upload WordPress media.");
  }
  return (raw as unknown as WordPressMediaUploadResponse).media;
}

export async function deleteWordPressMedia(input: {
  accessToken: string;
  workspaceId: string;
  connectionId: string;
  mediaId: number;
}): Promise<void> {
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/api/integrations/wordpress/media/${encodeURIComponent(
      input.connectionId,
    )}/${input.mediaId}`,
    input.accessToken,
    (token) => headers(token, input.workspaceId),
    { method: "DELETE" },
  );
  const raw = (await res.json()) as Record<string, unknown>;
  if (!res.ok || raw.success === false) {
    throw parseError(raw, "Could not delete WordPress media.");
  }
}
