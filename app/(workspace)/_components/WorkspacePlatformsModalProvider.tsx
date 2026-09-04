"use client";

import dynamic from "next/dynamic";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { useBilling } from "@/lib/billing/BillingContext";
import { buildConnectedAccountSnapshotFromWorkspace } from "@/lib/billing/connectedAccountSnapshot";
import { useUpgradePlanLimit } from "@/lib/billing/UpgradePlanLimitProvider";
import { getStoredActiveWorkspaceId } from "@/lib/auth/session";

const AdPlatformsModal = dynamic(
  () =>
    import("../ad-platform/_components/AdPlatformsModal").then(
      (m) => m.AdPlatformsModal,
    ),
  { ssr: false },
);

interface WorkspacePlatformsModalContextValue {
  openPlatforms: () => void;
  openPlatformsForConnect: () => void;
  closePlatforms: () => void;
  isPlatformsModalOpen: boolean;
}

const WorkspacePlatformsModalContext =
  createContext<WorkspacePlatformsModalContextValue | null>(null);

export function useWorkspacePlatformsModal(): WorkspacePlatformsModalContextValue {
  const ctx = useContext(WorkspacePlatformsModalContext);
  if (!ctx) {
    throw new Error(
      "useWorkspacePlatformsModal must be used within WorkspacePlatformsModalProvider",
    );
  }
  return ctx;
}

export function WorkspacePlatformsModalProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const [open, setOpen] = useState(false);
  const { refresh } = useBilling();
  const { promptUpgradeIfNeeded } = useUpgradePlanLimit();

  const openPlatforms = useCallback(() => {
    setOpen(true);
  }, []);

  const openPlatformsForConnect = useCallback(() => {
    void (async () => {
      const snapshot = await refresh();
      const workspaceId = getStoredActiveWorkspaceId();
      const connectedAccountSnapshot =
        buildConnectedAccountSnapshotFromWorkspace(workspaceId);
      if (
        promptUpgradeIfNeeded("connected_accounts", {
          usageSnapshot: snapshot,
          connectedAccountSnapshot,
        })
      ) {
        return;
      }
      setOpen(true);
    })();
  }, [promptUpgradeIfNeeded, refresh]);

  const closePlatforms = useCallback(() => {
    setOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      openPlatforms,
      openPlatformsForConnect,
      closePlatforms,
      isPlatformsModalOpen: open,
    }),
    [open, openPlatforms, openPlatformsForConnect, closePlatforms],
  );

  return (
    <WorkspacePlatformsModalContext.Provider value={value}>
      {children}
      {open ? <AdPlatformsModal onClose={closePlatforms} /> : null}
    </WorkspacePlatformsModalContext.Provider>
  );
}
