import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";

const CHUNK_SIZE = 1 * 1024 * 1024;
const CHUNKED_THRESHOLD = 10 * 1024 * 1024;

export interface UnifiedMediaUploadWebResult {
  mediaId: string;
  publicUrl: string;
  filename: string;
  originalFilename?: string;
  thumbnailUrl?: string;
  mediaType: "image" | "video" | "document";
  durationSeconds?: number;
  fileSizeBytes?: number;
}

function jsonHeaders(
  accessToken: string,
  workspaceId: string,
): Record<string, string> {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Workspace-Id": workspaceId,
  };
}

function deriveMediaType(file: File): "image" | "video" | "document" {
  if (file.type.startsWith("video/")) {
    return "video";
  }
  const name = file.name.toLowerCase();
  if (
    file.type === "application/pdf" ||
    name.endsWith(".pdf") ||
    name.endsWith(".ppt") ||
    name.endsWith(".pptx") ||
    name.endsWith(".doc") ||
    name.endsWith(".docx")
  ) {
    return "document";
  }
  return "image";
}

interface StorageInitResponse {
  upload_id: string;
  chunk_size: number;
}

interface StorageCompleteResponse {
  success: boolean;
  media_id?: string;
  public_url?: string;
  filename?: string;
  original_filename?: string;
  thumbnail_url?: string;
}

interface MediaUploadJson {
  success?: boolean;
  message?: string;
  media_id?: string;
  public_url?: string;
  filename?: string;
  original_filename?: string;
  thumbnail_url?: string;
}

async function initChunkedUpload(
  accessToken: string,
  workspaceId: string,
  filename: string,
  fileSize: number,
  totalChunks: number,
  mediaType: "image" | "video" | "document",
): Promise<string> {
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/media/storage/init`,
    accessToken,
    (t) => jsonHeaders(t, workspaceId),
    {
      method: "POST",
      body: JSON.stringify({
        filename,
        file_size: fileSize,
        total_chunks: totalChunks,
        media_type: mediaType,
      }),
    },
  );
  const data = (await res.json()) as StorageInitResponse;
  if (!data.upload_id?.trim()) {
    throw new Error("Storage init did not return upload_id");
  }
  return data.upload_id;
}

async function uploadChunk(
  accessToken: string,
  workspaceId: string,
  uploadId: string,
  chunkNumber: number,
  blob: Blob,
): Promise<void> {
  const form = new FormData();
  form.append("upload_id", uploadId);
  form.append("chunk_number", String(chunkNumber));
  form.append("file", blob, "chunk");
  await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/media/storage/chunk`,
    accessToken,
    (t) => ({
      Authorization: `Bearer ${t}`,
      "X-Workspace-Id": workspaceId,
      Accept: "application/json",
    }),
    { method: "POST", body: form },
  );
}

async function completeChunkedUpload(
  accessToken: string,
  workspaceId: string,
  uploadId: string,
  mediaType: "image" | "video" | "document",
  originalFilename: string,
  fileSizeBytes: number,
): Promise<UnifiedMediaUploadWebResult> {
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/media/storage/complete`,
    accessToken,
    (t) => jsonHeaders(t, workspaceId),
    {
      method: "POST",
      body: JSON.stringify({
        upload_id: uploadId,
        media_type: mediaType,
        original_filename: originalFilename,
      }),
    },
  );
  const data = (await res.json()) as StorageCompleteResponse;
  if (!data.success || !data.media_id?.trim() || !data.public_url?.trim()) {
    throw new Error("Chunked upload complete did not return media");
  }
  const friendly =
    (data.original_filename ?? originalFilename).trim() || originalFilename;
  return {
    mediaId: data.media_id.trim(),
    publicUrl: data.public_url.trim(),
    filename: friendly,
    originalFilename: friendly,
    thumbnailUrl: data.thumbnail_url?.trim() || undefined,
    mediaType,
    fileSizeBytes,
  };
}

async function uploadSimpleMultipart(
  accessToken: string,
  workspaceId: string,
  file: File,
  mediaType: "image" | "video" | "document",
  onProgress?: (percent: number) => void,
): Promise<UnifiedMediaUploadWebResult> {
  const form = new FormData();
  form.append("media_type", mediaType);
  form.append("media", file);

  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/media/upload`,
    accessToken,
    (t) => ({
      Authorization: `Bearer ${t}`,
      "X-Workspace-Id": workspaceId,
      Accept: "application/json",
    }),
    { method: "POST", body: form },
  );

  const data = (await res.json()) as MediaUploadJson;
  if (
    data.success &&
    typeof data.media_id === "string" &&
    data.media_id.trim() &&
    typeof data.public_url === "string" &&
    data.public_url.trim()
  ) {
    onProgress?.(100);
    return {
      mediaId: data.media_id.trim(),
      publicUrl: data.public_url.trim(),
      filename: (data.original_filename ?? data.filename ?? file.name).trim() || file.name,
      originalFilename:
        (data.original_filename ?? file.name).trim() || file.name,
      thumbnailUrl: data.thumbnail_url?.trim() || undefined,
      mediaType,
      fileSizeBytes: file.size,
    };
  }
  const msg =
    typeof data.message === "string" && data.message.trim()
      ? data.message
      : "Upload failed";
  throw new Error(msg);
}

/**
 * Upload to workspace media library: small files via multipart + progress;
 * large / video via client chunking (1MB) and per-chunk progress (LinkedIn-style).
 */
export async function uploadUnifiedWorkspaceMediaFromFile(
  accessToken: string,
  workspaceId: string,
  file: File,
  options?: { onProgress?: (percent: number) => void },
): Promise<UnifiedMediaUploadWebResult> {
  const mediaType = deriveMediaType(file);
  const onProgress = options?.onProgress;

  if (file.size >= CHUNKED_THRESHOLD || mediaType === "video") {
    const totalChunks = Math.max(1, Math.ceil(file.size / CHUNK_SIZE));
    const uploadId = await initChunkedUpload(
      accessToken,
      workspaceId,
      file.name,
      file.size,
      totalChunks,
      mediaType,
    );
    for (let i = 0; i < totalChunks; i += 1) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const blob = file.slice(start, end);
      await uploadChunk(accessToken, workspaceId, uploadId, i + 1, blob);
      onProgress?.(Math.round(((i + 1) / totalChunks) * 100));
    }
    return completeChunkedUpload(
      accessToken,
      workspaceId,
      uploadId,
      mediaType,
      file.name,
      file.size,
    );
  }

  return uploadSimpleMultipart(
    accessToken,
    workspaceId,
    file,
    mediaType,
    onProgress,
  );
}
