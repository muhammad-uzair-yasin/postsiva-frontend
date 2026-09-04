"use client";

import { useMemo } from "react";

import { mapUnifiedProfileToDashboardCard } from "@/lib/dashboard/profileCard/mapUnifiedProfileToDashboardCard";
import type { DashboardProfileCardView } from "@/lib/dashboard/profileCard/dashboardProfileCardTypes";

import type { WorkspaceHeaderAccountRow } from "@/lib/workspace/headerAccountsTypes";

import { useWorkspaceHeaderAccounts } from "../../_components/WorkspaceHeaderAccountsProvider";

export type DashboardProfileCardDisplayMode = "mapped" | "unmapped" | "demo";

export interface UseDashboardProfileCardResult {
  readonly card: DashboardProfileCardView | null;
  readonly selectedAccount: WorkspaceHeaderAccountRow | null;
  /** `mapped` = platform mapper filled the card. `unmapped` = account selected, mapper not implemented yet. `demo` = no selection (static demo). */
  readonly displayMode: DashboardProfileCardDisplayMode;
}

export function useDashboardProfileCard(): UseDashboardProfileCardResult {
  const { unifiedProfiles, selectedAccount } = useWorkspaceHeaderAccounts();

  const card = useMemo((): DashboardProfileCardView | null => {
    if (!unifiedProfiles) {
      return null;
    }
    return mapUnifiedProfileToDashboardCard(unifiedProfiles, selectedAccount);
  }, [unifiedProfiles, selectedAccount]);

  const displayMode = useMemo((): DashboardProfileCardDisplayMode => {
    if (card) {
      return "mapped";
    }
    if (selectedAccount) {
      return "unmapped";
    }
    return "demo";
  }, [card, selectedAccount]);

  return {
    card,
    selectedAccount,
    displayMode,
  };
}
