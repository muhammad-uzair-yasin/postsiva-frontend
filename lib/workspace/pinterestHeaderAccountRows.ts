import type { WorkspaceHeaderAccountRow } from "./headerAccountsTypes";

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object";
}

function nonEmptyString(v: unknown): string | null {
  if (typeof v !== "string") {
    return null;
  }
  const t = v.trim();
  return t.length > 0 ? t : null;
}

function pinterestProfileDisplayName(block: Record<string, unknown>): string {
  const fallback = "Pinterest";
  const profile = block.profile;
  if (!isRecord(profile)) {
    return fallback;
  }
  return (
    nonEmptyString(profile.business_name) ??
    nonEmptyString(profile.username) ??
    fallback
  );
}

function boardDisplayName(board: Record<string, unknown>, index: number): string {
  return nonEmptyString(board.name) ?? `Pinterest board ${index + 1}`;
}

function boardStableId(board: Record<string, unknown>, index: number): string {
  const raw = nonEmptyString(board.board_id);
  if (raw) {
    return raw.replace(/:/g, "_");
  }
  return `idx_${index}`;
}

export function buildPinterestHeaderAccountRows(
  block: unknown,
): WorkspaceHeaderAccountRow[] {
  const iconId = "pinterest" as const;
  const platformLabel = "Pinterest";
  if (!isRecord(block)) {
    return [];
  }
  const boardsRaw = block.boards;
  const boards = Array.isArray(boardsRaw) ? boardsRaw.filter(isRecord) : [];
  const parentRow: WorkspaceHeaderAccountRow = {
    id: "pinterest",
    iconId,
    label: pinterestProfileDisplayName(block),
    hint: platformLabel,
    targetResourceId: null,
  };
  if (boards.length === 0) {
    return [parentRow];
  }
  const rows: WorkspaceHeaderAccountRow[] = [];
  boards.forEach((board, i) => {
    const n = i + 1;
    rows.push({
      id: `pinterest:board:${boardStableId(board, i)}`,
      iconId,
      label: boardDisplayName(board, i),
      hint: `${platformLabel} · Board ${n}`,
      targetResourceId: nonEmptyString(board.board_id),
    });
  });
  return rows;
}
