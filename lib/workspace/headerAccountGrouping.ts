import type { WorkspaceHeaderAccountRow } from "./headerAccountsTypes";

export interface WorkspaceAccountGroup {
  readonly parent: WorkspaceHeaderAccountRow;
  readonly children: readonly WorkspaceHeaderAccountRow[];
}

const GROUPABLE_PARENT_IDS = ["linkedin"] as const;

function isParentId(id: string): id is (typeof GROUPABLE_PARENT_IDS)[number] {
  return GROUPABLE_PARENT_IDS.includes(id as (typeof GROUPABLE_PARENT_IDS)[number]);
}

export function isGroupedChildId(id: string): boolean {
  return (
    id.startsWith("linkedin:org:") ||
    id.startsWith("facebook:page:") ||
    id.startsWith("pinterest:board:")
  );
}

export function isPostingSelectableHeaderAccount(
  row: WorkspaceHeaderAccountRow,
): boolean {
  if (row.disabled) {
    return false;
  }
  // Posting can target LinkedIn personal + pages, but Facebook/Pinterest only page/board rows.
  if (row.id === "facebook" || row.id === "pinterest") {
    return false;
  }
  return true;
}

export function groupWorkspaceHeaderAccounts(
  accounts: readonly WorkspaceHeaderAccountRow[],
): WorkspaceAccountGroup[] {
  const parentRows = new Set<string>();
  for (const row of accounts) {
    if (isParentId(row.id)) {
      parentRows.add(row.id);
    }
  }

  const groupedChildren = new Map<string, WorkspaceHeaderAccountRow[]>();
  const ordered: WorkspaceAccountGroup[] = [];

  for (const row of accounts) {
    if (isParentId(row.id)) {
      ordered.push({
        parent: row,
        children: groupedChildren.get(row.id) ?? [],
      });
      continue;
    }

    const parentId = row.id.startsWith("linkedin:org:")
      ? "linkedin"
      : row.id.startsWith("facebook:page:")
        ? "facebook"
        : row.id.startsWith("pinterest:board:")
          ? "pinterest"
          : null;

    if (!parentId || !parentRows.has(parentId)) {
      ordered.push({ parent: row, children: [] });
      continue;
    }

    const existing = groupedChildren.get(parentId) ?? [];
    existing.push(row);
    groupedChildren.set(parentId, existing);
    const parentIndex = ordered.findIndex((g) => g.parent.id === parentId);
    if (parentIndex >= 0) {
      ordered[parentIndex] = { parent: ordered[parentIndex].parent, children: existing };
    }
  }

  return ordered;
}
