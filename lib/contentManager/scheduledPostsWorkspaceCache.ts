import type { UnifiedScheduledPostItemJson } from "@/lib/social/unifiedScheduledPostsApi";

interface CacheEntry {
  readonly posts: readonly UnifiedScheduledPostItemJson[];
  readonly updatedAt: number;
}

const entries = new Map<string, CacheEntry>();
const listeners = new Set<() => void>();
let snapshotVersion = 0;

function cacheKey(workspaceId: string, accountId: string): string {
  return `${workspaceId.trim()}\u0000${accountId.trim()}`;
}

/**
 * Signature includes schedule + display content so caption/media edits notify
 * subscribers (avoids stale Calendar/CM until hard refresh).
 */
export function scheduledPostsContentSignature(
  posts: readonly UnifiedScheduledPostItemJson[],
): string {
  return posts
    .map((p) =>
      [
        p.scheduled_post_id?.trim() ?? "",
        p.platform ?? "",
        p.platform_user_id ?? "",
        p.status ?? "",
        p.scheduled_time ?? "",
        p.scheduled_time_local ?? "",
        p.updated_at ?? "",
        scheduledPostDataFingerprint(p.post_data),
      ].join("\u0001"),
    )
    .join("\n");
}

/** Stable fingerprint of caption/media fields used by calendar/CM cards. */
function scheduledPostDataFingerprint(
  postData: Record<string, unknown> | null | undefined,
): string {
  const d = postData ?? {};
  const str = (key: string): string => {
    const v = d[key];
    return typeof v === "string" ? v : v == null ? "" : String(v);
  };
  const list = (key: string): string => {
    const v = d[key];
    if (!Array.isArray(v)) {
      return "";
    }
    return v.map((x) => (typeof x === "string" ? x : String(x))).join(",");
  };
  return [
    str("text"),
    str("default_text"),
    str("caption"),
    str("message"),
    str("image_url"),
    str("video_url"),
    str("media_url"),
    str("thumbnail_url"),
    list("image_urls"),
    list("media_ids"),
    list("media_urls"),
    str("wordpress_title"),
    str("wordpress_content"),
    str("wordpress_excerpt"),
  ].join("\u0002");
}

export function areScheduledPostListsEquivalent(
  a: readonly UnifiedScheduledPostItemJson[],
  b: readonly UnifiedScheduledPostItemJson[],
): boolean {
  if (a.length !== b.length) {
    return false;
  }
  return scheduledPostsContentSignature(a) === scheduledPostsContentSignature(b);
}

export function subscribeScheduledPostsWorkspaceCache(
  onStoreChange: () => void,
): () => void {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

export function getScheduledPostsWorkspaceCacheVersion(): number {
  return snapshotVersion;
}

function notify(): void {
  snapshotVersion += 1;
  for (const l of listeners) {
    l();
  }
}

/**
 * Shared scheduled-post cache (Calendar fills; CM/Library may read).
 * Skips notify when content signature is unchanged — same class of guard as
 * {@link setPublishedPostsWorkspaceCache}.
 */
export function setScheduledPostsWorkspaceCache(
  workspaceId: string,
  accountId: string,
  posts: readonly UnifiedScheduledPostItemJson[],
): void {
  const key = cacheKey(workspaceId, accountId);
  const existing = entries.get(key);
  if (existing && areScheduledPostListsEquivalent(existing.posts, posts)) {
    return;
  }
  entries.set(key, {
    posts: [...posts],
    updatedAt: Date.now(),
  });
  notify();
}

export function getScheduledPostsWorkspaceCache(
  workspaceId: string,
  accountId: string,
): UnifiedScheduledPostItemJson[] | null {
  const e = entries.get(cacheKey(workspaceId, accountId));
  return e ? [...e.posts] : null;
}

/** All scheduled rows cached for a workspace (any header account). Calendar fills these. */
export function getAllScheduledPostsWorkspaceCacheForWorkspace(
  workspaceId: string,
): UnifiedScheduledPostItemJson[] {
  const prefix = `${workspaceId.trim()}\u0000`;
  const out: UnifiedScheduledPostItemJson[] = [];
  const seen = new Set<string>();
  for (const [key, entry] of entries) {
    if (!key.startsWith(prefix)) {
      continue;
    }
    for (const post of entry.posts) {
      const id = post.scheduled_post_id?.trim();
      if (id && seen.has(id)) {
        continue;
      }
      if (id) {
        seen.add(id);
      }
      out.push(post);
    }
  }
  return out;
}

export function isScheduledPostsWorkspaceCacheHydrated(
  workspaceId: string,
  accountId: string,
): boolean {
  return entries.has(cacheKey(workspaceId, accountId));
}

export function clearScheduledPostsWorkspaceCache(): void {
  if (entries.size === 0) {
    return;
  }
  entries.clear();
  notify();
}

/** Drop one account entry so the next page visit re-fetches scheduled. */
export function invalidateScheduledPostsWorkspaceCache(
  workspaceId: string,
  accountId: string,
): void {
  if (entries.delete(cacheKey(workspaceId, accountId))) {
    notify();
  }
}
