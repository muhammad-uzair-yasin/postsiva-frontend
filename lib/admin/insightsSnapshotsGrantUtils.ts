/** Pure helpers for insights snapshot grant UI (no API imports). */

export interface InsightsGrantInput {
  workspace_id?: string | null;
  platform?: string | null;
  account_id?: string | null;
  enabled?: boolean;
}

export interface InsightsSubAccount {
  id: string;
  label: string;
  account_type: string;
  selected: boolean;
}

export interface InsightsPlatform {
  id: string;
  label: string;
  connected: boolean;
  selected: boolean;
  sub_accounts: InsightsSubAccount[];
}

export interface InsightsWorkspace {
  id: string;
  name: string;
  slug?: string | null;
  selected: boolean;
  platforms: InsightsPlatform[];
}

/** Build grant rows from workspace/platform UI selections (custom scope). */
export function buildGrantsFromWorkspaces(workspaces: InsightsWorkspace[]): InsightsGrantInput[] {
  const grants: InsightsGrantInput[] = [];
  for (const ws of workspaces) {
    for (const platform of ws.platforms) {
      if (!platform.connected || !platform.selected) continue;
      if (platform.sub_accounts.length > 0) {
        for (const sa of platform.sub_accounts) {
          if (sa.selected) {
            grants.push({
              workspace_id: ws.id,
              platform: platform.id,
              account_id: sa.id,
              enabled: true,
            });
          }
        }
      } else {
        grants.push({ workspace_id: ws.id, platform: platform.id, enabled: true });
      }
    }
  }
  return grants;
}
