import type { SocialPlatformIconId } from "@/lib/social/socialPlatformIconSrc";

import type { WorkspaceHeaderAccountRow } from "./headerAccountsTypes";
import {
  buildFacebookHeaderAccountRows,
  buildLinkedInHeaderAccountRows,
} from "./linkedinFacebookHeaderAccountRows";
import { buildPinterestHeaderAccountRows } from "./pinterestHeaderAccountRows";

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object";
}

function nonEmptyString(v: unknown): string | null {
  if (typeof v !== "string") {
    return null;
  }
  const t = v.trim();
  return t.length > 0 ? t : null;
}

function singleRow(
  id: string,
  iconId: SocialPlatformIconId,
  label: string,
  hint: string,
  avatarUrl?: string,
): WorkspaceHeaderAccountRow {
  return { id, iconId, label, hint, avatarUrl };
}

function profileAvatar(profile: Record<string, unknown>): string | undefined {
  return (
    nonEmptyString(profile.profile_picture_url) ??
    nonEmptyString(profile.avatar_url) ??
    nonEmptyString(profile.avatar) ??
    nonEmptyString(profile.picture) ??
    nonEmptyString(profile.image_url) ??
    undefined
  );
}

function youtubeRows(block: unknown): WorkspaceHeaderAccountRow[] {
  if (!isRecord(block)) {
    return [];
  }
  const rawConnections = Array.isArray(block.connections)
    ? block.connections
    : [];
  const rows = rawConnections.flatMap((value): WorkspaceHeaderAccountRow[] => {
    if (!isRecord(value)) return [];
    const channelId = nonEmptyString(value.channel_id);
    if (!channelId) return [];
    const label =
      nonEmptyString(value.title) ??
      nonEmptyString(value.custom_url) ??
      "YouTube";
    return [{
      id: `youtube:${channelId}`,
      iconId: "youtube",
      label,
      hint: value.is_default === true ? "YouTube · Default" : "YouTube",
      avatarUrl: nonEmptyString(value.thumbnail_url) ?? undefined,
      targetResourceId: channelId,
    }];
  });
  if (rows.length > 0) {
    return rows;
  }
  const ch = block.channel_info;
  if (!isRecord(ch)) return [];
  const label =
    nonEmptyString(ch.title) ??
    nonEmptyString(ch.custom_url) ??
    "YouTube";
  const thumbnails = isRecord(ch.thumbnails) ? ch.thumbnails : null;
  const high = thumbnails && isRecord(thumbnails.high) ? thumbnails.high : null;
  const avatar = high ? nonEmptyString(high.url) ?? undefined : undefined;
  const channelId = nonEmptyString(ch.channel_id);
  return [
    {
      ...singleRow(
        channelId ? `youtube:${channelId}` : "youtube",
        "youtube",
        label,
        "YouTube",
        avatar,
      ),
      targetResourceId: channelId,
    },
  ];
}

function tiktokRows(block: unknown): WorkspaceHeaderAccountRow[] {
  if (!isRecord(block)) {
    return [];
  }
  const profile = block.profile;
  if (!isRecord(profile)) {
    return [];
  }
  const label =
    nonEmptyString(profile.display_name) ??
    (nonEmptyString(profile.username)
      ? `@${String(profile.username).replace(/^@/, "")}`
      : null) ??
    "TikTok";
  return [singleRow("tiktok", "tiktok", label, "TikTok", profileAvatar(profile))];
}

function instagramRows(block: unknown): WorkspaceHeaderAccountRow[] {
  if (!isRecord(block)) {
    return [];
  }
  const profile = block.profile;
  if (!isRecord(profile)) {
    return [];
  }
  const u = nonEmptyString(profile.username);
  const label = u
    ? u.startsWith("@")
      ? u
      : `@${u}`
    : (nonEmptyString(profile.name) ?? "Instagram");
  return [
    singleRow(
      "instagram",
      "instagram",
      label,
      "Instagram",
      profileAvatar(profile),
    ),
  ];
}

function threadsRows(block: unknown): WorkspaceHeaderAccountRow[] {
  if (!isRecord(block)) {
    return [];
  }
  const profile = block.profile;
  if (!isRecord(profile)) {
    return [];
  }
  const rawU = nonEmptyString(profile.username);
  const handle = rawU ? (rawU.startsWith("@") ? rawU : `@${rawU}`) : null;
  const label =
    nonEmptyString(profile.full_name) ?? handle ?? "Threads";
  return [singleRow("threads", "threads", label, "Threads", profileAvatar(profile))];
}

function blueskyRows(block: unknown): WorkspaceHeaderAccountRow[] {
  if (!isRecord(block)) {
    return [];
  }
  const profile = block.profile;
  if (!isRecord(profile)) {
    return [];
  }
  const ext = profile as { display_name?: unknown; handle?: unknown };
  const label =
    nonEmptyString(ext.display_name) ??
    nonEmptyString(ext.handle) ??
    "Bluesky";
  return [singleRow("bluesky", "bluesky", label, "Bluesky", profileAvatar(profile))];
}

function mastodonRows(block: unknown): WorkspaceHeaderAccountRow[] {
  if (!isRecord(block)) {
    return [];
  }
  const profile = block.profile;
  if (!isRecord(profile)) {
    return [];
  }
  const acct = nonEmptyString(profile.acct) ?? nonEmptyString(profile.username);
  const label =
    nonEmptyString(profile.display_name) ??
    (acct ? `@${acct.replace(/^@/, "")}` : null) ??
    "Mastodon";
  return [
    singleRow(
      "mastodon",
      "mastodon",
      label,
      "Mastodon",
      profileAvatar(profile),
    ),
  ];
}

function wordpressRows(block: unknown): WorkspaceHeaderAccountRow[] {
  if (!isRecord(block)) {
    return [];
  }
  const accounts = Array.isArray(block.accounts) ? block.accounts : [];
  return accounts.flatMap((value): WorkspaceHeaderAccountRow[] => {
    if (!isRecord(value)) return [];
    const id = nonEmptyString(value.id);
    if (!id) return [];
    const siteUrl = nonEmptyString(value.site_url);
    const profile = isRecord(value.profile) ? value.profile : null;
    const avatars = profile && isRecord(profile.avatar_urls) ? profile.avatar_urls : null;
    const label =
      nonEmptyString(value.site_name) ??
      siteUrl ??
      "WordPress";
    const username =
      nonEmptyString(profile?.display_name) ??
      nonEmptyString(value.username);
    return [{
      id: `wordpress:${id}`,
      iconId: "wordpress",
      label,
      hint: username ? `WordPress · ${username}` : "WordPress",
      avatarUrl:
        (avatars ? nonEmptyString(avatars["96"]) : null) ??
        (avatars ? nonEmptyString(avatars["48"]) : null) ??
        (avatars ? nonEmptyString(avatars["24"]) : null) ??
        undefined,
      targetResourceId: id,
    }];
  });
}

const ORDER = [
  "linkedin",
  "facebook",
  "youtube",
  "pinterest",
  "tiktok",
  "instagram",
  "threads",
  "bluesky",
  "mastodon",
  "wordpress",
] as const;

/**
 * Maps GET /unified/user-profiles/ JSON into header dropdown rows (icons + usernames;
 * LinkedIn orgs + Facebook pages expanded like the mobile app).
 */
export function unifiedProfilesToHeaderAccounts(
  raw: Record<string, unknown> | null,
): WorkspaceHeaderAccountRow[] {
  if (!raw) {
    return [];
  }
  const out: WorkspaceHeaderAccountRow[] = [];
  for (const key of ORDER) {
    const block = raw[key];
    if (block === null || block === undefined) {
      continue;
    }
    switch (key) {
      case "linkedin":
        out.push(...buildLinkedInHeaderAccountRows(block));
        break;
      case "facebook":
        out.push(...buildFacebookHeaderAccountRows(block));
        break;
      case "youtube":
        out.push(...youtubeRows(block));
        break;
      case "tiktok":
        out.push(...tiktokRows(block));
        break;
      case "instagram":
        out.push(...instagramRows(block));
        break;
      case "pinterest":
        out.push(...buildPinterestHeaderAccountRows(block));
        break;
      case "threads":
        out.push(...threadsRows(block));
        break;
      case "bluesky":
        out.push(...blueskyRows(block));
        break;
      case "mastodon":
        out.push(...mastodonRows(block));
        break;
      case "wordpress":
        out.push(...wordpressRows(block));
        break;
      default:
        break;
    }
  }
  return out;
}
