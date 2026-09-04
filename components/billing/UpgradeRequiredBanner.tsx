"use client";

import type { ReactElement } from "react";

import { useWorkspaceAccountSettings } from "@/app/(workspace)/_components/shell/WorkspaceAccountSettingsProvider";

interface UpgradeRequiredBannerProps {
  featureLabel: string;
  compact?: boolean;
}

export function UpgradeRequiredBanner({
  featureLabel,
  compact = false,
}: UpgradeRequiredBannerProps): ReactElement {
  const { openBillingSettings } = useWorkspaceAccountSettings();

  return (
    <div
      className={`rounded-xl border border-primary/25 bg-primary/5 ${
        compact ? "px-4 py-3" : "p-5"
      }`}
    >
      <p className={`font-bold text-on-surface ${compact ? "text-sm" : "text-base"}`}>
        Upgrade to unlock {featureLabel}
      </p>
      {!compact ? (
        <p className="mt-1 text-sm text-on-surface-variant">
          This feature is not included on your current plan. Upgrade in billing settings.
        </p>
      ) : null}
      <button
        type="button"
        onClick={() => openBillingSettings()}
        className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-on-primary"
      >
        View plans
      </button>
    </div>
  );
}
