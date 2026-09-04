import type { UnifiedCommentsResponseJson } from "@/lib/inbox/unifiedCommentsTypes";
import { accountIdToOAuthPlatform } from "@/lib/workspace/accountIdToOAuthPlatform";

/**
 * Keep only platform slices that match the workspace header account selection so the
 * inbox never shows comments from other platforms if the API payload includes extras.
 */
export function filterUnifiedCommentsResponseForSelectedAccounts(
  data: UnifiedCommentsResponseJson,
  selectedAccountIds: readonly string[],
): UnifiedCommentsResponseJson {
  const allowed = new Set<string>();
  for (const id of selectedAccountIds) {
    const p = accountIdToOAuthPlatform(id);
    if (p) {
      allowed.add(p);
    }
  }

  const base: UnifiedCommentsResponseJson = {
    success: data.success,
    message: data.message,
    classification_status: data.classification_status,
    linkedin: null,
    facebook: null,
    instagram: null,
    youtube: null,
    threads: null,
    tiktok: null,
    bluesky: null,
    mastodon: null,
    wordpress: null,
  };

  if (allowed.size === 0) {
    return base;
  }

  if (allowed.has("linkedin")) {
    base.linkedin = data.linkedin ?? null;
  }
  if (allowed.has("facebook")) {
    base.facebook = data.facebook ?? null;
  }
  if (allowed.has("instagram")) {
    base.instagram = data.instagram ?? null;
  }
  if (allowed.has("youtube")) {
    base.youtube = data.youtube ?? null;
  }
  if (allowed.has("threads")) {
    base.threads = data.threads ?? null;
  }
  if (allowed.has("tiktok")) {
    base.tiktok = data.tiktok ?? null;
  }
  if (allowed.has("bluesky")) {
    base.bluesky = data.bluesky ?? null;
  }
  if (allowed.has("mastodon")) {
    base.mastodon = data.mastodon ?? null;
  }
  if (allowed.has("wordpress")) {
    base.wordpress = data.wordpress ?? null;
  }

  return base;
}
