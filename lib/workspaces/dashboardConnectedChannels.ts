import type { AuthWorkspaceLoginItem } from "@/lib/auth/types";
import type { SocialPlatformIconId } from "@/lib/social/socialPlatformIconSrc";

export interface DashboardConnectedChannel {
  key: string;
  platform: SocialPlatformIconId;
  title: string;
  subtitle: string;
  avatarUrl: string | null;
}

function pickString(obj: unknown, keys: string[]): string {
  if (!obj || typeof obj !== "object") {
    return "";
  }
  const o = obj as Record<string, unknown>;
  for (const key of keys) {
    const v = o[key];
    if (typeof v === "string" && v.trim()) {
      return v.trim();
    }
  }
  return "";
}

function withAt(handle: string): string {
  const h = handle.trim();
  if (!h) {
    return "";
  }
  return h.startsWith("@") ? h : `@${h}`;
}

function asRecordArray(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(
    (item): item is Record<string, unknown> =>
      item !== null && typeof item === "object",
  );
}

export function getStoredActiveWorkspaceFromList(
  workspaces: AuthWorkspaceLoginItem[],
  activeId: string | null,
): AuthWorkspaceLoginItem | null {
  if (workspaces.length === 0) {
    return null;
  }
  if (activeId) {
    const match = workspaces.find((w) => w.id === activeId);
    if (match) {
      return match;
    }
  }
  return workspaces[0] ?? null;
}

/**
 * Maps login/refresh workspace payload into dashboard channel cards.
 * Pinterest only exposes a connection flag (no profile in API yet).
 * X/Twitter is omitted in the product UI.
 */
export function dashboardConnectedChannelsFromWorkspace(
  ws: AuthWorkspaceLoginItem,
): DashboardConnectedChannel[] {
  const rows: DashboardConnectedChannel[] = [];

  if (ws.instagram_connected) {
    const ig = ws.instagram_profile;
    const username = pickString(ig, ["username"]);
    const name = pickString(ig, ["name"]);
    const title =
      (username ? withAt(username) : "") || name || "Instagram account";
    const accountType = pickString(ig, ["account_type"]);
    rows.push({
      key: "instagram",
      platform: "instagram",
      title,
      subtitle: accountType ? `Instagram · ${accountType}` : "Instagram",
      avatarUrl: pickString(ig, ["profile_picture_url"]) || null,
    });
  }

  if (ws.linkedin_connected) {
    const li = ws.linkedin_profile;
    const orgs = asRecordArray(ws.linkedin_organizations);
    const pageCount = orgs.length;

    const fullName = pickString(li, ["name"]);
    const given = pickString(li, ["given_name"]);
    const family = pickString(li, ["family_name"]);
    const composed =
      fullName ||
      [given, family].filter(Boolean).join(" ").trim() ||
      "";
    const vanity = pickString(li, ["vanity_name"]);
    const baseName =
      composed || (vanity ? withAt(vanity) : "") || "LinkedIn account";

    const subtitle =
      pageCount <= 1
        ? "LinkedIn"
        : `+${pageCount} pages`;

    rows.push({
      key: "linkedin",
      platform: "linkedin",
      title: baseName,
      subtitle,
      avatarUrl: pickString(li, ["picture"]) || null,
    });
  }

  if (ws.tiktok_connected) {
    const tk = ws.tiktok_profile;
    const displayName = pickString(tk, ["display_name"]);
    const tkUser = pickString(tk, ["username"]);
    const title =
      displayName || (tkUser ? withAt(tkUser) : "") || "TikTok account";
    rows.push({
      key: "tiktok",
      platform: "tiktok",
      title,
      subtitle: "TikTok",
      avatarUrl:
        pickString(tk, [
          "profile_image",
          "avatar_large_url",
          "avatar_url",
          "avatar_url_100",
        ]) || null,
    });
  }

  if (ws.facebook_connected) {
    const pages = asRecordArray(ws.facebook_pages);
    if (pages.length > 0) {
      const first = pages[0];
      const firstId = first ? pickString(first, ["page_id", "id"]) : "";
      const firstName = first
        ? pickString(first, ["page_name", "name"])
        : "";
      const extra = pages.length - 1;
      const firstTitle =
        firstName || (firstId ? `Page ${firstId}` : "Facebook page");
      const subtitle =
        extra === 0
          ? "Facebook"
          : extra === 1
            ? "+1 more page"
            : `+${extra} more pages`;
      const pageProfilePic = first
        ? pickString(first, ["profile_picture_url"])
        : "";
      const userProfilePic = pickString(ws.facebook_profile, [
        "profile_picture_url",
      ]);
      rows.push({
        key: "facebook-pages",
        platform: "facebook",
        title: firstTitle,
        subtitle,
        avatarUrl: pageProfilePic || userProfilePic || null,
      });
    } else {
      const fb = ws.facebook_profile;
      const fbName = pickString(fb, ["name"]);
      const fbPic = pickString(fb, ["profile_picture_url"]);
      if (fbName || fbPic) {
        rows.push({
          key: "facebook-profile",
          platform: "facebook",
          title: fbName || "Facebook account",
          subtitle: "Facebook",
          avatarUrl: fbPic || null,
        });
      } else {
        rows.push({
          key: "facebook",
          platform: "facebook",
          title: "Facebook account",
          subtitle: "Facebook",
          avatarUrl: null,
        });
      }
    }
  }

  if (ws.youtube_connected) {
    const yt = ws.youtube_profile;
    const channelTitle = pickString(yt, ["title"]);
    const custom = pickString(yt, ["custom_url"]);
    const title =
      channelTitle ||
      (custom ? withAt(custom.replace(/^@/, "")) : "") ||
      "YouTube channel";
    rows.push({
      key: "youtube",
      platform: "youtube",
      title,
      subtitle: "YouTube",
      avatarUrl: pickString(yt, ["thumbnail_url"]) || null,
    });
  }

  if (ws.pinterest_connected) {
    rows.push({
      key: "pinterest",
      platform: "pinterest",
      title: "Pinterest account",
      subtitle: "Pinterest",
      avatarUrl: null,
    });
  }

  if (ws.threads_connected) {
    const th = ws.threads_profile;
    const username = pickString(th, ["username"]);
    const fullName = pickString(th, ["full_name"]);
    const title =
      fullName ||
      (username ? withAt(username.replace(/^@/, "")) : "") ||
      "Threads account";
    rows.push({
      key: "threads",
      platform: "threads",
      title,
      subtitle: "Threads",
      avatarUrl: pickString(th, ["profile_picture_url"]) || null,
    });
  }

  if (ws.blue_sky_connected) {
    const bs = ws.blue_sky_profile;
    const handle = pickString(bs, ["handle", "username"]);
    const displayName = pickString(bs, ["display_name", "name"]);
    const title =
      displayName ||
      (handle ? withAt(handle.replace(/^@/, "")) : "") ||
      "Bluesky account";
    rows.push({
      key: "bluesky",
      platform: "bluesky",
      title,
      subtitle: "Bluesky",
      avatarUrl: pickString(bs, ["avatar", "profile_picture_url"]) || null,
    });
  }

  if (ws.mastodon_connected) {
    const mastodon = ws.mastodon_profile;
    const acct = pickString(mastodon, ["acct", "username"]);
    const displayName = pickString(mastodon, ["display_name", "name"]);
    const title =
      displayName ||
      (acct ? withAt(acct.replace(/^@/, "")) : "") ||
      "Mastodon account";
    rows.push({
      key: "mastodon",
      platform: "mastodon",
      title,
      subtitle: "Mastodon",
      avatarUrl: pickString(mastodon, ["avatar", "profile_picture_url"]) || null,
    });
  }

  return rows;
}

/** Query param for DELETE /unified/oauth/token (unified OAuth). */
export function oauthPlatformForDashboardRow(
  row: DashboardConnectedChannel,
): string {
  if (row.key.startsWith("linkedin:")) {
    return "linkedin";
  }
  if (row.key.startsWith("facebook:")) {
    return "facebook";
  }
  if (
    row.key === "facebook" ||
    row.key === "facebook-pages" ||
    row.key === "facebook-profile"
  ) {
    return "facebook";
  }
  return row.key;
}

export interface WorkspaceCardChannelRow {
  platform: SocialPlatformIconId;
  label: string;
  /** Same names as backend unified OAuth: linkedin, instagram, facebook, … */
  oauthPlatform: string;
}

/** Compact rows for workspace selection cards (same source as dashboard). */
export function workspaceStitchChannelsFromWorkspace(
  ws: AuthWorkspaceLoginItem,
): WorkspaceCardChannelRow[] {
  return dashboardConnectedChannelsFromWorkspace(ws).map((row) => {
    const fbMorePages =
      row.key === "facebook-pages" && row.subtitle !== "Facebook";
    const linkedInPages =
      row.key === "linkedin" && row.subtitle !== "LinkedIn";
    const combineLabel = fbMorePages || linkedInPages;
    return {
      platform: row.platform,
      label: combineLabel ? `${row.title} · ${row.subtitle}` : row.title,
      oauthPlatform: oauthPlatformForDashboardRow(row),
    };
  });
}
