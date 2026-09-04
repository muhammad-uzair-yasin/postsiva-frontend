import type { AuthWorkspaceLoginItem } from "@/lib/auth/types";

import {
  asRecord,
  asRecordArray,
  pickNumber,
  pickString,
} from "@/lib/dashboard/profilePick";

export interface FacebookWorkspacePage {
  /** Stable key for React (page id from API when present). */
  key: string;
  /** Facebook page id (same as `key` when API sends it). */
  pageId: string | null;
  name: string;
  pictureUrl: string | null;
  category: string | null;
  followersCount: number | null;
  fanCount: number | null;
}

/** One entry per connected Facebook page (for dashboard / profile UI). */
export function facebookPagesListFromWorkspace(
  ws: AuthWorkspaceLoginItem,
): FacebookWorkspacePage[] {
  const pages = asRecordArray(ws.facebook_pages);
  return pages.map((p, index) => {
    const id = pickString(p, ["page_id", "id"]) ?? "";
    const name = pickString(p, ["page_name", "name"]) ?? "";
    return {
      key: id || `page-${index}`,
      pageId: id || null,
      name: name || `Page ${index + 1}`,
      pictureUrl:
        pickString(p, ["picture_url", "profile_picture_url", "picture"]) ?? null,
      category: pickString(p, ["page_category", "category"]),
      followersCount: pickNumber(p, ["followers_count"]),
      fanCount: pickNumber(p, ["fan_count"]),
    };
  });
}

/** Facebook slice from GET /unified/user-profiles (`pages` use `page_id` / `page_name`). */
export function facebookPagesListFromUnifiedFacebookSlice(
  facebookSlice: unknown,
): FacebookWorkspacePage[] {
  const root = asRecord(facebookSlice);
  if (!root) {
    return [];
  }
  const pages = asRecordArray(root.pages);
  return pages.map((p, index) => {
    const id = pickString(p, ["page_id", "id"]) ?? "";
    const name = pickString(p, ["page_name", "name"]) ?? "";
    return {
      key: id || `page-${index}`,
      pageId: id || null,
      name: name || `Page ${index + 1}`,
      pictureUrl:
        pickString(p, ["picture_url", "profile_picture_url", "picture"]) ?? null,
      category: pickString(p, ["page_category", "category"]),
      followersCount: pickNumber(p, ["followers_count"]),
      fanCount: pickNumber(p, ["fan_count"]),
    };
  });
}
