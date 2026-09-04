import {
  asRecordArray,
  pickNumber,
  pickString,
  truncate,
} from "../profilePick";
import type { ProfileFieldRow } from "./types";
import { pushProfileRow as pushRow } from "./types";

export function youtubeRowsFromChannel(
  ch: Record<string, unknown> | null,
): ProfileFieldRow[] {
  if (!ch) {
    return [];
  }
  const rows: ProfileFieldRow[] = [];
  pushRow(rows, "Channel", pickString(ch, ["title"]));
  pushRow(rows, "Handle / URL", pickString(ch, ["custom_url"]));
  const sub = pickNumber(ch, ["subscriber_count"]);
  if (sub !== null) {
    pushRow(rows, "Subscribers", sub.toLocaleString());
  }
  const vc = pickNumber(ch, ["video_count"]);
  if (vc !== null) {
    pushRow(rows, "Videos", vc.toLocaleString());
  }
  const views = pickNumber(ch, ["view_count"]);
  if (views !== null) {
    pushRow(rows, "Views", views.toLocaleString());
  }
  pushRow(rows, "Country", pickString(ch, ["country"]));
  pushRow(rows, "Language", pickString(ch, ["default_language"]));
  pushRow(rows, "Published", pickString(ch, ["published_at"]));
  const kw = pickString(ch, ["keywords"]);
  if (kw) {
    pushRow(rows, "Keywords", truncate(kw, 120));
  }
  const desc = pickString(ch, ["description"]);
  if (desc) {
    pushRow(rows, "Description", truncate(desc, 200));
  }
  return rows;
}

export function youtubePlaylistSummary(playlists: unknown): string | null {
  const list = asRecordArray(playlists);
  if (list.length === 0) {
    return null;
  }
  const names = list
    .map((p) => pickString(p, ["name", "title"]))
    .filter((n): n is string => Boolean(n));
  if (names.length === 0) {
    return `${list.length} playlist(s)`;
  }
  const shown = names.slice(0, 4).join(" · ");
  const extra = names.length > 4 ? ` (+${names.length - 4} more)` : "";
  return `${shown}${extra}`;
}

export function facebookRowsFromParts(
  profile: Record<string, unknown> | null,
  _pages: unknown,
): ProfileFieldRow[] {
  const rows: ProfileFieldRow[] = [];
  if (profile) {
    pushRow(rows, "Name", pickString(profile, ["name"]));
    const fn = pickString(profile, ["first_name"]);
    const ln = pickString(profile, ["last_name"]);
    if (fn || ln) {
      pushRow(rows, "Name (parts)", [fn, ln].filter(Boolean).join(" "));
    }
    const pic = pickString(profile, ["profile_picture_url"]);
    if (pic) {
      pushRow(rows, "Photo", "Linked");
    }
  }
  // Each page is shown in its own block in FacebookChannelProfileCard (facebookPages).
  return rows;
}
