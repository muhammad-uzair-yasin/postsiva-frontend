import { isWordPressUnifiedPlatform } from "@/lib/social/unifiedBlogPlatform";
import { fetchUnifiedBlogDrafts } from "@/lib/social/unifiedBlogDraftsApi";
import {
  fetchUnifiedDrafts,
  type UnifiedDraftResponseJson,
  type UnifiedDraftsListResponseJson,
} from "@/lib/social/unifiedDraftsApi";

const DEFAULT_PAGE_SIZE = 50;

async function fetchDraftsPage(
  accessToken: string,
  workspaceId: string,
  options: {
    readonly platform?: string | null;
    readonly platformUserId?: string | null;
    readonly linkedinPageIds?: string[];
    readonly facebookPageIds?: string[];
    readonly limit: number;
    readonly offset: number;
    readonly signal?: AbortSignal;
  },
): Promise<UnifiedDraftsListResponseJson> {
  const platform = options.platform?.trim().toLowerCase() ?? "";

  if (isWordPressUnifiedPlatform(platform)) {
    return fetchUnifiedBlogDrafts(accessToken, workspaceId, {
      connectionId: options.platformUserId,
      limit: options.limit,
      offset: options.offset,
      signal: options.signal,
    });
  }

  if (platform) {
    return fetchUnifiedDrafts(accessToken, workspaceId, {
      platform,
      linkedinPageIds: options.linkedinPageIds,
      facebookPageIds: options.facebookPageIds,
      platformUserId: options.platformUserId ?? undefined,
      limit: options.limit,
      offset: options.offset,
      signal: options.signal,
    });
  }

  const [social, blog] = await Promise.all([
    fetchUnifiedDrafts(accessToken, workspaceId, {
      limit: options.limit,
      offset: options.offset,
      signal: options.signal,
    }),
    fetchUnifiedBlogDrafts(accessToken, workspaceId, {
      limit: options.limit,
      offset: options.offset,
      signal: options.signal,
    }),
  ]);

  const merged: UnifiedDraftResponseJson[] = [
    ...(social.data ?? []),
    ...(blog.data ?? []),
  ];

  return {
    success: social.success || blog.success,
    data: merged,
    total: merged.length,
  };
}

/** List drafts — WordPress uses `/unified/blog/drafts`; social uses `/unified/drafts`. */
export async function fetchWorkspaceDrafts(
  accessToken: string,
  workspaceId: string,
  options?: {
    readonly platform?: string | null;
    readonly platformUserId?: string | null;
    readonly linkedinPageIds?: string[];
    readonly facebookPageIds?: string[];
    readonly limit?: number;
    readonly offset?: number;
    readonly signal?: AbortSignal;
  },
): Promise<UnifiedDraftsListResponseJson> {
  return fetchDraftsPage(accessToken, workspaceId, {
    platform: options?.platform,
    platformUserId: options?.platformUserId,
    linkedinPageIds: options?.linkedinPageIds,
    facebookPageIds: options?.facebookPageIds,
    limit: options?.limit ?? DEFAULT_PAGE_SIZE,
    offset: options?.offset ?? 0,
    signal: options?.signal,
  });
}
