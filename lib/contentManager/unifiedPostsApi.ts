import { z } from "zod";

import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";
import { normalizeLinkedInOrganizationIdForCommentsApi } from "@/lib/social/unifiedCommentsQueryNormalize";
import { fetchUnifiedBlogPosts } from "@/lib/social/unifiedBlogPostsApi";

/** Backend may send `url: null` when LinkedIn has no resolvable image URL. */
const zImage = z
  .object({ url: z.string().nullable().optional() })
  .passthrough();

const zPostItem = z
  .object({
    post_id: z.string().optional(),
    id: z.string().optional(),
    commentary: z.string().nullable().optional(),
    published_at: z.string().nullable().optional(),
    type: z.string().nullable().optional(),
    images: z.array(zImage).optional().default([]),
    videos: z
      .object({
        videoUrl: z.string().nullable().optional(),
        thumbnailUrl: z.string().nullable().optional(),
      })
      .nullable()
      .optional(),
    permalink: z.string().nullable().optional(),
    like_count: z.number().optional().default(0),
    comment_count: z.number().optional().default(0),
    share_count: z.number().optional().default(0),
    impression_count: z.number().optional().default(0),
    source_page_id: z.string().nullable().optional(),
    ai_watcher_enabled: z.boolean().optional().default(false),
  })
  .transform((p) => {
    const native = (p.post_id ?? p.id ?? "").trim();
    return { ...p, post_id: native, id: native };
  });

const zInstagramSlice = z.object({
  posts: z.array(zPostItem).optional().nullable().transform(arr => arr?.filter(p => p.post_id.length > 0) ?? null),
  message: z.string().nullable().optional(),
  error: z.string().nullable().optional(),
  platform_meta: z
    .object({
      insights_by_id: z
        .record(
          z.string(),
          z.object({
            reach: z.number().optional(),
            saved: z.number().optional(),
          }),
        )
        .optional(),
    })
    .passthrough()
    .nullable()
    .optional(),
});

const zSimplePlatformSlice = z.object({
  posts: z.array(zPostItem).optional().nullable().transform(arr => arr?.filter(p => p.post_id.length > 0) ?? null),
  message: z.string().nullable().optional(),
  error: z.string().nullable().optional(),
  platform_meta: z.unknown().nullable().optional(),
});

const zUnifiedPostsResponse = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  instagram: zInstagramSlice.nullable().optional(),
  facebook: zSimplePlatformSlice.nullable().optional(),
  linkedin: zSimplePlatformSlice.nullable().optional(),
  tiktok: zSimplePlatformSlice.nullable().optional(),
  threads: zSimplePlatformSlice.nullable().optional(),
  youtube: zSimplePlatformSlice.nullable().optional(),
  pinterest: zSimplePlatformSlice.nullable().optional(),
  bluesky: zSimplePlatformSlice.nullable().optional(),
  mastodon: zSimplePlatformSlice.nullable().optional(),
  wordpress: zSimplePlatformSlice.nullable().optional(),
});

export type UnifiedPostsApiInstagramPost = z.infer<typeof zPostItem>;
export type UnifiedPostsApiResponse = z.infer<typeof zUnifiedPostsResponse>;

function workspaceHeaders(
  accessToken: string,
  workspaceId: string,
): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
    "X-Workspace-Id": workspaceId,
    Accept: "application/json",
  };
}

/**
 * GET /unified/posts/ — recent posts for selected platforms (trailing slash avoids 307).
 * Query: refresh_posts, refresh_stats; optional forceRefresh sets both to true.
 */
export async function fetchUnifiedPosts(
  accessToken: string,
  workspaceId: string,
  options: {
    platforms: string[];
    limit?: number;
    stats?: boolean;
    forceRefresh?: boolean;
    refreshPosts?: boolean;
    refreshStats?: boolean;
    linkedinOrganizationIds?: string[];
    facebookPageIds?: string[];
    /** Pinterest: optional board id (backend `board_id`). */
    pinterestBoardId?: string;
    youtubeChannelId?: string;
    allowPaidLinkedinRefresh?: boolean;
    /** WordPress connection id when fetching blog posts via /unified/blog/posts. */
    wordpressConnectionId?: string;
    signal?: AbortSignal;
  },
): Promise<UnifiedPostsApiResponse> {
  const requested = options.platforms ?? [];
  const hasWordpress = requested.some((p) => p.trim().toLowerCase() === "wordpress");
  const socialPlatforms = requested.filter(
    (p) => p.trim().toLowerCase() !== "wordpress",
  );

  if (hasWordpress && socialPlatforms.length === 0) {
    return fetchUnifiedBlogPosts(accessToken, workspaceId, {
      connectionId: options.wordpressConnectionId,
      limit: options.limit,
      stats: options.stats,
      forceRefresh: options.forceRefresh,
      refreshPosts: options.refreshPosts,
      refreshStats: options.refreshStats,
      signal: options.signal,
    });
  }

  const base = getApiBaseUrl();
  const fr = options.forceRefresh ?? false;
  const refreshPosts = options.refreshPosts ?? fr;
  const refreshStats = options.refreshStats ?? fr;
  const params = new URLSearchParams();
  params.set("limit", String(options.limit ?? 10));
  params.set("stats", String(options.stats ?? true));
  params.set("refresh_posts", String(refreshPosts));
  params.set("refresh_stats", String(refreshStats));
  params.set(
    "allow_paid_linkedin_refresh",
    String(options.allowPaidLinkedinRefresh ?? false),
  );
  for (const p of socialPlatforms.length > 0 ? socialPlatforms : requested) {
    params.append("platforms", p);
  }
  for (const id of options.linkedinOrganizationIds ?? []) {
    const t = id.trim();
    if (t.length > 0) {
      params.append(
        "linkedin_organization_ids",
        normalizeLinkedInOrganizationIdForCommentsApi(t),
      );
    }
  }
  for (const id of options.facebookPageIds ?? []) {
    if (id.trim()) {
      params.append("facebook_page_ids", id.trim());
    }
  }
  const board = (options.pinterestBoardId ?? "").trim();
  if (board.length > 0) {
    params.set("board_id", board);
  }
  const youtubeChannelId = (options.youtubeChannelId ?? "").trim();
  if (youtubeChannelId) {
    params.set("youtube_channel_id", youtubeChannelId);
  }
  const url = `${base}/unified/posts/?${params.toString()}`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    { method: "GET", signal: options.signal },
  );
  const json: unknown = await res.json();
  let parsed = zUnifiedPostsResponse.parse(json);

  if (hasWordpress && socialPlatforms.length > 0) {
    const wpData = await fetchUnifiedBlogPosts(accessToken, workspaceId, {
      connectionId: options.wordpressConnectionId,
      limit: options.limit,
      stats: options.stats,
      forceRefresh: options.forceRefresh,
      refreshPosts: options.refreshPosts,
      refreshStats: options.refreshStats,
      signal: options.signal,
    });
    parsed = {
      ...parsed,
      wordpress: wpData.wordpress ?? null,
    };
  }

  return parsed;
}

/**
 * GET /unified/posts/?limit=10&stats=true&refresh_posts=…&refresh_stats=… — no `platforms` filter;
 * returns every connected platform in one response. Use for Published + “All channels”.
 */
export async function fetchUnifiedPostsAllPlatforms(
  accessToken: string,
  workspaceId: string,
  options?: { forceRefresh?: boolean; refreshPosts?: boolean; refreshStats?: boolean; limit?: number },
): Promise<UnifiedPostsApiResponse> {
  const base = getApiBaseUrl();
  const fr = options?.forceRefresh ?? false;
  const refreshPosts = options?.refreshPosts ?? fr;
  const refreshStats = options?.refreshStats ?? fr;
  const params = new URLSearchParams();
  params.set("limit", String(options?.limit ?? 10));
  params.set("stats", "true");
  params.set("refresh_posts", String(refreshPosts));
  params.set("refresh_stats", String(refreshStats));
  const url = `${base}/unified/posts/?${params.toString()}`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    { method: "GET" },
  );
  const json: unknown = await res.json();
  return zUnifiedPostsResponse.parse(json);
}
