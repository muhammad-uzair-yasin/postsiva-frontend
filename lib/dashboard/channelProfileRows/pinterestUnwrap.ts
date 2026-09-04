import { asRecord, asRecordArray, pickNumber, pickString, truncate } from "../profilePick";
import type { ProfileFieldRow } from "./types";
import { pushProfileRow as pushRow } from "./types";

export function pinterestRowsFromLive(
  slice: Record<string, unknown> | null,
): ProfileFieldRow[] {
  if (!slice) {
    return [];
  }
  const rows: ProfileFieldRow[] = [];
  const profile = asRecord(slice.profile);
  if (profile) {
    pushRow(rows, "Pinterest user ID", pickString(profile, ["pinterest_user_id"]));
    pushRow(rows, "Username", pickString(profile, ["username"]));
    pushRow(
      rows,
      "Business name",
      pickString(profile, ["business_name", "full_name", "name"]),
    );
    pushRow(rows, "Account type", pickString(profile, ["account_type"]));
    pushRow(rows, "Website", pickString(profile, ["website_url"]));
    const bio = pickString(profile, ["about", "bio"]);
    if (bio) {
      pushRow(rows, "About", truncate(bio, 200));
    }
    const bc = pickNumber(profile, ["board_count"]);
    if (bc !== null) {
      pushRow(rows, "Board count", bc.toLocaleString());
    }
    const pc = pickNumber(profile, ["pin_count"]);
    if (pc !== null) {
      pushRow(rows, "Pin count", pc.toLocaleString());
    }
    const fc = pickNumber(profile, ["follower_count", "followers_count"]);
    if (fc !== null) {
      pushRow(rows, "Followers", fc.toLocaleString());
    }
    const fg = pickNumber(profile, ["following_count"]);
    if (fg !== null) {
      pushRow(rows, "Following", fg.toLocaleString());
    }
    const mv = pickNumber(profile, ["monthly_views"]);
    if (mv !== null) {
      pushRow(rows, "Monthly views", mv.toLocaleString());
    }
    const img = pickString(profile, ["profile_image", "profile_picture_url"]);
    if (img) {
      pushRow(rows, "Profile image", "Linked");
    }
  }
  const boards = asRecordArray(slice.boards);
  for (let i = 0; i < boards.length; i += 1) {
    const b = boards[i];
    const bid = pickString(b, ["board_id", "id"]);
    const bn = pickString(b, ["name", "title"]);
    pushRow(
      rows,
      `Board ${i + 1}`,
      [bn, bid].filter(Boolean).join(" · ") || `Board ${i + 1}`,
    );
  }
  return rows;
}

export function unwrapProfile(
  slice: Record<string, unknown> | null,
): Record<string, unknown> | null {
  if (!slice) {
    return null;
  }
  const inner = asRecord(slice.profile);
  return inner ?? slice;
}
