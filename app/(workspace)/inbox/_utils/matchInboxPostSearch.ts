import type { ContentManagerPost } from "@/app/(workspace)/content-manager/_types/contentManagerTypes";

/** Client-only filter for inbox post list (no network). */
export function matchInboxPostSearch(
  post: ContentManagerPost,
  rawQuery: string,
): boolean {
  const q = rawQuery.trim().toLowerCase();
  if (q.length === 0) {
    return true;
  }
  const parts: string[] = [
    post.handle,
    post.body,
    post.title ?? "",
    post.channel,
  ];
  return parts.some((p) => p.toLowerCase().includes(q));
}
