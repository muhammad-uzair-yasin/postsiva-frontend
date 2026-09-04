import { replaceUnifiedUserProfilesCache } from "@/lib/dashboard/channelProfileApi";

/** Dispatched when unified profile cache was merged (e.g. after per-platform refresh). */
export const UNIFIED_PROFILES_MERGED_EVENT = "postsiva:unified-profiles-merged";

export interface UnifiedProfilesMergedDetail {
  workspaceId: string;
  profiles: Record<string, unknown>;
  /** When set, auto-select the first account row matching this platform in the sidebar dropdown. */
  autoSelectPlatform?: string;
}

/**
 * After GET /unified/user-profiles?force_refresh=true&platforms=X, the body only
 * contains data for X; other keys are null. Merge into previous cache without
 * wiping other platforms.
 */
export function mergePartialUnifiedProfilesCache(
  previous: Record<string, unknown> | null,
  partial: Record<string, unknown>,
  refreshedPlatform: string,
): Record<string, unknown> {
  const next: Record<string, unknown> = previous ? { ...previous } : {};
  const slice = partial[refreshedPlatform];
  if (slice !== null && slice !== undefined) {
    next[refreshedPlatform] = slice;
  }
  if (partial.last_updated !== undefined) {
    next.last_updated = partial.last_updated;
  }
  if (partial.source !== undefined) {
    next.source = partial.source;
  }
  return next;
}

export function notifyUnifiedProfilesMerged(
  workspaceId: string,
  profiles: Record<string, unknown>,
  autoSelectPlatform?: string,
): void {
  replaceUnifiedUserProfilesCache(workspaceId, profiles);
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(
    new CustomEvent(UNIFIED_PROFILES_MERGED_EVENT, {
      detail: { workspaceId, profiles, autoSelectPlatform } satisfies UnifiedProfilesMergedDetail,
    }),
  );
}
