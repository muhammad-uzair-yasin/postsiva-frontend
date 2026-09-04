"use client";

import type { ReactElement, ReactNode } from "react";

import { usePlanFeature } from "@/lib/billing/BillingContext";

import { UpgradeRequiredBanner } from "./UpgradeRequiredBanner";

interface FeatureGateProps {
  feature: string;
  featureLabel: string;
  children: ReactNode;
  fallback?: ReactNode;
  compact?: boolean;
}

export function FeatureGate({
  feature,
  featureLabel,
  children,
  fallback,
  compact = false,
}: FeatureGateProps): ReactElement {
  const { enabled, loading, billingError, hasUsage } = usePlanFeature(feature);

  if (loading) {
    return <>{children}</>;
  }

  if (!hasUsage && billingError) {
    return <>{children}</>;
  }

  if (!enabled) {
    return (
      <>{fallback ?? <UpgradeRequiredBanner featureLabel={featureLabel} compact={compact} />}</>
    );
  }

  return <>{children}</>;
}
