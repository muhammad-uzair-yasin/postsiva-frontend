import type { AuthWorkspaceLoginItem } from "@/lib/auth/types";

/** Maps dashboard card `key` to data stored on the workspace login/refresh payload. */
export function workspaceChannelProfileSnapshot(
  ws: AuthWorkspaceLoginItem,
  cardKey: string,
): unknown {
  const baseKey =
    cardKey.startsWith("linkedin:") ? "linkedin" : cardKey.startsWith("facebook:") ? "facebook" : cardKey;
  switch (baseKey) {
    case "instagram":
      return ws.instagram_profile ?? null;
    case "linkedin":
      return {
        profile: ws.linkedin_profile ?? null,
        organizations: ws.linkedin_organizations ?? null,
      };
    case "tiktok":
      return ws.tiktok_profile ?? null;
    case "youtube":
      return {
        profile: ws.youtube_profile ?? null,
        playlists: ws.youtube_playlists ?? null,
      };
    case "pinterest":
      return {
        connected: ws.pinterest_connected,
        note:
          "Full Pinterest profile loads after refresh from the unified profiles API.",
      };
    case "threads":
      return { profile: ws.threads_profile ?? null };
    case "facebook":
    case "facebook-profile":
    case "facebook-pages":
      return {
        profile: ws.facebook_profile ?? null,
        pages: ws.facebook_pages ?? null,
      };
    default:
      return null;
  }
}

import { decodeCompositeEntitySegment } from "@/lib/workspace/decodeCompositeAccountIds";

export type ProfileRefreshTarget = {
  kind: "unified";
  platform: string;
  facebookPageId?: string;
};

/** Which backend refresh path to use for a dashboard channel card key. */
export function profileRefreshTargetForChannelKey(
  key: string,
): ProfileRefreshTarget | null {
  if (key.startsWith("linkedin:")) {
    return { kind: "unified", platform: "linkedin" };
  }
  if (key.startsWith("facebook:page:")) {
    const stable = key.slice("facebook:page:".length);
    const facebookPageId = decodeCompositeEntitySegment(stable);
    return { kind: "unified", platform: "facebook", facebookPageId };
  }
  if (key.startsWith("facebook:")) {
    return { kind: "unified", platform: "facebook" };
  }
  if (key === "facebook" || key === "facebook-pages" || key === "facebook-profile") {
    return { kind: "unified", platform: "facebook" };
  }
  const unified = [
    "instagram",
    "linkedin",
    "tiktok",
    "youtube",
    "pinterest",
    "threads",
    "bluesky",
    "mastodon",
  ];
  if (unified.includes(key)) {
    return { kind: "unified", platform: key };
  }
  return null;
}

export function unifiedResponseSlice(
  full: Record<string, unknown>,
  platform: string,
): unknown {
  const v = full[platform];
  return v !== undefined ? v : full;
}
