import type { DashboardProfileCardView } from "./dashboardProfileCardTypes";
import { formatStatCount } from "./formatStatCount";
import { isRecord, nonEmptyString } from "./profileCardGuards";

function findBoardByRowId(
  block: Record<string, unknown>,
  rowId: string,
): Record<string, unknown> | null {
  const prefix = "pinterest:board:";
  if (!rowId.startsWith(prefix)) {
    return null;
  }
  const suffix = rowId.slice(prefix.length);
  const boardsRaw = block.boards;
  if (!Array.isArray(boardsRaw)) {
    return null;
  }
  const boards = boardsRaw.filter(isRecord);
  for (const b of boards) {
    const id = nonEmptyString(b.board_id);
    if (!id) {
      continue;
    }
    const stable = id.replace(/:/g, "_");
    if (stable === suffix || id === suffix) {
      return b;
    }
  }
  return null;
}

/**
 * Pinterest profile row (`id === "pinterest"`): business profile + aggregate stats.
 */
export function mapPinterestProfileUnifiedToProfileCard(
  block: unknown,
): DashboardProfileCardView | null {
  if (!isRecord(block)) {
    return null;
  }
  const profile = block.profile;
  if (!isRecord(profile)) {
    return null;
  }

  const username = nonEmptyString(profile.username)?.replace(/^@/, "") ?? null;
  const businessName = nonEmptyString(profile.business_name);
  const primaryLine = businessName ?? (username ? `@${username}` : "Pinterest");
  const secondaryLine =
    username && businessName
      ? `@${username}`
      : username && !businessName
        ? `Account · ${profile.account_type ?? "Pinterest"}`
        : undefined;

  const avatarUrl = nonEmptyString(profile.profile_image);
  const about = nonEmptyString(profile.about);
  const website = nonEmptyString(profile.website_url);
  const bio = [about, website].filter(Boolean).join("\n\n") || null;

  const visitUrl =
    username !== null
      ? `https://www.pinterest.com/${encodeURIComponent(username)}/`
      : null;

  return {
    platformLabel: "Pinterest",
    primaryLine,
    secondaryLine,
    avatarUrl,
    stats: [
      { label: "boards", value: formatStatCount(profile.board_count) },
      { label: "pins", value: formatStatCount(profile.pin_count) },
      { label: "monthly views", value: formatStatCount(profile.monthly_views) },
    ],
    bio,
    visitUrl,
    showVerifiedBadge: false,
  };
}

/**
 * Pinterest board row (`pinterest:board:*`): highlight one board; stats stay profile-level.
 */
export function mapPinterestBoardRowToProfileCard(
  block: unknown,
  selectedRowId: string,
): DashboardProfileCardView | null {
  if (!isRecord(block)) {
    return null;
  }
  const profile = block.profile;
  if (!isRecord(profile)) {
    return null;
  }
  const board = findBoardByRowId(block, selectedRowId);
  if (!board) {
    return null;
  }

  const username = nonEmptyString(profile.username)?.replace(/^@/, "") ?? null;
  const boardName = nonEmptyString(board.name) ?? "Board";
  const avatarUrl = nonEmptyString(profile.profile_image);
  const businessName = nonEmptyString(profile.business_name);

  const secondaryParts = [
    businessName,
    username ? `@${username}` : null,
  ].filter(Boolean);
  const secondaryLine =
    secondaryParts.length > 0 ? secondaryParts.join(" · ") : undefined;

  const about = nonEmptyString(profile.about);
  const website = nonEmptyString(profile.website_url);
  const bio =
    `Board: ${boardName}` +
    (about || website
      ? `\n\n${[about, website].filter(Boolean).join("\n")}`
      : "");

  const visitUrl =
    username !== null
      ? `https://www.pinterest.com/${encodeURIComponent(username)}/`
      : null;

  return {
    platformLabel: "Pinterest · Board",
    primaryLine: boardName,
    secondaryLine,
    avatarUrl,
    stats: [
      { label: "boards", value: formatStatCount(profile.board_count) },
      { label: "pins", value: formatStatCount(profile.pin_count) },
      { label: "monthly views", value: formatStatCount(profile.monthly_views) },
    ],
    bio: bio.trim().length > 0 ? bio.trim() : `Board: ${boardName}`,
    visitUrl,
    showVerifiedBadge: false,
  };
}
