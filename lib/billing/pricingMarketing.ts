import type { BillingInterval, BillingPlanPublic, BillingPlansResponse } from "@/lib/billing/billingApi";
import { MARKETING_BILLING_PLANS_FALLBACK } from "@/lib/billing/marketingPlansFallback";
import { getStoredAccessToken } from "@/lib/auth/session";
import { useEffect, useMemo, useState } from "react";

export function planCtaHref(planId: string, loggedIn: boolean): string {
  if (planId === "free") {
    return loggedIn ? "/dashboard" : "/signup";
  }
  if (planId === "pro") {
    return loggedIn ? "/settings/billing?upgrade=pro" : "/contact";
  }
  if (loggedIn) {
    return `/settings/billing?upgrade=${planId}`;
  }
  return `/signup?next=${encodeURIComponent(`/settings/billing?upgrade=${planId}`)}`;
}

export function planCtaLabel(planId: string, loggedIn: boolean): string {
  if (planId === "free") {
    return loggedIn ? "Go to app" : "Get Started Free";
  }
  if (planId === "pro") {
    return loggedIn ? "Upgrade to Pro" : "Contact Sales";
  }
  return loggedIn ? "Upgrade to Starter" : "Get Started";
}

export function useMarketingPlans(): {
  interval: BillingInterval;
  setInterval: (value: BillingInterval) => void;
  plans: BillingPlanPublic[];
  yearlySavings: number;
  loggedIn: boolean;
  ordered: BillingPlanPublic[];
} {
  const [interval, setInterval] = useState<BillingInterval>("month");
  const [plans, setPlans] = useState<BillingPlanPublic[]>(
    MARKETING_BILLING_PLANS_FALLBACK.plans,
  );
  const [yearlySavings, setYearlySavings] = useState(
    MARKETING_BILLING_PLANS_FALLBACK.yearly_savings_percent,
  );
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(Boolean(getStoredAccessToken()?.trim()));
    let cancelled = false;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);

    void (async () => {
      try {
        const base = (await import("@/lib/api/config")).getApiBaseUrl();
        const res = await fetch(`${base}/billing/plans`, {
          headers: { Accept: "application/json" },
          cache: "no-store",
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data = (await res.json()) as BillingPlansResponse;
        if (cancelled || !data.plans?.length) return;
        setPlans(data.plans);
        setYearlySavings(data.yearly_savings_percent);
      } catch {
        /* marketing fallback */
      } finally {
        window.clearTimeout(timeout);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, []);

  const ordered = useMemo(
    () =>
      ["free", "starter", "pro"]
        .map((id) => plans.find((plan) => plan.plan_id === id))
        .filter(Boolean) as BillingPlanPublic[],
    [plans],
  );

  return { interval, setInterval, plans, yearlySavings, loggedIn, ordered };
}

export function planCardPrice(
  plan: BillingPlanPublic,
  interval: BillingInterval,
): { amount: string; suffix: string; note?: string } {
  if (plan.plan_id === "free") {
    return { amount: "$0", suffix: "/mo" };
  }
  if (interval === "year") {
    return {
      amount: `$${plan.price_yearly_usd}`,
      suffix: "/yr",
    };
  }
  return { amount: `$${plan.price_monthly_usd}`, suffix: "/mo" };
}
