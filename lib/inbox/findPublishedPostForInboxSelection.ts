import type { ContentManagerPost } from "@/app/(workspace)/content-manager/_types/contentManagerTypes";

/** Last numeric segment — matches backend unified single-post refresh. */
export function inboxPostIdNumericKey(value: string): string {
  const raw = value.trim().replace(/^li-unified-/i, "");
  if (!raw) {
    return "";
  }
  const trailing = /(\d+)$/.exec(raw);
  if (trailing) {
    return trailing[1];
  }
  if (raw.includes(":")) {
    return raw.split(":").pop()?.trim() ?? raw;
  }
  return raw;
}

function idsReferToSamePost(a: string, b: string): boolean {
  const left = a.trim();
  const right = b.trim();
  if (!left || !right) {
    return false;
  }
  if (left === right) {
    return true;
  }
  const numA = inboxPostIdNumericKey(left);
  const numB = inboxPostIdNumericKey(right);
  if (numA && numB && numA === numB) {
    return true;
  }
  return left.endsWith(right) || right.endsWith(left);
}

export function publishedPostMatchesSourceId(
  post: ContentManagerPost,
  sourcePostId: string,
): boolean {
  return idsReferToSamePost(post.id, sourcePostId);
}

/** Map comment bucket `post_id` → published list row for left-panel selection. */
export function findPublishedPostForInboxSelection(
  posts: readonly ContentManagerPost[],
  postId: string | null | undefined,
): ContentManagerPost | null {
  const key = postId?.trim() ?? "";
  if (!key) {
    return null;
  }
  const exact = posts.find((p) => p.id.trim() === key);
  if (exact) {
    return exact;
  }
  return posts.find((p) => publishedPostMatchesSourceId(p, key)) ?? null;
}
