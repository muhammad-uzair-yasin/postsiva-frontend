import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";
import { readApiErrorMessage } from "@/lib/auth/authApi";

export interface UnifiedMediaListItem {
  media_id: string;
  media_type: string;
  platform: string | null;
  public_url: string;
  filename: string;
  original_filename?: string | null;
  thumbnail_url?: string | null;
  file_size: number;
  status: string;
  uploaded_at: string;
}

export interface UnifiedMediaListResponse {
  success: boolean;
  media: UnifiedMediaListItem[];
  total: number;
  limit: number;
  offset: number;
  count: number;
  message?: string;
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

export interface FetchWorkspaceMediaListOptions {
  limit?: number;
  offset?: number;
  mediaType?: "image" | "video";
  /** Skip 5-minute first-page cache (e.g. user tapped refresh). */
  forceRefresh?: boolean;
}

/** In-browser cache for GET /media/ first page only (composer re-opens). */
const MEDIA_LIST_FIRST_PAGE_TTL_MS = 5 * 60 * 1000;

type MediaListFirstPageCacheEntry = {
  readonly response: UnifiedMediaListResponse;
  readonly expiresAt: number;
};

const mediaListFirstPageCache = new Map<string, MediaListFirstPageCacheEntry>();

function mediaListFirstPageCacheKey(
  accessToken: string,
  workspaceId: string,
  limit: number,
  mediaType: string | undefined,
): string {
  return `${workspaceId.trim()}\0${accessToken.trim()}\0${limit}\0${mediaType ?? ""}`;
}

function pruneExpiredMediaListCache(): void {
  const now = Date.now();
  for (const [k, v] of mediaListFirstPageCache) {
    if (v.expiresAt <= now) {
      mediaListFirstPageCache.delete(k);
    }
  }
}

/**
 * GET /media/ — workspace media library (requires JWT + X-Workspace-Id).
 * Same contract as mobileApp/lib/social/unifiedMediaApi.ts
 *
 * First page (`offset === 0`) is cached in-memory for 5 minutes per workspace +
 * token + limit + media_type (avoids hammering the API when reopening compose).
 */
export async function fetchWorkspaceMediaList(
  accessToken: string,
  workspaceId: string,
  options: FetchWorkspaceMediaListOptions = {},
): Promise<UnifiedMediaListResponse> {
  const limit = options.limit ?? 60;
  const offset = options.offset ?? 0;
  const mediaType = options.mediaType;
  const forceRefresh = options.forceRefresh ?? false;

  if (
    offset === 0 &&
    !forceRefresh &&
    accessToken.trim() &&
    workspaceId.trim()
  ) {
    pruneExpiredMediaListCache();
    const key = mediaListFirstPageCacheKey(
      accessToken,
      workspaceId,
      limit,
      mediaType,
    );
    const hit = mediaListFirstPageCache.get(key);
    if (hit && hit.expiresAt > Date.now()) {
      return structuredClone(hit.response);
    }
  }

  const params = new URLSearchParams();
  params.set("limit", String(limit));
  params.set("offset", String(offset));
  if (mediaType) {
    params.set("media_type", mediaType);
  }
  const path = `${getApiBaseUrl()}/media/?${params.toString()}`;

  const res = await fetchWithAccessTokenRetry(
    path,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    { method: "GET" },
  );
  const body: unknown = await res.json().catch(() => null);

  if (res.ok && body && typeof body === "object") {
    const parsed = body as UnifiedMediaListResponse;
    if (!parsed.success) {
      const msg =
        typeof parsed.message === "string" && parsed.message.trim()
          ? parsed.message
          : "Media list request failed.";
      throw new Error(msg);
    }

    if (
      offset === 0 &&
      accessToken.trim() &&
      workspaceId.trim()
    ) {
      const key = mediaListFirstPageCacheKey(
        accessToken,
        workspaceId,
        limit,
        mediaType,
      );
      mediaListFirstPageCache.set(key, {
        response: structuredClone(parsed),
        expiresAt: Date.now() + MEDIA_LIST_FIRST_PAGE_TTL_MS,
      });
    }

    return parsed;
  }

  throw new Error(await readApiErrorMessage(res));
}

/** Clear first-page GET /media/ cache (e.g. after upload or delete). */
export function invalidateUnifiedMediaListCache(): void {
  mediaListFirstPageCache.clear();
}

export interface BulkDeleteWorkspaceMediaResult {
  success: boolean;
  message: string;
  deleted_count: number;
  failed_count: number;
  errors?: Array<{ media_id: string; error: string }> | null;
}

/** DELETE /media/bulk — remove media from storage and DB. */
export async function bulkDeleteWorkspaceMedia(
  accessToken: string,
  workspaceId: string,
  mediaIds: readonly string[],
): Promise<BulkDeleteWorkspaceMediaResult> {
  const url = `${getApiBaseUrl()}/media/bulk`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => ({
      ...workspaceHeaders(t, workspaceId),
      "Content-Type": "application/json",
    }),
    {
      method: "DELETE",
      body: JSON.stringify({ media_ids: [...mediaIds] }),
    },
  );
  const body: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(await readApiErrorMessage(res));
  }

  invalidateUnifiedMediaListCache();

  if (body && typeof body === "object") {
    return body as BulkDeleteWorkspaceMediaResult;
  }

  return {
    success: false,
    message: "Delete request failed.",
    deleted_count: 0,
    failed_count: mediaIds.length,
  };
}
