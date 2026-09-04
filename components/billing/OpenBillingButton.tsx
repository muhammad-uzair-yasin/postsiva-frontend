"use client";

import type { ReactElement, ReactNode } from "react";

import { useWorkspaceAccountSettings } from "@/app/(workspace)/_components/shell/WorkspaceAccountSettingsProvider";

type OpenBillingButtonProps = {
  readonly className?: string;
  readonly upgradePlan?: string | null;
  readonly children: ReactNode;
};

/** Opens billing settings in the account modal instead of navigating away. */
export function OpenBillingButton({
  className,
  upgradePlan = null,
  children,
}: OpenBillingButtonProps): ReactElement {
  const { openBillingSettings } = useWorkspaceAccountSettings();

  return (
    <button
      type="button"
      className={className}
      onClick={() =>
        openBillingSettings(
          upgradePlan ? { billingUpgradePlan: upgradePlan } : undefined,
        )
      }
    >
      {children}
    </button>
  );
}
