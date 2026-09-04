import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";
import { readApiErrorMessage } from "@/lib/auth/authApi";

function sanitizeDownloadFilename(filename: string, mediaType: string): string {
  const trimmed = filename.trim();
  if (trimmed) {
    return trimmed.replace(/[/\\?%*:|"<>]/g, "_");
  }
  return mediaType === "video" ? "video.mp4" : "image.jpg";
}

function triggerBrowserDownload(blob: Blob, filename: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}

function workspaceHeaders(
  accessToken: string,
  workspaceId: string,
): Record<string, string> {
  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: "*/*",
    "X-Workspace-Id": workspaceId,
  };
}

/**
 * Download workspace media via GET /media/{id}/download (backend proxies storage).
 */
export async function downloadWorkspaceMediaFile(
  accessToken: string,
  workspaceId: string,
  mediaId: string,
  filename: string,
  mediaType: string,
): Promise<void> {
  const token = accessToken.trim();
  const workspace = workspaceId.trim();
  const id = mediaId.trim();
  if (!token || !workspace || !id) {
    throw new Error("Sign in and select a workspace to download media.");
  }

  const safeName = sanitizeDownloadFilename(filename, mediaType);
  const url = `${getApiBaseUrl()}/media/${encodeURIComponent(id)}/download`;

  const res = await fetchWithAccessTokenRetry(
    url,
    token,
    (t) => workspaceHeaders(t, workspace),
    { method: "GET" },
  );

  if (!res.ok) {
    throw new Error(await readApiErrorMessage(res));
  }

  const blob = await res.blob();
  triggerBrowserDownload(blob, safeName);
}
