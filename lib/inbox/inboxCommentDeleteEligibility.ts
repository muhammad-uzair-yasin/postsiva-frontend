import type { UnifiedInboxPlatform } from "@/lib/inbox/unifiedInboxTypes";

function nonEmptyString(v: unknown): string | null {
  if (typeof v !== "string") {
    return null;
  }
  const t = v.trim();
  return t.length > 0 ? t : null;
}

/** Normalize LinkedIn member id to urn:li:person:… for comparison. */
export function normalizeLinkedInPersonActorId(raw: string): string {
  const s = raw.trim();
  const lower = s.toLowerCase();
  if (lower.startsWith("urn:li:person:")) {
    return lower;
  }
  return `urn:li:person:${lower}`;
}

export function linkedInConnectedPersonActorId(
  unifiedProfiles: Record<string, unknown> | null | undefined,
): string | null {
  if (!unifiedProfiles) {
    return null;
  }
  const block = unifiedProfiles.linkedin;
  if (block === null || typeof block !== "object") {
    return null;
  }
  const profile = (block as Record<string, unknown>).profile;
  if (profile === null || typeof profile !== "object") {
    return null;
  }
  const id = nonEmptyString((profile as Record<string, unknown>).linkedin_user_id);
  if (!id) {
    return null;
  }
  return normalizeLinkedInPersonActorId(id);
}

/**
 * LinkedIn personal posts: members may delete only their own comments via API.
 * Org/page inbox context keeps delete for all comments (page moderation).
 */
export function inboxCommentDeleteAllowed(params: {
  platform: UnifiedInboxPlatform;
  sourceAuthorId?: string;
  sourceOrganizationId?: string;
  selectedAccountId?: string | null;
  unifiedProfiles: Record<string, unknown> | null | undefined;
}): boolean {
  if (params.platform !== "linkedin") {
    return true;
  }
  const orgOnMessage = nonEmptyString(params.sourceOrganizationId);
  const selected = params.selectedAccountId?.trim() ?? "";
  const orgContext =
    Boolean(orgOnMessage) || selected.startsWith("linkedin:org:");
  if (orgContext) {
    return true;
  }
  const author = nonEmptyString(params.sourceAuthorId);
  if (!author) {
    return false;
  }
  const connected = linkedInConnectedPersonActorId(params.unifiedProfiles);
  if (!connected) {
    return false;
  }
  return normalizeLinkedInPersonActorId(author) === connected;
}
