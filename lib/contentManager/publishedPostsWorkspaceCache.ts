import type { ContentManagerPost } from "@/app/(workspace)/content-manager/_types/contentManagerTypes";

interface CacheEntry {
  readonly posts: readonly ContentManagerPost[];
  readonly updatedAt: number;
  /** Max API limit used when this entry was last populated. */
  readonly fetchedLimit: number;
  /** True when a network fetch confirmed zero posts (vs UI filter writing []). */
  readonly emptyConfirmed: boolean;
}

const entries = new Map<string, CacheEntry>();
const listeners = new Set<() => void>();
let snapshotVersion = 0;

function cacheKey(workspaceId: string, accountId: string): string {
  return `${workspaceId.trim()}\u0000${accountId.trim()}`;
}

/** True when both lists have the same length and the same post ids in order. */
export function arePublishedPostListsSameById(
  a: readonly ContentManagerPost[],
  b: readonly ContentManagerPost[],
): boolean {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i]!.id !== b[i]!.id) {
      return false;
    }
  }
  return true;
}

export function subscribePublishedPostsWorkspaceCache(
  onStoreChange: () => void,
): () => void {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

export function getPublishedPostsWorkspaceCacheVersion(): number {
  return snapshotVersion;
}

function notify(): void {
  snapshotVersion += 1;
  for (const l of listeners) {
    l();
  }
}

export interface SetPublishedPostsWorkspaceCacheOptions {
  /**
   * Allow writing an empty list and treat it as a confirmed network empty.
   * Default false — UI filters must not poison a shared cache with [].
   */
  readonly allowEmpty?: boolean;
}

/**
 * Shared published-post cache for Content Manager / Calendar / Inbox.
 * Never overwrites a non-empty entry with an empty list unless `allowEmpty`.
 * Skips notify when posts (by id) + limit + emptyConfirmed are unchanged —
 * prevents CM write-back ↔ hook re-read infinite loops that freeze the tab.
 */
export function setPublishedPostsWorkspaceCache(
  workspaceId: string,
  accountId: string,
  posts: readonly ContentManagerPost[],
  fetchedLimit?: number,
  options?: SetPublishedPostsWorkspaceCacheOptions,
): void {
  const key = cacheKey(workspaceId, accountId);
  const existing = entries.get(key);
  const allowEmpty = options?.allowEmpty === true;

  if (posts.length === 0 && !allowEmpty) {
    // Skip empty UI writes — they must not mark the account as hydrated.
    return;
  }

  const limit = Math.max(
    fetchedLimit ?? posts.length,
    existing?.fetchedLimit ?? 0,
  );
  const emptyConfirmed = posts.length === 0 && allowEmpty;

  if (
    existing &&
    arePublishedPostListsSameById(existing.posts, posts) &&
    existing.fetchedLimit === limit &&
    existing.emptyConfirmed === emptyConfirmed
  ) {
    return;
  }

  // Same posts, only metadata changed — update silently (no subscriber storm).
  if (existing && arePublishedPostListsSameById(existing.posts, posts)) {
    entries.set(key, {
      posts: existing.posts,
      updatedAt: existing.updatedAt,
      fetchedLimit: limit,
      emptyConfirmed,
    });
    return;
  }

  entries.set(key, {
    posts: [...posts],
    updatedAt: Date.now(),
    fetchedLimit: limit,
    emptyConfirmed,
  });
  notify();
}

export function getPublishedPostsWorkspaceCache(
  workspaceId: string,
  accountId: string,
): ContentManagerPost[] | null {
  const e = entries.get(cacheKey(workspaceId, accountId));
  if (!e) {
    return null;
  }
  // Poisoned empty (UI wrote [] before allowEmpty guard) — treat as missing.
  if (e.posts.length === 0 && !e.emptyConfirmed) {
    return null;
  }
  return [...e.posts];
}

/**
 * When Content Manager or Inbox already hydrated the cache for this workspace +
 * account, return those posts (optionally sliced to the current page limit).
 */
export function readHydratedPublishedPostsCache(
  workspaceId: string,
  accountId: string,
  limit?: number,
): ContentManagerPost[] | null {
  if (!workspaceId.trim() || !accountId.trim()) {
    return null;
  }
  const entry = entries.get(cacheKey(workspaceId, accountId));
  if (!entry) {
    return null;
  }
  // Poisoned empty (UI wrote [] before allowEmpty guard) — treat as missing.
  if (entry.posts.length === 0 && !entry.emptyConfirmed) {
    return null;
  }
  const posts = [...entry.posts];
  if (limit != null && limit > 0) {
    return posts.slice(0, limit);
  }
  return posts;
}

/**
 * True when a usable cache entry exists: non-empty posts, or a network-confirmed empty.
 * Poisoned empty entries return false so the next page can fetch.
 */
export function isPublishedPostsWorkspaceCacheHydrated(
  workspaceId: string,
  accountId: string,
): boolean {
  const key = cacheKey(workspaceId, accountId);
  const entry = entries.get(key);
  if (!entry) {
    return false;
  }
  if (entry.posts.length > 0) {
    return true;
  }
  if (entry.emptyConfirmed) {
    return true;
  }
  // Drop poisoned empties so the next page can fetch cleanly.
  entries.delete(key);
  return false;
}

/** Drop one account entry so the next visitor re-fetches. */
export function invalidatePublishedPostsWorkspaceCache(
  workspaceId: string,
  accountId: string,
): void {
  if (entries.delete(cacheKey(workspaceId, accountId))) {
    notify();
  }
}

/** Clears all cache entries so the next load re-fetches from the API. */
export function clearPublishedPostsWorkspaceCache(): void {
  if (entries.size === 0) {
    return;
  }
  entries.clear();
  notify();
}

/** Wake subscribers without mutating entries (ensure inflight settled). */
export function notifyPublishedPostsWorkspaceCacheListeners(): void {
  notify();
}
