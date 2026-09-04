import type { ContentManagerPost } from "../_types/contentManagerTypes";

/**
 * Puts `incoming` first (API order), then appends prior rows whose ids were not in
 * the refresh batch so the list grows by merge instead of full replace.
 */
export function mergePublishedPostsById(
  previous: ContentManagerPost[],
  incoming: ContentManagerPost[],
): ContentManagerPost[] {
  if (incoming.length === 0) {
    return previous;
  }
  const incomingIds = new Set(incoming.map((p) => p.id));
  const merged: ContentManagerPost[] = [...incoming];
  for (const p of previous) {
    if (!incomingIds.has(p.id)) {
      merged.push(p);
    }
  }
  return merged;
}
