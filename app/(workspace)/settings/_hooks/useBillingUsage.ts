"use client";

import { useBilling } from "@/lib/billing/BillingContext";

import type { BillingUsage } from "@/lib/billing/billingApi";

export interface UseBillingUsageResult {
  usage: BillingUsage | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<BillingUsage | null>;
}

/** @deprecated Prefer useBilling() from BillingContext — kept for existing settings hooks. */
export function useBillingUsage(): UseBillingUsageResult {
  const { usage, loading, error, refresh } = useBilling();
  return { usage, loading, error, refresh };
}
