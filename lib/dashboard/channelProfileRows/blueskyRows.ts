import { pickNumber, pickString, truncate } from "../profilePick";
import type { ProfileFieldRow } from "./types";
import { pushProfileRow as pushRow } from "./types";

/** Unified `/unified/user-profiles` bluesky slice uses `profile` from backend (snake_case). */
export function blueskyRowsFromProfile(
  p: Record<string, unknown> | null,
): ProfileFieldRow[] {
  if (!p) {
    return [];
  }
  const rows: ProfileFieldRow[] = [];
  pushRow(rows, "Handle", pickString(p, ["handle", "username"]));
  pushRow(rows, "Display name", pickString(p, ["display_name", "displayName", "name"]));
  const bio = pickString(p, ["description", "bio", "biography"]);
  if (bio) {
    pushRow(rows, "Bio", truncate(bio, 200));
  }
  const followers = pickNumber(p, ["followers_count", "followersCount"]);
  if (followers !== null) {
    pushRow(rows, "Followers", followers.toLocaleString());
  }
  const follows = pickNumber(p, ["follows_count", "followsCount"]);
  if (follows !== null) {
    pushRow(rows, "Following", follows.toLocaleString());
  }
  const posts = pickNumber(p, ["posts_count", "postsCount", "media_count"]);
  if (posts !== null) {
    pushRow(rows, "Posts", posts.toLocaleString());
  }
  pushRow(rows, "Avatar", pickString(p, ["avatar", "avatar_url", "profile_picture_url"]));
  pushRow(rows, "Banner", pickString(p, ["banner", "banner_url"]));
  return rows;
}
