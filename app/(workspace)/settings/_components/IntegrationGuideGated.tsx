"use client";

import type { ReactElement, ReactNode } from "react";

import { FeatureGate } from "@/components/billing/FeatureGate";
import { billingFeatureLabel } from "@/lib/billing/billingErrors";
import { integrationSlugFeature } from "@/lib/billing/featureGates";

export function IntegrationGuideGated({
  slug,
  children,
}: {
  slug: string;
  children: ReactNode;
}): ReactElement {
  const feature = integrationSlugFeature(slug);
  if (!feature) {
    return <>{children}</>;
  }
  return (
    <FeatureGate feature={feature} featureLabel={billingFeatureLabel(feature)}>
      {children}
    </FeatureGate>
  );
}
