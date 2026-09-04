/**
 * LinkedIn unified post ids in the UI may be prefixed (e.g. `li-unified-{numericId}`).
 * GET /unified/comments/by-post expects the bare numeric activity id in `post_id`.
 */
export function normalizeLinkedInPostIdForCommentsApi(postId: string): string {
  const t = postId.trim();
  return t.replace(/^li-unified-/i, "");
}

/**
 * LinkedIn org may be a URN (`urn:li:organization:109408332`) or digits only.
 * Use the numeric id in query params for GET /unified/comments/* and GET /unified/posts/.
 */
export function normalizeLinkedInOrganizationIdForCommentsApi(
  organizationId: string,
): string {
  const t = organizationId.trim();
  const urn = /^urn:li:organization:(\d+)$/i.exec(t);
  if (urn) {
    return urn[1];
  }
  if (/^\d+$/.test(t)) {
    return t;
  }
  return t;
}
