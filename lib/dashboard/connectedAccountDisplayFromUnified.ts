import type { DashboardConnectedChannel } from "@/lib/workspaces/dashboardConnectedChannels";

import { asRecord, asRecordArray, pickString } from "./profilePick";

function withAt(handle: string): string {
  const h = handle.trim();
  if (!h) {
    return "";
  }
  return h.startsWith("@") ? h : `@${h}`;
}

/** Prefer unified API snapshot for hover header + avatars; falls back to `channel` fields when data is missing. */
export function mergeConnectedChannelWithUnifiedSlice(
  channel: DashboardConnectedChannel,
  slice: unknown,
): DashboardConnectedChannel {
  // Dashboard entity cards (LinkedIn orgs / Facebook pages) already have
  // the correct title/subtitle/avatar computed from the unified payload.
  // We keep them stable and do not override with platform-level profile data.
  if (channel.key.includes(":")) {
    return channel;
  }
  if (slice === null || slice === undefined) {
    return channel;
  }
  const r = asRecord(slice);
  if (!r) {
    return channel;
  }

  switch (channel.platform) {
    case "linkedin": {
      const p = asRecord(r.profile);
      if (!p) {
        return channel;
      }
      const name =
        pickString(p, ["name"]) ||
        [pickString(p, ["given_name"]), pickString(p, ["family_name"])]
          .filter(Boolean)
          .join(" ")
          .trim();
      const orgs = asRecordArray(r.organizations);
      const subtitle =
        orgs.length <= 1 ? "LinkedIn" : `+${orgs.length} pages`;
      return {
        ...channel,
        title: name || channel.title,
        subtitle,
        avatarUrl: pickString(p, ["picture"]) || channel.avatarUrl,
      };
    }
    case "facebook": {
      const pages = asRecordArray(r.pages);
      const profile = asRecord(r.profile);
      const userPic = profile
        ? pickString(profile, ["profile_picture_url"])
        : "";
      if (pages.length > 0) {
        const first = pages[0];
        const firstName = pickString(first, ["page_name", "name"]);
        const extra = pages.length - 1;
        const subtitle =
          extra === 0
            ? "Facebook"
            : extra === 1
              ? "+1 more page"
              : `+${extra} more pages`;
        const pagePic = pickString(first, [
          "profile_picture_url",
          "picture",
        ]);
        return {
          ...channel,
          title: firstName || channel.title,
          subtitle,
          avatarUrl: pagePic || userPic || channel.avatarUrl,
        };
      }
      if (profile) {
        const fbName = pickString(profile, ["name"]);
        return {
          ...channel,
          title: fbName || channel.title,
          subtitle: "Facebook",
          avatarUrl: userPic || channel.avatarUrl,
        };
      }
      return channel;
    }
    case "youtube": {
      const ch = asRecord(r.channel_info) ?? asRecord(r.profile);
      if (!ch) {
        return channel;
      }
      const title = pickString(ch, ["title"]);
      const custom = pickString(ch, ["custom_url"]);
      const displayTitle =
        title ||
        (custom ? withAt(custom.replace(/^@/, "")) : "") ||
        channel.title;
      return {
        ...channel,
        title: displayTitle,
        subtitle: "YouTube",
        avatarUrl: pickString(ch, ["thumbnail_url"]) || channel.avatarUrl,
      };
    }
    case "tiktok": {
      const p = asRecord(r.profile) ?? r;
      const displayName = pickString(p, ["display_name"]);
      const tkUser = pickString(p, ["username"]);
      const t =
        displayName ||
        (tkUser ? withAt(tkUser.replace(/^@/, "")) : "") ||
        channel.title;
      const avatar = pickString(p, [
        "profile_image",
        "avatar_large_url",
        "avatar_url",
        "avatar_url_100",
      ]);
      return {
        ...channel,
        title: t,
        subtitle: "TikTok",
        avatarUrl: avatar || channel.avatarUrl,
      };
    }
    case "instagram": {
      const p = asRecord(r.profile) ?? r;
      const username = pickString(p, ["username"]);
      const name = pickString(p, ["name"]);
      const t =
        (username ? withAt(username.replace(/^@/, "")) : "") ||
        name ||
        channel.title;
      const accountType = pickString(p, ["account_type"]);
      return {
        ...channel,
        title: t,
        subtitle: accountType ? `Instagram · ${accountType}` : "Instagram",
        avatarUrl:
          pickString(p, ["profile_picture_url"]) || channel.avatarUrl,
      };
    }
    case "pinterest": {
      const p = asRecord(r.profile);
      if (!p) {
        return channel;
      }
      const username = pickString(p, ["username"]);
      const business = pickString(p, ["business_name"]);
      const t =
        business ||
        (username ? withAt(username.replace(/^@/, "")) : "") ||
        channel.title;
      return {
        ...channel,
        title: t,
        subtitle: "Pinterest",
        avatarUrl: pickString(p, ["profile_image"]) || channel.avatarUrl,
      };
    }
    case "threads": {
      const p = asRecord(r.profile) ?? r;
      const username = pickString(p, ["username"]);
      const full = pickString(p, ["full_name"]);
      return {
        ...channel,
        title:
          full ||
          (username ? withAt(username.replace(/^@/, "")) : "") ||
          channel.title,
        subtitle: "Threads",
        avatarUrl:
          pickString(p, ["profile_picture_url"]) || channel.avatarUrl,
      };
    }
    case "bluesky": {
      const p = asRecord(r.profile) ?? r;
      const handle = pickString(p, ["handle", "username", "did"]);
      const display = pickString(p, ["display_name", "displayName", "name"]);
      return {
        ...channel,
        title:
          display ||
          (handle ? withAt(handle.replace(/^@/, "")) : "") ||
          channel.title,
        subtitle: "Bluesky",
        avatarUrl:
          pickString(p, ["avatar", "avatar_url", "profile_picture_url"]) ||
          channel.avatarUrl,
      };
    }
    case "mastodon": {
      const p = asRecord(r.profile) ?? r;
      const acct = pickString(p, ["acct", "username"]);
      const display = pickString(p, ["display_name", "name"]);
      return {
        ...channel,
        title:
          display ||
          (acct ? withAt(acct.replace(/^@/, "")) : "") ||
          channel.title,
        subtitle: "Mastodon",
        avatarUrl:
          pickString(p, ["avatar", "avatar_url", "profile_picture_url"]) ||
          channel.avatarUrl,
      };
    }
    default:
      return channel;
  }
}
