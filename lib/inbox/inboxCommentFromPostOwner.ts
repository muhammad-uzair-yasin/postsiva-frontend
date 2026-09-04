import type { UnifiedInboxMessage } from "@/lib/inbox/unifiedInboxTypes";
import {
  linkedInConnectedPersonActorId,
  normalizeLinkedInPersonActorId,
} from "@/lib/inbox/inboxCommentDeleteEligibility";

function nonEmpty(v: string | null | undefined): string | null {
  const t = v?.trim();
  return t && t.length > 0 ? t : null;
}

function normalizeOrgUrn(raw: string): string {
  const s = raw.trim().toLowerCase();
  if (s.startsWith("urn:li:organization:")) {
    return s;
  }
  return `urn:li:organization:${s}`;
}

function profileBlock(
  unifiedProfiles: Record<string, unknown> | null | undefined,
  key: string,
): Record<string, unknown> | null {
  if (!unifiedProfiles) {
    return null;
  }
  const block = unifiedProfiles[key];
  if (block === null || typeof block !== "object") {
    return null;
  }
  const profile = (block as Record<string, unknown>).profile;
  if (profile === null || typeof profile !== "object") {
    return null;
  }
  return profile as Record<string, unknown>;
}

function profileString(
  profile: Record<string, unknown> | null,
  keys: readonly string[],
): string | null {
  if (!profile) {
    return null;
  }
  for (const key of keys) {
    const v = profile[key];
    if (typeof v === "string" && v.trim()) {
      return v.trim();
    }
  }
  return null;
}

function usernamesEqual(a: string, b: string): boolean {
  const na = a.trim().replace(/^@/, "").toLowerCase();
  const nb = b.trim().replace(/^@/, "").toLowerCase();
  return na.length > 0 && na === nb;
}

/**
 * True when the comment was written by the connected post owner / page / channel
 * (LinkedIn "Author" badge case). AI should not generate or post replies to these.
 */
export function isInboxCommentFromPostOwner(
  message: UnifiedInboxMessage,
  unifiedProfiles: Record<string, unknown> | null | undefined,
): boolean {
  const authorId = nonEmpty(message.sourceAuthorId);
  const displayName = nonEmpty(message.userName);

  if (message.platform === "facebook") {
    const pageId = nonEmpty(message.sourcePageId);
    if (pageId && authorId && pageId === authorId) {
      return true;
    }
  }

  if (message.platform === "linkedin") {
    const orgId = nonEmpty(message.sourceOrganizationId);
    if (orgId && authorId) {
      if (normalizeOrgUrn(authorId) === normalizeOrgUrn(orgId)) {
        return true;
      }
    }
    const connected = linkedInConnectedPersonActorId(unifiedProfiles);
    if (
      connected &&
      authorId &&
      normalizeLinkedInPersonActorId(authorId) === connected
    ) {
      return true;
    }
  }

  if (message.platform === "youtube") {
    const channelId = nonEmpty(message.sourceYoutubeChannelId);
    if (channelId && authorId && channelId === authorId) {
      return true;
    }
  }

  if (message.platform === "instagram") {
    const profile = profileBlock(unifiedProfiles, "instagram");
    const username = profileString(profile, ["username", "name"]);
    if (username && displayName && usernamesEqual(username, displayName)) {
      return true;
    }
  }

  if (message.platform === "threads") {
    const profile = profileBlock(unifiedProfiles, "threads");
    const username = profileString(profile, ["username", "full_name"]);
    if (username && displayName && usernamesEqual(username, displayName)) {
      return true;
    }
  }

  if (message.platform === "tiktok") {
    const profile = profileBlock(unifiedProfiles, "tiktok");
    const username = profileString(profile, ["username", "display_name"]);
    if (username && displayName && usernamesEqual(username, displayName)) {
      return true;
    }
  }

  if (message.platform === "bluesky") {
    const profile = profileBlock(unifiedProfiles, "bluesky");
    const did = profileString(profile, ["did", "id"]);
    if (did && authorId && did === authorId) {
      return true;
    }
    const handle = profileString(profile, ["handle", "display_name"]);
    if (handle && displayName && usernamesEqual(handle, displayName)) {
      return true;
    }
  }

  if (message.platform === "mastodon") {
    const profile = profileBlock(unifiedProfiles, "mastodon");
    const acct = profileString(profile, ["acct", "username", "id"]);
    if (acct && authorId && acct === authorId) {
      return true;
    }
    if (acct && displayName && usernamesEqual(acct, displayName)) {
      return true;
    }
  }

  return false;
}
