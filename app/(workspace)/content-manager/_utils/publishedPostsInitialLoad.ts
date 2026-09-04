import type { ContentManagerPost } from "../_types/contentManagerTypes";
import type { PublishedUnifiedPlatform } from "./skipPublishedSinglePlatformFetch";
import { isPublishedPostsEnsureInFlight } from "@/lib/contentManager/ensureSelectedAccountPostsHydrated";
import { readHydratedPublishedPostsCache } from "@/lib/contentManager/publishedPostsWorkspaceCache";
import { getStoredHeaderAccountId } from "@/lib/workspace/headerAccountSelection";

export type PublishedPostsInitialLoadDecision =
  | "skip"
  | "wait"
  | "fetch"
  | { cache: ContentManagerPost[] };

function normalizeResourceId(value: string): string {
  return value.trim().replace(/_/g, ":").toLowerCase();
}

function normalizeHandleCompare(a: string, b: string): boolean {
  return normalizeResourceId(a) === normalizeResourceId(b);
}

function postMatchesFacebookPageId(
  post: ContentManagerPost,
  pageId: string,
): boolean {
  const want = normalizeResourceId(pageId);
  if (!want) {
    return true;
  }
  if (post.pageId?.trim() && normalizeResourceId(post.pageId) === want) {
    return true;
  }
  // Legacy rows / hydrator may only have the page id on handle.
  return normalizeHandleCompare(post.handle, pageId);
}

function postMatchesLinkedInOrgId(
  post: ContentManagerPost,
  orgId: string,
): boolean {
  const want = normalizeResourceId(orgId);
  if (!want) {
    return true;
  }
  if (post.organizationId?.trim() && normalizeResourceId(post.organizationId) === want) {
    return true;
  }
  return normalizeHandleCompare(post.handle, orgId);
}

/** Slice cached workspace posts for a single-platform published hook. */
export function filterPublishedCachePosts(
  posts: readonly ContentManagerPost[],
  platform: PublishedUnifiedPlatform,
  channelFilter?: string,
): ContentManagerPost[] {
  let filtered = posts.filter((post) => {
    if (platform === "linkedin") {
      return post.channel === "linkedin" || post.channel?.startsWith("linkedin:");
    }
    return post.channel === platform;
  });

  if (platform === "linkedin" && channelFilter?.startsWith("linkedin:")) {
    const want = channelFilter.slice("linkedin:".length).trim();
    if (want) {
      filtered = filtered.filter((post) => postMatchesLinkedInOrgId(post, want));
    }
  }

  if (platform === "facebook" && channelFilter?.startsWith("facebook:")) {
    const want = channelFilter.slice("facebook:".length).trim();
    if (want) {
      filtered = filtered.filter((post) => postMatchesFacebookPageId(post, want));
    }
  }

  return filtered;
}

/**
 * Prefer cached published posts even while header profiles are still loading
 * (use last stored account id for the workspace).
 */
export function resolvePublishedPostsInitialLoad(options: {
  skip: boolean;
  isLoadingProfiles: boolean;
  accountId: string | undefined;
  workspaceId: string | null;
  token: string | null;
  limit?: number;
}): PublishedPostsInitialLoadDecision {
  if (options.skip) {
    return "skip";
  }

  const workspaceId = options.workspaceId?.trim() || null;
  const accountId =
    options.accountId?.trim() ||
    (workspaceId ? getStoredHeaderAccountId(workspaceId) : null) ||
    "";

  if (workspaceId && accountId) {
    const cached = readHydratedPublishedPostsCache(
      workspaceId,
      accountId,
      options.limit,
    );
    if (cached !== null) {
      return { cache: cached };
    }
  }

  if (options.isLoadingProfiles) {
    return "wait";
  }

  if (!accountId) {
    return "skip";
  }
  if (!workspaceId || !options.token?.trim()) {
    return "fetch";
  }
  // Hydrator (Calendar/Inbox) already fetching — wait for cache notify.
  if (isPublishedPostsEnsureInFlight(workspaceId, accountId)) {
    return "wait";
  }
  return "fetch";
}
