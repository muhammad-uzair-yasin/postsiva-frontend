import { asRecord, asRecordArray, pickNumber, pickString } from "@/lib/dashboard/profilePick";

export interface PinterestBoardItem {
  key: string;
  boardId: string | null;
  name: string;
}

export interface PinterestProfileDetail {
  userId: string | null;
  username: string | null;
  accountType: string | null;
  websiteUrl: string | null;
  about: string | null;
  businessName: string | null;
  boardCount: number | null;
  pinCount: number | null;
  followerCount: number | null;
  followingCount: number | null;
  monthlyViews: number | null;
  profileImageUrl: string | null;
  boards: PinterestBoardItem[];
}

/** Parse unified `/unified/user-profiles` pinterest slice. */
export function buildPinterestProfileDetailFromSlice(
  slice: unknown,
): PinterestProfileDetail | null {
  const root = asRecord(slice);
  if (!root) {
    return null;
  }
  const profile = asRecord(root.profile);
  const boardsRaw = asRecordArray(root.boards);
  const boards: PinterestBoardItem[] = boardsRaw.map((b, i) => ({
    key: pickString(b, ["board_id", "id"]) ?? `board-${i}`,
    boardId: pickString(b, ["board_id", "id"]),
    name: pickString(b, ["name", "title"]) ?? `Board ${i + 1}`,
  }));
  if (!profile && boards.length === 0) {
    return null;
  }
  return {
    userId: profile ? pickString(profile, ["pinterest_user_id"]) : null,
    username: profile ? pickString(profile, ["username"]) : null,
    accountType: profile ? pickString(profile, ["account_type"]) : null,
    websiteUrl: profile ? pickString(profile, ["website_url"]) : null,
    about: profile ? pickString(profile, ["about", "bio"]) : null,
    businessName: profile ? pickString(profile, ["business_name"]) : null,
    boardCount: profile ? pickNumber(profile, ["board_count"]) : null,
    pinCount: profile ? pickNumber(profile, ["pin_count"]) : null,
    followerCount: profile
      ? pickNumber(profile, ["follower_count", "followers_count"])
      : null,
    followingCount: profile ? pickNumber(profile, ["following_count"]) : null,
    monthlyViews: profile ? pickNumber(profile, ["monthly_views"]) : null,
    profileImageUrl: profile
      ? pickString(profile, ["profile_image", "profile_picture_url"])
      : null,
    boards,
  };
}
