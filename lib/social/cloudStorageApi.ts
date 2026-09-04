import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";
import { readApiErrorMessage } from "@/lib/auth/authApi";

export type CloudProvider = "google_drive" | "onedrive" | "dropbox";
// URL slug used for OAuth/connection routes (OneDrive uses a hyphen to match the
// registered redirect URI).
export type CloudProviderSlug = "google-drive" | "one-drive" | "dropbox";

export const PROVIDER_SLUG: Record<CloudProvider, CloudProviderSlug> = {
  google_drive: "google-drive",
  onedrive: "one-drive",
  dropbox: "dropbox",
};

export type CloudConnectionStatus = "connected" | "reconnect_required" | "revoked";

export interface CloudConnection {
  provider: CloudProvider;
  status: CloudConnectionStatus;
  account_email?: string | null;
  account_name?: string | null;
  connected_at?: string | null;
  scopes?: string | null;
}

export interface PickerConfig {
  api_key: string | null;
  app_id: string | null;
  client_id: string | null;
  scopes: string[];
  mime_filters: string[];
}

export interface CloudImportResult {
  status: "completed" | "transferring";
  media_id?: string | null;
  public_url?: string | null;
  media_type?: string | null;
  filename?: string | null;
  transfer_id?: string | null;
  deduped?: boolean;
}

function headers(accessToken: string, workspaceId: string): Record<string, string> {
  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json",
    "X-Workspace-Id": workspaceId,
  };
}

export async function listCloudConnections(
  accessToken: string,
  workspaceId: string,
): Promise<CloudConnection[]> {
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/cloud-storage/connections`,
    accessToken,
    (token) => headers(token, workspaceId),
  );
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
  const body = (await res.json()) as { connections: CloudConnection[] };
  return body.connections ?? [];
}

export async function getCloudOAuthUrl(
  accessToken: string,
  workspaceId: string,
  provider: CloudProvider,
  returnPath: string,
): Promise<string> {
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/cloud-storage/${PROVIDER_SLUG[provider]}/oauth/url`,
    accessToken,
    (token) => ({ ...headers(token, workspaceId), "Content-Type": "application/json" }),
    { method: "POST", body: JSON.stringify({ return_path: returnPath }) },
  );
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
  const body = (await res.json()) as { authorize_url: string };
  return body.authorize_url;
}

export async function disconnectCloudProvider(
  accessToken: string,
  workspaceId: string,
  provider: CloudProvider,
): Promise<boolean> {
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/cloud-storage/${PROVIDER_SLUG[provider]}/connection`,
    accessToken,
    (token) => headers(token, workspaceId),
    { method: "DELETE" },
  );
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
  const body = (await res.json()) as { disconnected: boolean };
  return body.disconnected;
}

export async function getGooglePickerConfig(
  accessToken: string,
  workspaceId: string,
): Promise<PickerConfig> {
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/cloud-storage/google-drive/picker-config`,
    accessToken,
    (token) => headers(token, workspaceId),
  );
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
  return (await res.json()) as PickerConfig;
}

export async function importCloudMedia(
  accessToken: string,
  workspaceId: string,
  provider: CloudProvider,
  fileId: string,
  opts?: { fileName?: string; forceNewCopy?: boolean },
): Promise<CloudImportResult> {
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/cloud-storage/${PROVIDER_SLUG[provider]}/import`,
    accessToken,
    (token) => ({ ...headers(token, workspaceId), "Content-Type": "application/json" }),
    {
      method: "POST",
      body: JSON.stringify({
        file_id: fileId,
        ...(opts?.fileName ? { file_name: opts.fileName } : {}),
        ...(opts?.forceNewCopy ? { force_new_copy: true } : {}),
      }),
    },
  );
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
  return (await res.json()) as CloudImportResult;
}

export interface CloudFileItem {
  file_id: string;
  name: string;
  is_folder: boolean;
  mime_type?: string | null;
  size?: number | null;
  modified_at?: string | null;
  thumbnail_url?: string | null;
}

export interface CloudItemsResult {
  items: CloudFileItem[];
  next_page_token?: string | null;
}

/** Native folder browser (OneDrive / Dropbox). Google Drive uses the Picker instead. */
export async function listCloudItems(
  accessToken: string,
  workspaceId: string,
  provider: CloudProvider,
  opts?: { folderId?: string; pageToken?: string; search?: string },
): Promise<CloudItemsResult> {
  const qs = new URLSearchParams();
  if (opts?.folderId) qs.set("folder_id", opts.folderId);
  if (opts?.pageToken) qs.set("page_token", opts.pageToken);
  if (opts?.search) qs.set("search", opts.search);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/cloud-storage/${PROVIDER_SLUG[provider]}/items${suffix}`,
    accessToken,
    (token) => headers(token, workspaceId),
  );
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
  return (await res.json()) as CloudItemsResult;
}

export type CloudExportConflict = "replace" | "keep_both" | "cancel";

export interface CloudExportSource {
  sourceType: "postsiva_media" | "stock_media";
  mediaId?: string;
  stockId?: string;
  stockUrl?: string;
  mediaType?: "image" | "video";
  filename?: string;
  /** Direct URL used for "Save to local" (device download). */
  downloadUrl?: string;
}

export interface CloudExportResult {
  status: "completed" | "transferring";
  cloud_file_id?: string | null;
  cloud_file_name?: string | null;
  web_url?: string | null;
  transfer_id?: string | null;
}

/** Save a copy of a Postsiva or stock asset to a cloud folder (server-side stream). */
export async function exportToCloud(
  accessToken: string,
  workspaceId: string,
  provider: CloudProvider,
  source: CloudExportSource,
  destinationFolderId?: string,
  onConflict: CloudExportConflict = "keep_both",
): Promise<CloudExportResult> {
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/cloud-storage/${PROVIDER_SLUG[provider]}/export`,
    accessToken,
    (token) => ({ ...headers(token, workspaceId), "Content-Type": "application/json" }),
    {
      method: "POST",
      body: JSON.stringify({
        source_type: source.sourceType,
        ...(source.mediaId ? { media_id: source.mediaId } : {}),
        ...(source.stockId ? { stock_id: source.stockId } : {}),
        ...(source.stockUrl ? { stock_url: source.stockUrl } : {}),
        ...(source.mediaType ? { media_type: source.mediaType } : {}),
        ...(source.filename ? { filename: source.filename } : {}),
        ...(destinationFolderId ? { destination_folder_id: destinationFolderId } : {}),
        on_conflict: onConflict,
      }),
    },
  );
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
  return (await res.json()) as CloudExportResult;
}

export async function getCloudTransfer(
  accessToken: string,
  workspaceId: string,
  transferId: string,
): Promise<{ status: string; bytes_transferred: number; size_bytes?: number | null; result_media_id?: string | null; error_code?: string | null }> {
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/cloud-storage/transfers/${transferId}`,
    accessToken,
    (token) => headers(token, workspaceId),
  );
  if (!res.ok) throw new Error(await readApiErrorMessage(res));
  return await res.json();
}
