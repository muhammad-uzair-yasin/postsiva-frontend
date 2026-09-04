import { isWordPressUnifiedPlatform } from "@/lib/social/unifiedBlogPlatform";
import { fetchUnifiedBlogScheduledPosts } from "@/lib/social/unifiedBlogScheduledPostsApi";
import {
  fetchUnifiedScheduledPosts,
  type UnifiedScheduledPostItemJson,
  type UnifiedScheduledPostsResponseJson,
} from "@/lib/social/unifiedScheduledPostsApi";

const DEFAULT_PAGE_SIZE = 100;

function sortScheduledPosts(
  posts: UnifiedScheduledPostItemJson[],
): UnifiedScheduledPostItemJson[] {
  return [...posts].sort((a, b) =>
    (a.scheduled_time ?? "").localeCompare(b.scheduled_time ?? ""),
  );
}

async function fetchScheduledPage(
  accessToken: string,
  workspaceId: string,
  options: {
    readonly platform?: string | null;
    readonly platformUserId?: string | null;
    readonly status?: string | null;
    readonly limit: number;
    readonly offset: number;
    readonly signal?: AbortSignal;
    /** When false, skip `/unified/blog/scheduled-posts` (calendar). Default true. */
    readonly includeBlog?: boolean;
  },
): Promise<UnifiedScheduledPostsResponseJson> {
  const platform = options.platform?.trim().toLowerCase() ?? "";
  const includeBlog = options.includeBlog !== false;

  if (isWordPressUnifiedPlatform(platform)) {
    if (!includeBlog) {
      return {
        success: true,
        message: "Retrieved 0 scheduled posts",
        data: {
          scheduled_posts: [],
          total: 0,
          platform: "wordpress",
          platform_user_id: options.platformUserId ?? null,
          status: options.status ?? null,
        },
      };
    }
    return fetchUnifiedBlogScheduledPosts(accessToken, workspaceId, {
      connectionId: options.platformUserId,
      status: options.status,
      limit: options.limit,
      offset: options.offset,
      signal: options.signal,
    });
  }

  if (platform) {
    return fetchUnifiedScheduledPosts(accessToken, workspaceId, {
      platform,
      platformUserId: options.platformUserId,
      status: options.status,
      limit: options.limit,
      offset: options.offset,
      signal: options.signal,
    });
  }

  if (!includeBlog) {
    return fetchUnifiedScheduledPosts(accessToken, workspaceId, {
      status: options.status,
      limit: options.limit,
      offset: options.offset,
      signal: options.signal,
    });
  }

  const [social, blog] = await Promise.all([
    fetchUnifiedScheduledPosts(accessToken, workspaceId, {
      status: options.status,
      limit: options.limit,
      offset: options.offset,
      signal: options.signal,
    }),
    fetchUnifiedBlogScheduledPosts(accessToken, workspaceId, {
      status: options.status,
      limit: options.limit,
      offset: options.offset,
      signal: options.signal,
    }),
  ]);

  const merged = sortScheduledPosts([
    ...(social.data?.scheduled_posts ?? []),
    ...(blog.data?.scheduled_posts ?? []),
  ]);

  return {
    success: social.success || blog.success,
    message: `Retrieved ${merged.length} scheduled posts`,
    data: {
      scheduled_posts: merged,
      total: merged.length,
      platform: null,
      platform_user_id: null,
      status: options.status ?? null,
    },
    error: social.success ? blog.error : social.error,
  };
}

/** List scheduled posts — WordPress uses `/unified/blog/scheduled-posts`; social uses `/unified/scheduled-posts`. */
export async function fetchWorkspaceScheduledPosts(
  accessToken: string,
  workspaceId: string,
  options?: {
    readonly platform?: string | null;
    readonly platformUserId?: string | null;
    readonly status?: string | null;
    readonly limit?: number;
    readonly offset?: number;
    readonly signal?: AbortSignal;
    readonly includeBlog?: boolean;
  },
): Promise<UnifiedScheduledPostsResponseJson> {
  return fetchScheduledPage(accessToken, workspaceId, {
    platform: options?.platform,
    platformUserId: options?.platformUserId,
    status: options?.status,
    limit: options?.limit ?? DEFAULT_PAGE_SIZE,
    offset: options?.offset ?? 0,
    signal: options?.signal,
    includeBlog: options?.includeBlog,
  });
}

/** Paginate social + blog scheduled lists and merge (calendar, media-id scan). */
export async function fetchAllWorkspaceScheduledPosts(
  accessToken: string,
  workspaceId: string,
  options?: {
    readonly platform?: string | null;
    readonly platformUserId?: string | null;
    readonly status?: string | null;
    readonly signal?: AbortSignal;
    readonly includeBlog?: boolean;
  },
): Promise<UnifiedScheduledPostItemJson[]> {
  const platform = options?.platform?.trim().toLowerCase() ?? "";
  const includeBlog = options?.includeBlog !== false;

  if (isWordPressUnifiedPlatform(platform) || platform.length > 0) {
    const all: UnifiedScheduledPostItemJson[] = [];
    let offset = 0;
    while (true) {
      const res = await fetchScheduledPage(accessToken, workspaceId, {
        platform: options?.platform,
        platformUserId: options?.platformUserId,
        status: options?.status,
        limit: DEFAULT_PAGE_SIZE,
        offset,
        signal: options?.signal,
        includeBlog,
      });
      const page = res.data?.scheduled_posts ?? [];
      all.push(...page);
      if (page.length < DEFAULT_PAGE_SIZE) {
        break;
      }
      offset += page.length;
    }
    return all;
  }

  async function drain(
    fetcher: (page: { limit: number; offset: number }) => Promise<UnifiedScheduledPostsResponseJson>,
  ): Promise<UnifiedScheduledPostItemJson[]> {
    const rows: UnifiedScheduledPostItemJson[] = [];
    let offset = 0;
    while (true) {
      const res = await fetcher({ limit: DEFAULT_PAGE_SIZE, offset });
      const page = res.data?.scheduled_posts ?? [];
      rows.push(...page);
      if (page.length < DEFAULT_PAGE_SIZE) {
        break;
      }
      offset += page.length;
    }
    return rows;
  }

  if (!includeBlog) {
    return drain(({ limit, offset }) =>
      fetchUnifiedScheduledPosts(accessToken, workspaceId, {
        status: options?.status,
        limit,
        offset,
        signal: options?.signal,
      }),
    );
  }

  const [social, blog] = await Promise.all([
    drain(({ limit, offset }) =>
      fetchUnifiedScheduledPosts(accessToken, workspaceId, {
        status: options?.status,
        limit,
        offset,
        signal: options?.signal,
      }),
    ),
    drain(({ limit, offset }) =>
      fetchUnifiedBlogScheduledPosts(accessToken, workspaceId, {
        status: options?.status,
        limit,
        offset,
        signal: options?.signal,
      }),
    ),
  ]);

  return sortScheduledPosts([...social, ...blog]);
}

/** Scheduled + failed rows for calendar (deduped by id; failed wins on collision). */
export async function fetchAllActiveWorkspaceScheduledPosts(
  accessToken: string,
  workspaceId: string,
  options?: {
    readonly platform?: string | null;
    readonly platformUserId?: string | null;
    readonly signal?: AbortSignal;
    readonly includeBlog?: boolean;
  },
): Promise<UnifiedScheduledPostItemJson[]> {
  const base = {
    platform: options?.platform,
    platformUserId: options?.platformUserId,
    signal: options?.signal,
    includeBlog: options?.includeBlog,
  };
  const [scheduled, failed] = await Promise.all([
    fetchAllWorkspaceScheduledPosts(accessToken, workspaceId, {
      ...base,
      status: "scheduled",
    }),
    fetchAllWorkspaceScheduledPosts(accessToken, workspaceId, {
      ...base,
      status: "failed",
    }),
  ]);
  const byId = new Map<string, UnifiedScheduledPostItemJson>();
  for (const row of scheduled) {
    byId.set(row.scheduled_post_id, row);
  }
  for (const row of failed) {
    byId.set(row.scheduled_post_id, row);
  }
  return sortScheduledPosts([...byId.values()]);
}
