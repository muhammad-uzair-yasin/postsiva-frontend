/** Match backend scheduling: org URN → numeric tail; personal id stored as-is. */
export function normalizeLinkedInScheduledPlatformUserId(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    return trimmed;
  }
  if (trimmed.includes(":")) {
    const tail = trimmed.split(":").pop();
    return tail?.trim() || trimmed;
  }
  return trimmed;
}

function nonEmptyString(v: unknown): string | null {
  if (typeof v !== "string") {
    return null;
  }
  const t = v.trim();
  return t.length > 0 ? t : null;
}

/** Raw member id as stored on scheduled rows (`profile.linkedin_user_id`). */
export function linkedInMemberPlatformUserId(
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
  return nonEmptyString((profile as Record<string, unknown>).linkedin_user_id);
}

export function isLinkedInPersonalHeaderAccountId(accountId: string): boolean {
  return accountId.trim() === "linkedin";
}

export function isLinkedInOrgHeaderAccountId(accountId: string): boolean {
  return accountId.trim().startsWith("linkedin:org:");
}

/** Header account ids that share LinkedIn scheduled-post caches (personal + each org). */
export function linkedInScheduledHeaderAccountIds(
  accountIds: readonly string[],
): string[] {
  const out: string[] = [];
  for (const id of accountIds) {
    const trimmed = id.trim();
    if (isLinkedInPersonalHeaderAccountId(trimmed) || isLinkedInOrgHeaderAccountId(trimmed)) {
      out.push(trimmed);
    }
  }
  return out;
}
