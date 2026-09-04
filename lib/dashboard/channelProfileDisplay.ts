import { asRecord } from "./profilePick";
import {
  pinterestRowsFromLive,
  unwrapProfile,
} from "./channelProfileRows/pinterestUnwrap";
import {
  facebookRowsFromParts,
  youtubePlaylistSummary,
  youtubeRowsFromChannel,
} from "./channelProfileRows/youtubeFacebook";
import { blueskyRowsFromProfile } from "./channelProfileRows/blueskyRows";
import {
  instagramRowsFromProfile,
  linkedinRowsFromParts,
  threadsRowsFromProfile,
  tiktokRowsFromProfile,
} from "./channelProfileRows/instagramLinkedinTiktok";
import type { ProfileFieldRow } from "./channelProfileRows/types";

export type { ProfileFieldRow };

/** Rows from workspace session snapshot (per dashboard card key). */
export function channelProfileWorkspaceRows(
  cardKey: string,
  snapshot: unknown,
): ProfileFieldRow[] {
  const baseKey = cardKey.startsWith("linkedin:") ? "linkedin" : cardKey.startsWith("facebook:") ? "facebook" : cardKey;
  switch (baseKey) {
    case "instagram":
      return instagramRowsFromProfile(asRecord(snapshot));
    case "linkedin": {
      const o = asRecord(snapshot);
      return linkedinRowsFromParts(
        o ? asRecord(o.profile) : null,
        o?.organizations,
      );
    }
    case "tiktok":
      return tiktokRowsFromProfile(asRecord(snapshot));
    case "youtube": {
      const o = asRecord(snapshot);
      const rows = youtubeRowsFromChannel(o ? asRecord(o.profile) : null);
      const ps = youtubePlaylistSummary(o?.playlists);
      if (ps) {
        rows.push({ label: "Playlists", value: ps });
      }
      return rows;
    }
    case "pinterest": {
      const o = asRecord(snapshot);
      const rows: ProfileFieldRow[] = [];
      rows.push({
        label: "Status",
        value: o?.connected === true ? "Connected" : "Not connected",
      });
      const note = typeof o?.note === "string" ? o.note.trim() : "";
      if (note) {
        rows.push({ label: "Tip", value: note });
      }
      return rows;
    }
    case "threads": {
      const o = asRecord(snapshot);
      return threadsRowsFromProfile(o ? asRecord(o.profile) : null);
    }
    case "bluesky": {
      const o = asRecord(snapshot);
      return blueskyRowsFromProfile(o ? asRecord(o.profile) : null);
    }
    case "facebook":
    case "facebook-profile":
    case "facebook-pages": {
      const o = asRecord(snapshot);
      return facebookRowsFromParts(o ? asRecord(o.profile) : null, o?.pages);
    }
    default:
      return [];
  }
}

/** Rows from last live API response (unified slice per platform). */
export function channelProfileLiveRows(
  cardKey: string,
  live: unknown,
): ProfileFieldRow[] {
  if (live === null || live === undefined) {
    return [];
  }
  const slice = asRecord(live);
  if (!slice) {
    return [];
  }
  const baseKey =
    cardKey.startsWith("linkedin:") ? "linkedin" : cardKey.startsWith("facebook:") ? "facebook" : cardKey;
  switch (baseKey) {
    case "instagram":
      return instagramRowsFromProfile(unwrapProfile(slice));
    case "linkedin":
      return linkedinRowsFromParts(
        asRecord(slice.profile),
        slice.organizations,
      );
    case "tiktok":
      return tiktokRowsFromProfile(unwrapProfile(slice));
    case "youtube": {
      const ch = asRecord(slice.channel_info) ?? asRecord(slice.profile);
      const rows = youtubeRowsFromChannel(ch);
      const ps = youtubePlaylistSummary(slice.playlists);
      if (ps) {
        rows.push({ label: "Playlists", value: ps });
      }
      return rows;
    }
    case "pinterest":
      return pinterestRowsFromLive(slice);
    case "threads":
      return threadsRowsFromProfile(asRecord(slice.profile));
    case "bluesky":
      return blueskyRowsFromProfile(asRecord(slice.profile));
    case "facebook":
    case "facebook-profile":
    case "facebook-pages":
      return facebookRowsFromParts(asRecord(slice.profile), slice.pages);
    default:
      return [];
  }
}
