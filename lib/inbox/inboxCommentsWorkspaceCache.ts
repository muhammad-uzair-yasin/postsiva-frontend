import type { UnifiedCommentClassificationStatusJson } from "@/lib/inbox/unifiedCommentsTypes";
import type { UnifiedInboxMessage } from "@/lib/inbox/unifiedInboxTypes";

export interface InboxCommentsCacheEntry {
  readonly messages: readonly UnifiedInboxMessage[];
  readonly classificationStatus: UnifiedCommentClassificationStatusJson | null;
  readonly commentsDisabled: boolean;
  readonly commentStatusMessage: string | null;
  readonly channelCommentsUnsupported: boolean;
  readonly updatedAt: number;
  readonly postLimit: number;
  /** Empty list from a successful network response (not a UI clear). */
  readonly emptyConfirmed: boolean;
}

const entries = new Map<string, InboxCommentsCacheEntry>();
const listeners = new Set<() => void>();
let snapshotVersion = 0;

function cacheKey(
  workspaceId: string,
  accountId: string,
  postId: string | null,
): string {
  const postPart = postId?.trim() ? postId.trim() : "account";
  return `${workspaceId.trim()}\u0000${accountId.trim()}\u0000${postPart}`;
}

export function areInboxMessageListsSameById(
  a: readonly UnifiedInboxMessage[],
  b: readonly UnifiedInboxMessage[],
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

function sameClassification(
  a: UnifiedCommentClassificationStatusJson | null | undefined,
  b: UnifiedCommentClassificationStatusJson | null | undefined,
): boolean {
  if (a == null && b == null) {
    return true;
  }
  if (a == null || b == null) {
    return false;
  }
  return (
    a.state === b.state &&
    a.pending_count === b.pending_count &&
    a.completed_count === b.completed_count
  );
}

export function subscribeInboxCommentsWorkspaceCache(
  onStoreChange: () => void,
): () => void {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

export function getInboxCommentsWorkspaceCacheVersion(): number {
  return snapshotVersion;
}

function notify(): void {
  snapshotVersion += 1;
  for (const l of listeners) {
    l();
  }
}

export interface SetInboxCommentsWorkspaceCacheOptions {
  readonly allowEmpty?: boolean;
  readonly classificationStatus?: UnifiedCommentClassificationStatusJson | null;
  readonly commentsDisabled?: boolean;
  readonly commentStatusMessage?: string | null;
  readonly channelCommentsUnsupported?: boolean;
  readonly postLimit?: number;
}

/**
 * Session cache for Inbox comments (account-wide or per-post).
 * Same pattern as published posts: show cached on revisit; Refresh force-fetches.
 */
export function setInboxCommentsWorkspaceCache(
  workspaceId: string,
  accountId: string,
  postId: string | null,
  messages: readonly UnifiedInboxMessage[],
  options?: SetInboxCommentsWorkspaceCacheOptions,
): void {
  const key = cacheKey(workspaceId, accountId, postId);
  const existing = entries.get(key);
  const allowEmpty = options?.allowEmpty === true;

  if (messages.length === 0 && !allowEmpty) {
    return;
  }

  const postLimit = Math.max(
    options?.postLimit ?? messages.length,
    existing?.postLimit ?? 0,
  );
  const emptyConfirmed = messages.length === 0 && allowEmpty;
  const classificationStatus =
    options?.classificationStatus !== undefined
      ? options.classificationStatus
      : (existing?.classificationStatus ?? null);
  const commentsDisabled =
    options?.commentsDisabled ?? existing?.commentsDisabled ?? false;
  const commentStatusMessage =
    options?.commentStatusMessage !== undefined
      ? options.commentStatusMessage
      : (existing?.commentStatusMessage ?? null);
  const channelCommentsUnsupported =
    options?.channelCommentsUnsupported ??
    existing?.channelCommentsUnsupported ??
    false;

  if (
    existing &&
    areInboxMessageListsSameById(existing.messages, messages) &&
    existing.postLimit === postLimit &&
    existing.emptyConfirmed === emptyConfirmed &&
    existing.commentsDisabled === commentsDisabled &&
    existing.channelCommentsUnsupported === channelCommentsUnsupported &&
    existing.commentStatusMessage === commentStatusMessage &&
    sameClassification(existing.classificationStatus, classificationStatus)
  ) {
    return;
  }

  if (existing && areInboxMessageListsSameById(existing.messages, messages)) {
    const classificationChanged = !sameClassification(
      existing.classificationStatus,
      classificationStatus,
    );
    entries.set(key, {
      messages: existing.messages,
      updatedAt: existing.updatedAt,
      postLimit,
      emptyConfirmed,
      classificationStatus,
      commentsDisabled,
      commentStatusMessage,
      channelCommentsUnsupported,
    });
    if (classificationChanged) {
      notify();
    }
    return;
  }

  entries.set(key, {
    messages: [...messages],
    updatedAt: Date.now(),
    postLimit,
    emptyConfirmed,
    classificationStatus,
    commentsDisabled,
    commentStatusMessage,
    channelCommentsUnsupported,
  });
  notify();
}

export function readInboxCommentsWorkspaceCache(
  workspaceId: string,
  accountId: string,
  postId: string | null,
): InboxCommentsCacheEntry | null {
  if (!workspaceId.trim() || !accountId.trim()) {
    return null;
  }
  const entry = entries.get(cacheKey(workspaceId, accountId, postId));
  if (!entry) {
    return null;
  }
  if (entry.messages.length === 0 && !entry.emptyConfirmed) {
    return null;
  }
  return {
    ...entry,
    messages: [...entry.messages],
  };
}

export function isInboxCommentsWorkspaceCacheHydrated(
  workspaceId: string,
  accountId: string,
  postId: string | null,
): boolean {
  const entry = entries.get(cacheKey(workspaceId, accountId, postId));
  if (!entry) {
    return false;
  }
  if (entry.messages.length > 0 || entry.emptyConfirmed) {
    return true;
  }
  entries.delete(cacheKey(workspaceId, accountId, postId));
  return false;
}

export function clearInboxCommentsWorkspaceCache(): void {
  if (entries.size === 0) {
    return;
  }
  entries.clear();
  notify();
}

export function invalidateInboxCommentsWorkspaceCache(
  workspaceId: string,
  accountId: string,
  postId?: string | null,
): void {
  if (postId !== undefined) {
    if (entries.delete(cacheKey(workspaceId, accountId, postId))) {
      notify();
    }
    return;
  }
  const prefix = `${workspaceId.trim()}\u0000${accountId.trim()}\u0000`;
  let removed = false;
  for (const key of [...entries.keys()]) {
    if (key.startsWith(prefix) && entries.delete(key)) {
      removed = true;
    }
  }
  if (removed) {
    notify();
  }
}
