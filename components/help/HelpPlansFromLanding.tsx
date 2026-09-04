"use client";

import { Crown, Shield } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type ReactElement } from "react";

import { PlanDetailsBlock } from "@/components/billing/PlanDetailsBlock";
import {
  type BillingInterval,
  type BillingPlanPublic,
} from "@/lib/billing/billingApi";
import { MARKETING_BILLING_PLANS_FALLBACK } from "@/lib/billing/marketingPlansFallback";
import { planPriceLabel } from "@/lib/billing/planCardCopy";

const PLAN_ICONS: Record<string, typeof Shield> = {
  free: Shield,
  starter: Shield,
  pro: Crown,
};

/** Same Free / Starter / Pro cards as the landing pricing section. */
export function HelpPlansFromLanding(): ReactElement {
  const [interval, setInterval] = useState<BillingInterval>("month");
  const yearlySavings = MARKETING_BILLING_PLANS_FALLBACK.yearly_savings_percent;

  const ordered = useMemo(
    () =>
      (["free", "starter", "pro"] as const)
        .map((id) =>
          MARKETING_BILLING_PLANS_FALLBACK.plans.find((p) => p.plan_id === id),
        )
        .filter(Boolean) as BillingPlanPublic[],
    [],
  );

  return (
    <div className="mt-2">
      <p className="text-sm leading-relaxed text-[#4B5563]">
        Same plans as the marketing pricing page — Free to publish, Starter for creators, Pro for
        teams and automation. Toggle Monthly or Yearly (−{yearlySavings}%).
      </p>

      <div className="mt-6 inline-flex rounded-full border border-[#BFDBFE] bg-white p-1">
        <button
          type="button"
          onClick={() => setInterval("month")}
          className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
            interval === "month"
              ? "bg-[#0058bc] text-white"
              : "text-[#4B5563] hover:text-[#111827]"
          }`}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => setInterval("year")}
          className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
            interval === "year"
              ? "bg-[#0058bc] text-white"
              : "text-[#4B5563] hover:text-[#111827]"
          }`}
        >
          Yearly
          <span className="ml-1.5 text-xs opacity-90">−{yearlySavings}%</span>
        </button>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {ordered.map((plan) => {
          const highlight = plan.plan_id === "pro";
          const Icon = PLAN_ICONS[plan.plan_id] ?? Shield;
          const price = planPriceLabel(plan, interval);
          return (
            <div
              key={plan.plan_id}
              className={`relative flex flex-col overflow-visible rounded-2xl border p-5 shadow-[0_16px_40px_-28px_rgba(0,88,188,0.45)] ${
                highlight
                  ? "border-[#0058bc] bg-white ring-1 ring-[#0058bc]/20"
                  : "border-[#E5E7EB] bg-white"
              }`}
            >
              {highlight ? (
                <span className="absolute -top-3 left-1/2 z-[1] -translate-x-1/2 rounded-full bg-[#0058bc] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                  Most popular
                </span>
              ) : null}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#0058bc]">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <p className="text-base font-black text-[#111827]">{plan.display_name}</p>
                  <p className="text-xs text-[#4B5563]">{plan.tagline}</p>
                </div>
              </div>
              <div className="mt-5">
                <p className="text-3xl font-black text-[#111827]">{price.main}</p>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#4B5563]">
                  {price.sub}
                </p>
              </div>
              <div className="mt-2 flex-1">
                <PlanDetailsBlock plan={plan} variant="marketing" />
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-sm text-[#4B5563]">
        Prefer the full marketing page?{" "}
        <Link href="/#pricing" className="font-semibold text-[#0058bc] hover:underline">
          Open pricing on the homepage
        </Link>
        .
      </p>
    </div>
  );
}
