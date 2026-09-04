"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";

import { UpgradePlanLimitModal } from "@/components/billing/UpgradePlanLimitModal";

import type { BillingUsage } from "@/lib/billing/billingApi";

import { useBilling } from "./BillingContext";
import {
  billingErrorToPlanLimitKind,
  type BillingPlanErrorDetail,
} from "./billingErrors";
import {
  canConnectMoreAccounts,
  canCreateWorkspace,
  canInviteTeamMember,
  type ConnectedAccountSnapshot,
} from "./planLimitChecks";

import { useWorkspaceAccountSettings } from "@/app/(workspace)/_components/shell/WorkspaceAccountSettingsProvider";

export type PlanLimitKind = "connected_accounts" | "workspaces" | "team_members";

type UpgradePlanLimitContextValue = {
  readonly promptUpgradeIfNeeded: (
    kind: PlanLimitKind,
    options?: {
      readonly teamSlotsUsed?: number;
      readonly usageSnapshot?: BillingUsage | null;
      readonly connectedAccountSnapshot?: ConnectedAccountSnapshot | null;
      readonly connectingPlatformId?: string | null;
    },
  ) => boolean;
  readonly promptUpgradeForBillingError: (
    detail: BillingPlanErrorDetail,
  ) => boolean;
};

const UpgradePlanLimitContext = createContext<UpgradePlanLimitContextValue | null>(
  null,
);

export function UpgradePlanLimitProvider({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const { usage, loading } = useBilling();
  const { openBillingSettings } = useWorkspaceAccountSettings();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<PlanLimitKind>("connected_accounts");

  const promptUpgradeIfNeeded = useCallback(
    (
      limitKind: PlanLimitKind,
      options?: {
        teamSlotsUsed?: number;
        usageSnapshot?: BillingUsage | null;
        connectedAccountSnapshot?: ConnectedAccountSnapshot | null;
        connectingPlatformId?: string | null;
      },
    ): boolean => {
      const snapshot = options?.usageSnapshot ?? usage;
      if (!options?.usageSnapshot && loading) {
        return true;
      }
      if (!snapshot) {
        return true;
      }
      let blocked = false;
      if (limitKind === "connected_accounts") {
        blocked = !canConnectMoreAccounts(snapshot, {
          snapshot: options?.connectedAccountSnapshot,
          connectingPlatformId: options?.connectingPlatformId,
        });
      } else if (limitKind === "workspaces") {
        blocked = !canCreateWorkspace(snapshot);
      } else {
        blocked = !canInviteTeamMember(snapshot, options?.teamSlotsUsed ?? 0);
      }
      if (!blocked) {
        return false;
      }
      setKind(limitKind);
      setOpen(true);
      return true;
    },
    [loading, usage],
  );

  const promptUpgradeForBillingError = useCallback(
    (detail: BillingPlanErrorDetail): boolean => {
      const limitKind = billingErrorToPlanLimitKind(detail.error);
      if (!limitKind) {
        return false;
      }
      setKind(limitKind);
      setOpen(true);
      return true;
    },
    [],
  );

  const value = useMemo(
    () => ({ promptUpgradeIfNeeded, promptUpgradeForBillingError }),
    [promptUpgradeIfNeeded, promptUpgradeForBillingError],
  );

  return (
    <UpgradePlanLimitContext.Provider value={value}>
      {children}
      <UpgradePlanLimitModal
        open={open}
        kind={kind}
        onClose={() => setOpen(false)}
        onUpgrade={() => {
          setOpen(false);
          openBillingSettings();
        }}
      />
    </UpgradePlanLimitContext.Provider>
  );
}

export function useUpgradePlanLimit(): UpgradePlanLimitContextValue {
  const ctx = useContext(UpgradePlanLimitContext);
  if (!ctx) {
    throw new Error("useUpgradePlanLimit must be used within UpgradePlanLimitProvider");
  }
  return ctx;
}
