import type { BillingUsage } from "@/lib/billing/billingApi";
import { isUnlimitedPlanLimit } from "@/lib/billing/planCardCopy";

import {
  isPlatformAlreadyConnectedInSnapshot,
  resolveConnectedAccountUsageCount,
  type ConnectedAccountSnapshot,
} from "./connectedAccountSnapshot";

export type { ConnectedAccountSnapshot };

export function canCreateWorkspace(usage: BillingUsage | null): boolean {
  if (!usage) {
    return true;
  }
  if (isUnlimitedPlanLimit(usage.limits.max_workspaces)) {
    return true;
  }
  return usage.usage_counts.workspaces_owned < usage.limits.max_workspaces;
}

export function canConnectMoreAccounts(
  usage: BillingUsage | null,
  options?: {
    readonly snapshot?: ConnectedAccountSnapshot | null;
    readonly connectingPlatformId?: string | null;
  },
): boolean {
  if (!usage) {
    return true;
  }
  if (isUnlimitedPlanLimit(usage.limits.max_connected_accounts)) {
    return true;
  }

  const mode = usage.limits.connected_account_mode ?? "publish_identity";
  if (
    mode === "oauth_platform" &&
    isPlatformAlreadyConnectedInSnapshot(
      options?.snapshot,
      options?.connectingPlatformId,
    )
  ) {
    return true;
  }

  const used = resolveConnectedAccountUsageCount(usage, options?.snapshot);
  return used < usage.limits.max_connected_accounts;
}

export function canInviteTeamMember(
  usage: BillingUsage | null,
  teamSlotsUsed: number,
): boolean {
  if (!usage) {
    return true;
  }
  if (isUnlimitedPlanLimit(usage.limits.max_team_members_per_workspace)) {
    return true;
  }
  return teamSlotsUsed < usage.limits.max_team_members_per_workspace;
}
