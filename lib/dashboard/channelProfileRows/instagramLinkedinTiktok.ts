import {
  asRecordArray,
  pickBool,
  pickNumber,
  pickString,
  truncate,
} from "../profilePick";
import type { ProfileFieldRow } from "./types";
import { pushProfileRow as pushRow } from "./types";

export function instagramRowsFromProfile(
  p: Record<string, unknown> | null,
): ProfileFieldRow[] {
  if (!p) {
    return [];
  }
  const rows: ProfileFieldRow[] = [];
  pushRow(rows, "Username", pickString(p, ["username"]));
  pushRow(rows, "Display name", pickString(p, ["name"]));
  pushRow(rows, "Account type", pickString(p, ["account_type"]));
  const fol = pickNumber(p, ["followers_count"]);
  if (fol !== null) {
    pushRow(rows, "Followers", fol.toLocaleString());
  }
  const fwg = pickNumber(p, ["follows_count"]);
  if (fwg !== null) {
    pushRow(rows, "Following", fwg.toLocaleString());
  }
  const media = pickNumber(p, ["media_count"]);
  if (media !== null) {
    pushRow(rows, "Posts", media.toLocaleString());
  }
  const bio = pickString(p, ["biography"]);
  if (bio) {
    pushRow(rows, "Bio", truncate(bio, 200));
  }
  pushRow(rows, "Website", pickString(p, ["website"]));
  return rows;
}

export function linkedinRowsFromParts(
  profile: Record<string, unknown> | null,
  orgs: unknown,
): ProfileFieldRow[] {
  const rows: ProfileFieldRow[] = [];
  if (profile) {
    pushRow(rows, "Name", pickString(profile, ["name"]));
    const given = pickString(profile, ["given_name"]);
    const family = pickString(profile, ["family_name"]);
    if (given || family) {
      pushRow(rows, "Name (parts)", [given, family].filter(Boolean).join(" "));
    }
    pushRow(rows, "Vanity", pickString(profile, ["vanity_name"]));
    pushRow(rows, "Profile", pickString(profile, ["profile_url"]));
  }
  const names = asRecordArray(orgs)
    .map((o) => pickString(o, ["name"]))
    .filter((n): n is string => Boolean(n));
  if (names.length > 0) {
    pushRow(rows, "Company pages", names.join(" · "));
  }
  return rows;
}

export function tiktokRowsFromProfile(
  p: Record<string, unknown> | null,
): ProfileFieldRow[] {
  if (!p) {
    return [];
  }
  const rows: ProfileFieldRow[] = [];
  pushRow(rows, "Display name", pickString(p, ["display_name"]));
  pushRow(rows, "Username", pickString(p, ["username"]));
  const bio = pickString(p, ["bio_description"]);
  if (bio) {
    pushRow(rows, "Bio", truncate(bio, 200));
  }
  const v = pickBool(p, ["is_verified"]);
  if (v !== null) {
    pushRow(rows, "Verified", v);
  }
  const fc = pickNumber(p, ["followers_count", "follower_count"]);
  if (fc !== null) {
    pushRow(rows, "Followers", fc.toLocaleString());
  }
  const fg = pickNumber(p, ["following_count"]);
  if (fg !== null) {
    pushRow(rows, "Following", fg.toLocaleString());
  }
  const likes = pickNumber(p, ["total_likes", "likes_count"]);
  if (likes !== null) {
    pushRow(rows, "Likes", likes.toLocaleString());
  }
  const vid = pickNumber(p, ["videos_count", "video_count"]);
  if (vid !== null) {
    pushRow(rows, "Videos", vid.toLocaleString());
  }
  pushRow(rows, "Open in app", pickString(p, ["profile_deep_link"]));
  return rows;
}

export function threadsRowsFromProfile(
  p: Record<string, unknown> | null,
): ProfileFieldRow[] {
  if (!p) {
    return [];
  }
  const rows: ProfileFieldRow[] = [];
  pushRow(rows, "Username", pickString(p, ["username"]));
  pushRow(rows, "Full name", pickString(p, ["full_name"]));
  const bio = pickString(p, ["biography"]);
  if (bio) {
    pushRow(rows, "Bio", truncate(bio, 200));
  }
  const fc = pickNumber(p, ["followers_count"]);
  if (fc !== null) {
    pushRow(rows, "Followers", fc.toLocaleString());
  }
  const fg = pickNumber(p, ["following_count"]);
  if (fg !== null) {
    pushRow(rows, "Following", fg.toLocaleString());
  }
  const pc = pickNumber(p, ["posts_count"]);
  if (pc !== null) {
    pushRow(rows, "Posts", pc.toLocaleString());
  }
  const v = pickBool(p, ["is_verified"]);
  if (v !== null) {
    pushRow(rows, "Verified", v);
  }
  pushRow(rows, "Website", pickString(p, ["website_url"]));
  pushRow(rows, "Joined", pickString(p, ["created_at"]));
  return rows;
}
