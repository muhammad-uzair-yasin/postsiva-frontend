import type { WorkspaceHeaderAccountRow } from "@/lib/workspace/headerAccountsTypes";
import { isWorkspaceHeaderAllPlatformsId } from "@/lib/workspace/workspaceHeaderAllPlatforms";

export interface CalendarPostAccountLookup {
  readonly platform: string;
  readonly account: string;
  readonly platformUserId?: string | null;
}

export interface CalendarPostAccountDisplay {
  readonly name: string;
  readonly avatarUrl: string | null;
}

function looksLikePlatformId(value: string): boolean {
  const v = value.trim();
  if (!v) return true;
  if (/^\d+$/.test(v)) return true;
  if (/^[0-9a-f]{8}-[0-9a-f-]{4}-[0-9a-f-]{4}-[0-9a-f-]{4}-[0-9a-f]{12}$/i.test(v)) {
    return true;
  }
  return false;
}

function platformKey(value: string): string {
  const p = value.trim().toLowerCase();
  return p === "twitter" ? "x" : p;
}

function rowMatchesPlatform(
  row: WorkspaceHeaderAccountRow,
  platform: string,
): boolean {
  const key = platformKey(platform);
  return row.iconId === key || row.id === key || row.id.startsWith(`${key}:`);
}

function rowMatchesUserId(
  row: WorkspaceHeaderAccountRow,
  platformUserId: string,
): boolean {
  const pid = platformUserId.trim();
  if (!pid) return false;
  if (row.targetResourceId?.trim() === pid) return true;
  if (row.id === pid) return true;
  if (row.id.endsWith(`:${pid}`)) return true;
  const last = row.id.split(":").pop()?.trim();
  if (last && last.replace(/_/g, ":") === pid) return true;
  return false;
}

export function matchHeaderAccountForCalendarPost(
  post: CalendarPostAccountLookup,
  accounts: readonly WorkspaceHeaderAccountRow[],
  selectedAccount?: WorkspaceHeaderAccountRow | null,
): WorkspaceHeaderAccountRow | null {
  const platform = platformKey(post.platform);
  const platformUserId = post.platformUserId?.trim() ?? "";
  const scoped = accounts.filter((row) => rowMatchesPlatform(row, platform));

  if (platformUserId) {
    const byId = scoped.find((row) => rowMatchesUserId(row, platformUserId));
    if (byId) return byId;
  }

  const accountLabel = post.account.trim();
  if (accountLabel && !looksLikePlatformId(accountLabel)) {
    const byLabel = scoped.find((row) => row.label.trim() === accountLabel);
    if (byLabel) return byLabel;
  }

  if (
    selectedAccount &&
    !isWorkspaceHeaderAllPlatformsId(selectedAccount.id) &&
    rowMatchesPlatform(selectedAccount, platform)
  ) {
    return selectedAccount;
  }

  if (!platformUserId && scoped.length === 1) return scoped[0] ?? null;

  return null;
}

export function resolveCalendarPostAccountDisplay(
  post: CalendarPostAccountLookup,
  accounts: readonly WorkspaceHeaderAccountRow[],
  selectedAccount?: WorkspaceHeaderAccountRow | null,
): CalendarPostAccountDisplay {
  const matched = matchHeaderAccountForCalendarPost(post, accounts, selectedAccount);
  const raw = post.account.trim();
  const name =
    matched?.label.trim() ||
    (!looksLikePlatformId(raw) ? raw : "") ||
    (post.platform.trim() || "Account");
  return {
    name,
    avatarUrl: matched?.avatarUrl?.trim() || null,
  };
}
