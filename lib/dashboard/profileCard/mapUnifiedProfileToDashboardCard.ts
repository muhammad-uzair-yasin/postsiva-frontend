import type { WorkspaceHeaderAccountRow } from "@/lib/workspace/headerAccountsTypes";
import { isWorkspaceHeaderAllPlatformsId } from "@/lib/workspace/workspaceHeaderAllPlatforms";

import type { DashboardProfileCardView } from "./dashboardProfileCardTypes";
import { mapBlueskyUnifiedToProfileCard } from "./mapBlueskyProfileCard";
import {
  mapFacebookPageRowToProfileCard,
  mapFacebookPersonalToProfileCard,
} from "./mapFacebookProfileCard";
import { mapInstagramUnifiedToProfileCard } from "./mapInstagramProfileCard";
import {
  mapLinkedInOrgRowToProfileCard,
  mapLinkedInPersonalToProfileCard,
} from "./mapLinkedInProfileCard";
import {
  mapPinterestBoardRowToProfileCard,
  mapPinterestProfileUnifiedToProfileCard,
} from "./mapPinterestProfileCard";
import { mapMastodonUnifiedToProfileCard } from "./mapMastodonProfileCard";
import { mapThreadsUnifiedToProfileCard } from "./mapThreadsProfileCard";
import { mapTikTokUnifiedToProfileCard } from "./mapTikTokProfileCard";
import { mapWordPressConnectionToProfileCard } from "./mapWordPressProfileCard";
import { mapYouTubeUnifiedToProfileCard } from "./mapYouTubeProfileCard";

/**
 * Routes unified `/unified/user-profiles/` JSON + selected header row → profile card view.
 * Add platform mappers here as they are implemented.
 */
export function mapUnifiedProfileToDashboardCard(
  unified: Record<string, unknown> | null,
  selected: WorkspaceHeaderAccountRow | null,
): DashboardProfileCardView | null {
  if (!unified || !selected) {
    return null;
  }

  if (isWorkspaceHeaderAllPlatformsId(selected.id)) {
    return {
      platformLabel: "Workspace",
      primaryLine: "All platforms",
      secondaryLine: "Combined view of every connected channel",
      avatarUrl: null,
      stats: [
        { label: "scope", value: "All" },
        { label: "networks", value: "Connected" },
        { label: "view", value: "Unified" },
      ],
      bio: "Dashboard metrics and recent posts combine data from all accounts linked to this workspace.",
      visitUrl: null,
      showVerifiedBadge: false,
    };
  }

  if (selected.iconId === "linkedin") {
    const li = unified.linkedin;
    if (selected.id === "linkedin") {
      return mapLinkedInPersonalToProfileCard(li);
    }
    if (selected.id.startsWith("linkedin:org:")) {
      return mapLinkedInOrgRowToProfileCard(li, selected.id);
    }
  }

  if (selected.iconId === "instagram" && selected.id === "instagram") {
    return mapInstagramUnifiedToProfileCard(unified.instagram);
  }

  if (selected.iconId === "tiktok" && selected.id === "tiktok") {
    return mapTikTokUnifiedToProfileCard(unified.tiktok);
  }

  if (selected.iconId === "pinterest") {
    const pin = unified.pinterest;
    if (selected.id === "pinterest") {
      return mapPinterestProfileUnifiedToProfileCard(pin);
    }
    if (selected.id.startsWith("pinterest:board:")) {
      return mapPinterestBoardRowToProfileCard(pin, selected.id);
    }
  }

  if (selected.iconId === "youtube" && selected.id.startsWith("youtube")) {
    const youtubeBlock = unified.youtube;
    if (
      selected.id.startsWith("youtube:") &&
      youtubeBlock &&
      typeof youtubeBlock === "object" &&
      Array.isArray((youtubeBlock as { connections?: unknown }).connections)
    ) {
      const channelId = selected.id.slice("youtube:".length);
      const connection = (
        (youtubeBlock as { connections: unknown[] }).connections
      ).find(
        (value) =>
          value !== null &&
          typeof value === "object" &&
          (value as { channel_id?: unknown }).channel_id === channelId,
      );
      if (connection) {
        return mapYouTubeUnifiedToProfileCard({ channel_info: connection });
      }
    }
    return mapYouTubeUnifiedToProfileCard(youtubeBlock);
  }

  if (selected.iconId === "facebook") {
    const fb = unified.facebook;
    if (selected.id === "facebook") {
      return mapFacebookPersonalToProfileCard(fb);
    }
    if (selected.id.startsWith("facebook:page:")) {
      return mapFacebookPageRowToProfileCard(fb, selected.id);
    }
  }

  if (selected.iconId === "threads" && selected.id === "threads") {
    return mapThreadsUnifiedToProfileCard(unified.threads);
  }

  if (selected.iconId === "bluesky" && selected.id === "bluesky") {
    return mapBlueskyUnifiedToProfileCard(unified.bluesky);
  }

  if (selected.iconId === "mastodon" && selected.id === "mastodon") {
    return mapMastodonUnifiedToProfileCard(unified.mastodon);
  }

  if (selected.iconId === "wordpress" && selected.id.startsWith("wordpress:")) {
    return mapWordPressConnectionToProfileCard(unified.wordpress, selected.id);
  }

  return null;
}
