import type { DashboardConnectedChannel } from "@/lib/workspaces/dashboardConnectedChannels";

import { mergeConnectedChannelWithUnifiedSlice } from "./connectedAccountDisplayFromUnified";

/** Backend unified profiles payload is keyed by OAuth platform name. */
export function unifiedPlatformKeyForDashboardChannel(
  cardKey: string,
): string | null {
  if (
    cardKey === "facebook" ||
    cardKey === "facebook-pages" ||
    cardKey === "facebook-profile"
  ) {
    return "facebook";
  }
  if (cardKey.startsWith("linkedin:")) {
    return "linkedin";
  }
  if (cardKey.startsWith("facebook:")) {
    return "facebook";
  }
  return cardKey;
}

/** Slice for this dashboard row from GET /unified/user-profiles (may be `null` if not connected). */
export function getUnifiedProfileSlice(
  fullResponse: Record<string, unknown> | null,
  cardKey: string,
): unknown {
  if (!fullResponse) {
    return undefined;
  }
  const platform = unifiedPlatformKeyForDashboardChannel(cardKey);
  if (!platform) {
    return undefined;
  }
  return fullResponse[platform];
}

/**
 * Overlays titles, subtitles, and avatars from GET /unified/user-profiles onto
 * dashboard rows.
 */
export function mergeDashboardChannelsWithUnifiedResponse(
  channels: readonly DashboardConnectedChannel[],
  unified: Record<string, unknown> | null,
): DashboardConnectedChannel[] {
  if (!unified) {
    return [...channels];
  }
  return channels.map((ch) => {
    const slice = getUnifiedProfileSlice(unified, ch.key);
    return mergeConnectedChannelWithUnifiedSlice(ch, slice);
  });
}
