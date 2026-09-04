"use client";

import type { ReactElement, ReactNode } from "react";
import { usePathname } from "next/navigation";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { resolveBillingFeatureLabel } from "@/lib/i18n/resolveBillingFeatureLabel";
import { pathnameUsesWorkspaceAccountRail } from "@/lib/workspace/accountRailPaths";

import { FeatureGate } from "./FeatureGate";

interface FeatureGatedPageProps {
  feature: string;
  /** @deprecated Prefer i18n via `billing.features.*`; kept for gradual migration. */
  featureLabel?: string;
  children: ReactNode;
}

/** Full-page wrapper — shows upgrade banner when feature is not on current plan. */
export function FeatureGatedPage({
  feature,
  featureLabel,
  children,
}: FeatureGatedPageProps): ReactElement {
  const { t } = useTranslations();
  const pathname = usePathname();
  const fillHeight = pathnameUsesWorkspaceAccountRail(pathname);
  const label = featureLabel ?? resolveBillingFeatureLabel(t, feature);

  const wrapperClass = fillHeight
    ? "flex h-full min-h-0 flex-1 flex-col overflow-hidden"
    : "min-h-[50vh] w-full";

  return (
    <div className={wrapperClass}>
      <FeatureGate feature={feature} featureLabel={label}>
        {children}
      </FeatureGate>
    </div>
  );
}
