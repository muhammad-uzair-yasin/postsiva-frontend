function draftIdFromListItem(item: unknown): string | null {
  if (typeof item === "string") {
    const id = item.trim();
    return id || null;
  }
  if (item !== null && typeof item === "object" && !Array.isArray(item)) {
    const rec = item as Record<string, unknown>;
    const direct = rec.id;
    if (typeof direct === "string" && direct.trim()) {
      return direct.trim();
    }
    // Multi-platform: { platform, draft: { id, ... } }
    const nested = rec.draft;
    if (nested !== null && typeof nested === "object" && !Array.isArray(nested)) {
      const nid = (nested as Record<string, unknown>).id;
      if (typeof nid === "string" && nid.trim()) {
        return nid.trim();
      }
    }
  }
  return null;
}

/** Parses draft ids from POST /unified/post/* responses when `draft: true` was sent (mobile parity). */
export function extractDraftIdsFromUnifiedPostResponse(
  response: unknown,
): string[] {
  if (response === null || typeof response !== "object") {
    return [];
  }
  const o = response as Record<string, unknown>;
  const drafts = o.drafts;
  const out: string[] = [];
  if (Array.isArray(drafts)) {
    for (const item of drafts) {
      const id = draftIdFromListItem(item);
      if (id) {
        out.push(id);
      }
    }
  }
  // Single-platform draft: API returns DraftSaveResponseSingle { draft: { id, ... } } (no `drafts` array).
  if (out.length === 0) {
    const single = o.draft;
    if (single !== null && typeof single === "object" && !Array.isArray(single)) {
      const id = (single as Record<string, unknown>).id;
      if (typeof id === "string" && id.trim()) {
        out.push(id.trim());
      }
    }
  }
  // POST /unified/blog/drafts returns { data: { id, ... } }.
  if (out.length === 0) {
    const data = o.data;
    if (data !== null && typeof data === "object" && !Array.isArray(data)) {
      const id = (data as Record<string, unknown>).id;
      if (typeof id === "string" && id.trim()) {
        out.push(id.trim());
      }
    }
  }
  return out;
}
