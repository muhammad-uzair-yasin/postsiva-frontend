import type { UnifiedInboxMessage } from "@/lib/inbox/unifiedInboxTypes";

/** Groups direct child comments by parent message id (oldest first within each thread). */
export function buildReplyChildrenMap(
  messages: readonly UnifiedInboxMessage[],
): Map<string, UnifiedInboxMessage[]> {
  const map = new Map<string, UnifiedInboxMessage[]>();
  for (const m of messages) {
    if (!m.parentMessageId) {
      continue;
    }
    const list = map.get(m.parentMessageId) ?? [];
    list.push(m);
    map.set(m.parentMessageId, list);
  }
  for (const list of map.values()) {
    list.sort((a, b) => (a.sortMs ?? 0) - (b.sortMs ?? 0));
  }
  return map;
}
