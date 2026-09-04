import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";
import { deleteOAuthTokenForWorkspace, fetchSocialOAuthAuthorizeUrl } from "@/lib/social/unifiedOAuthApi";

export type CanvaConnectionInfo = {
  connected: boolean;
  accountLabel: string | null;
};

export type CanvaDesignListItem = {
  designId: string;
  title: string;
  thumbnailUrl: string | null;
  editUrl: string | null;
  viewUrl: string | null;
};

export type CanvaDesignListPage = {
  items: CanvaDesignListItem[];
  continuation: string | null;
};

function workspaceHeaders(token: string, workspaceId: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Workspace-Id": workspaceId,
  };
}

function parseApiEnvelope(data: unknown): {
  success: boolean;
  message: string;
  payload: Record<string, unknown> | null;
  error: string | null;
} {
  if (!data || typeof data !== "object") {
    return { success: false, message: "Unexpected response", payload: null, error: null };
  }
  const o = data as Record<string, unknown>;
  const success = o.success === true;
  const message = typeof o.message === "string" ? o.message : "";
  const error = typeof o.error === "string" ? o.error : null;
  const inner = o.data;
  const payload =
    inner !== null && typeof inner === "object" ? (inner as Record<string, unknown>) : null;
  return { success, message, payload, error };
}

function thumbnailUrlFromRaw(thumbnail: unknown): string | null {
  if (!thumbnail || typeof thumbnail !== "object") {
    return null;
  }
  const t = thumbnail as Record<string, unknown>;
  if (typeof t.url === "string" && t.url.trim()) {
    return t.url.trim();
  }
  return null;
}

function mapDesignItem(raw: unknown): CanvaDesignListItem | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const o = raw as Record<string, unknown>;
  const designId = typeof o.design_id === "string" ? o.design_id : String(o.id ?? "");
  if (!designId.trim()) {
    return null;
  }
  return {
    designId: designId.trim(),
    title: typeof o.title === "string" && o.title.trim() ? o.title.trim() : "Untitled design",
    thumbnailUrl: thumbnailUrlFromRaw(o.thumbnail),
    editUrl: typeof o.edit_url === "string" ? o.edit_url : null,
    viewUrl: typeof o.view_url === "string" ? o.view_url : null,
  };
}

export async function fetchCanvaConnectionInfo(
  accessToken: string,
  workspaceId: string,
): Promise<CanvaConnectionInfo> {
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/canva/connection-status`,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    { method: "GET" },
  );
  const data: unknown = await res.json();
  const parsed = parseApiEnvelope(data);
  if (!res.ok || !parsed.success) {
    return { connected: false, accountLabel: null };
  }
  const connected = parsed.payload?.connected === true;
  const userId =
    typeof parsed.payload?.canva_user_id === "string" ? parsed.payload.canva_user_id.trim() : "";
  const teamId =
    typeof parsed.payload?.canva_team_id === "string" ? parsed.payload.canva_team_id.trim() : "";
  const accountLabel = userId || teamId || (connected ? "Canva account" : null);
  return { connected, accountLabel: accountLabel || null };
}

export async function fetchCanvaConnectionStatus(
  accessToken: string,
  workspaceId: string,
): Promise<boolean> {
  const info = await fetchCanvaConnectionInfo(accessToken, workspaceId);
  return info.connected;
}

export async function disconnectCanvaAccount(
  accessToken: string,
  workspaceId: string,
): Promise<void> {
  const result = await deleteOAuthTokenForWorkspace(accessToken, workspaceId, "canva");
  if (!result.success) {
    throw new Error(result.message || "Could not disconnect Canva");
  }
}

export async function connectCanvaAccount(
  accessToken: string,
  workspaceId: string,
): Promise<string> {
  const { authUrl } = await fetchSocialOAuthAuthorizeUrl(accessToken, workspaceId, "canva");
  if (!authUrl) {
    throw new Error("Canva did not return an authorization URL");
  }
  return authUrl;
}

export async function listCanvaDesigns(
  accessToken: string,
  workspaceId: string,
  options?: { query?: string; continuation?: string; limit?: number },
): Promise<CanvaDesignListPage> {
  const qs = new URLSearchParams();
  const q = options?.query?.trim();
  if (q) {
    qs.set("query", q);
  }
  if (options?.continuation?.trim()) {
    qs.set("continuation", options.continuation.trim());
  }
  if (options?.limit) {
    qs.set("limit", String(options.limit));
  }
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/canva/designs${suffix}`,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    { method: "GET" },
  );
  const data: unknown = await res.json();
  const parsed = parseApiEnvelope(data);
  if (!res.ok || !parsed.success) {
    throw new Error(parsed.message || "Could not load Canva designs");
  }
  const itemsRaw = parsed.payload?.items;
  const items: CanvaDesignListItem[] = [];
  if (Array.isArray(itemsRaw)) {
    for (const row of itemsRaw) {
      const mapped = mapDesignItem(row);
      if (mapped) {
        items.push(mapped);
      }
    }
  }
  const continuation =
    typeof parsed.payload?.continuation === "string" && parsed.payload.continuation.trim()
      ? parsed.payload.continuation.trim()
      : null;
  return { items, continuation };
}

export async function exportCanvaDesign(
  accessToken: string,
  workspaceId: string,
  designId: string,
): Promise<{
  mediaUrl: string;
  uploadId: string;
  mediaId: string;
  filename: string;
  designId: string;
}> {
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/canva/designs/export`,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    {
      method: "POST",
      body: JSON.stringify({ design_id: designId }),
    },
  );
  const data: unknown = await res.json();
  const parsed = parseApiEnvelope(data);
  if (!res.ok || !parsed.success) {
    throw new Error(parsed.message || "Could not import Canva design");
  }
  const mediaUrl =
    typeof parsed.payload?.media_url === "string" ? parsed.payload.media_url.trim() : "";
  if (!mediaUrl) {
    throw new Error("Canva export did not return a media URL");
  }
  const uploadId =
    typeof parsed.payload?.upload_id === "string" ? parsed.payload.upload_id.trim() : "";
  const mediaId =
    typeof parsed.payload?.media_id === "string" ? parsed.payload.media_id.trim() : "";
  const filename =
    typeof parsed.payload?.filename === "string" && parsed.payload.filename.trim()
      ? parsed.payload.filename.trim()
      : `canva-${designId}.png`;
  return { mediaUrl, uploadId, mediaId, filename, designId };
}

export type CanvaReturnExportPage = {
  index: number;
  previewUrl: string;
};

export async function fetchCanvaReturnHandoffPages(
  handoff: string,
  accessToken?: string | null,
  workspaceId?: string | null,
): Promise<{ designId: string; pages: CanvaReturnExportPage[] }> {
  const url = `${getApiBaseUrl()}/canva/return/handoff/${encodeURIComponent(handoff)}/pages`;
  const res =
    accessToken?.trim() && workspaceId?.trim()
      ? await fetchWithAccessTokenRetry(url, accessToken, (t) => workspaceHeaders(t, workspaceId), {
          method: "GET",
        })
      : await fetch(url, { method: "GET", headers: { Accept: "application/json" } });
  const data: unknown = await res.json();
  const parsed = parseApiEnvelope(data);
  if (!res.ok || !parsed.success) {
    throw new Error(parsed.message || "Could not load Canva pages");
  }
  const designId =
    typeof parsed.payload?.design_id === "string" ? parsed.payload.design_id.trim() : "";
  const rawPages = parsed.payload?.pages;
  const pages: CanvaReturnExportPage[] = [];
  if (Array.isArray(rawPages)) {
    for (const item of rawPages) {
      if (!item || typeof item !== "object") {
        continue;
      }
      const o = item as Record<string, unknown>;
      const index = typeof o.index === "number" ? o.index : Number(o.index);
      const previewUrl =
        typeof o.preview_url === "string" ? o.preview_url.trim() : String(o.previewUrl ?? "").trim();
      if (!Number.isFinite(index) || index < 0 || !previewUrl) {
        continue;
      }
      pages.push({ index, previewUrl });
    }
  }
  pages.sort((a, b) => a.index - b.index);
  if (!pages.length) {
    throw new Error("Canva export returned no pages");
  }
  return { designId: designId || "", pages };
}

export async function importCanvaReturnHandoffPage(
  handoff: string,
  pageIndex: number,
  accessToken?: string | null,
  workspaceId?: string | null,
): Promise<{
  mediaUrl: string;
  uploadId: string;
  mediaId: string;
  filename: string;
  designId: string;
}> {
  const url = `${getApiBaseUrl()}/canva/return/handoff/${encodeURIComponent(handoff)}/import`;
  const res =
    accessToken?.trim() && workspaceId?.trim()
      ? await fetchWithAccessTokenRetry(url, accessToken, (t) => workspaceHeaders(t, workspaceId), {
          method: "POST",
          body: JSON.stringify({ page_index: pageIndex }),
        })
      : await fetch(url, {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify({ page_index: pageIndex }),
        });
  const data: unknown = await res.json();
  const parsed = parseApiEnvelope(data);
  if (!res.ok || !parsed.success) {
    throw new Error(parsed.message || "Could not import Canva page");
  }
  const mediaUrl =
    typeof parsed.payload?.media_url === "string" ? parsed.payload.media_url.trim() : "";
  if (!mediaUrl) {
    throw new Error("Canva import did not return a media URL");
  }
  const uploadId =
    typeof parsed.payload?.upload_id === "string" ? parsed.payload.upload_id.trim() : "";
  const mediaId =
    typeof parsed.payload?.media_id === "string" ? parsed.payload.media_id.trim() : "";
  const designId =
    typeof parsed.payload?.design_id === "string" ? parsed.payload.design_id.trim() : "";
  const filename =
    typeof parsed.payload?.filename === "string" && parsed.payload.filename.trim()
      ? parsed.payload.filename.trim()
      : `canva-page-${pageIndex + 1}.png`;
  return { mediaUrl, uploadId, mediaId, filename, designId };
}

export async function prepareCanvaDesignEdit(
  accessToken: string,
  workspaceId: string,
  input: {
    designId: string;
    editUrl?: string | null;
    composerSessionId?: string;
  },
): Promise<string> {
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/canva/designs/prepare-edit`,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    {
      method: "POST",
      body: JSON.stringify({
        design_id: input.designId,
        edit_url: input.editUrl ?? undefined,
        composer_session_id: input.composerSessionId ?? undefined,
      }),
    },
  );
  const data: unknown = await res.json();
  const parsed = parseApiEnvelope(data);
  if (!res.ok || !parsed.success) {
    throw new Error(parsed.message || "Could not open Canva editor");
  }
  const editUrl = parsed.payload?.edit_url;
  if (typeof editUrl !== "string" || !editUrl.trim()) {
    throw new Error("Canva did not return an edit URL");
  }
  return editUrl.trim();
}

export async function createCanvaDesign(
  accessToken: string,
  workspaceId: string,
  input?: { title?: string; postKind?: string; width?: number; height?: number },
): Promise<CanvaDesignListItem> {
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/canva/designs/create`,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    {
      method: "POST",
      body: JSON.stringify({
        title: input?.title,
        post_kind: input?.postKind,
        width: input?.width,
        height: input?.height,
      }),
    },
  );
  const data: unknown = await res.json();
  const parsed = parseApiEnvelope(data);
  if (!res.ok || !parsed.success) {
    throw new Error(parsed.message || "Could not create Canva design");
  }
  const mapped = mapDesignItem(parsed.payload);
  if (!mapped) {
    throw new Error("Canva returned an invalid design");
  }
  return mapped;
}
