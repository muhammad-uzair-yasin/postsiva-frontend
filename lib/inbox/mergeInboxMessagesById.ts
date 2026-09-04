import type { UnifiedInboxMessage } from "@/lib/inbox/unifiedInboxTypes";

export function mergeInboxMessagesById(
  ...lists: readonly (readonly UnifiedInboxMessage[])[]
): UnifiedInboxMessage[] {
  const map = new Map<string, UnifiedInboxMessage>();
  for (const list of lists) {
    for (const m of list) {
      map.set(m.id, m);
    }
  }
  return [...map.values()];
}

/** Drop every message tied to `postId`, then merge in `replacement` (by id). */
export function replacePostThreadInInboxMessages(
  all: readonly UnifiedInboxMessage[],
  postId: string,
  replacement: readonly UnifiedInboxMessage[],
): UnifiedInboxMessage[] {
  const pid = postId.trim();
  if (pid.length === 0) {
    return mergeInboxMessagesById(all, replacement);
  }
  const kept = all.filter((m) => (m.sourcePostId?.trim() ?? "") !== pid);
  return mergeInboxMessagesById(kept, replacement);
}

/** Drop a deleted comment from a refetched thread when the provider still returns it briefly. */
export function filterDeletedCommentFromInboxThread(
  rows: readonly UnifiedInboxMessage[],
  deleted: UnifiedInboxMessage,
): UnifiedInboxMessage[] {
  const sourceId = deleted.sourceCommentId?.trim() ?? "";
  const messageId = deleted.id;
  if (!sourceId && !messageId) {
    return [...rows];
  }
  return rows.filter((m) => {
    if (m.id === messageId) {
      return false;
    }
    if (sourceId.length > 0 && (m.sourceCommentId?.trim() ?? "") === sourceId) {
      return false;
    }
    return true;
  });
}
