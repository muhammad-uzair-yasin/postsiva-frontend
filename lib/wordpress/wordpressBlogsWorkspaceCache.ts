import type { WordPressBlogPost } from "@/lib/social/wordpressPostsApi";
import type { WordPressMediaItem } from "@/lib/social/wordpressMediaApi";

interface CacheEntry {
  readonly posts: readonly WordPressBlogPost[];
  readonly media: readonly WordPressMediaItem[];
  readonly source: string | null;
  readonly updatedAt: number;
}

const entries = new Map<string, CacheEntry>();

function cacheKey(workspaceId: string): string {
  return workspaceId.trim();
}

export function setWordPressBlogsWorkspaceCache(
  workspaceId: string,
  posts: readonly WordPressBlogPost[],
  media: readonly WordPressMediaItem[],
  source: string | null,
): void {
  entries.set(cacheKey(workspaceId), {
    posts: [...posts],
    media: [...media],
    source,
    updatedAt: Date.now(),
  });
}

export function getWordPressBlogsWorkspaceCache(workspaceId: string): CacheEntry | null {
  const entry = entries.get(cacheKey(workspaceId));
  if (!entry) return null;
  return {
    posts: [...entry.posts],
    media: [...entry.media],
    source: entry.source,
    updatedAt: entry.updatedAt,
  };
}

export function isWordPressBlogsWorkspaceCacheHydrated(workspaceId: string): boolean {
  return entries.has(cacheKey(workspaceId));
}

export function clearWordPressBlogsWorkspaceCache(): void {
  entries.clear();
}
