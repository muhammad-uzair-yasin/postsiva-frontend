import type { SocialOAuthTokenStatusMap } from "@/lib/social/unifiedOAuthApi";

/**
 * Maps modal card id (`AdPlatformItem.id`) to unified OAuth API platform name
 * (GET/DELETE `/unified/oauth/token`). Unknown ids return `null`.
 */
export function getAdPlatformOAuthApiKey(adPlatformId: string): string | null {
  switch (adPlatformId) {
    case "instagram":
      return "instagram";
    case "linkedin":
      return "linkedin";
    case "tiktok":
      return "tiktok";
    case "youtube":
      return "youtube";
    case "facebook":
      return "facebook";
    case "pinterest":
      return "pinterest";
    case "threads":
      return "threads";
    case "bluesky":
      return "bluesky";
    case "mastodon":
      return "mastodon";
    case "wordpress":
      return "wordpress";
    default:
      return null;
  }
}

/** True when `GET /unified/oauth/token` reports `success: true` for that platform. */
export function isAdPlatformConnectedFromOAuthStatus(
  status: SocialOAuthTokenStatusMap | null,
  adPlatformId: string,
): boolean {
  if (!status) {
    return false;
  }
  const key = getAdPlatformOAuthApiKey(adPlatformId);
  if (key === null) {
    return false;
  }
  return status[key as keyof SocialOAuthTokenStatusMap] === true;
}
