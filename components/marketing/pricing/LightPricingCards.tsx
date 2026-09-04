"use client";

import Link from "next/link";

import type { BillingInterval, BillingPlanPublic } from "@/lib/billing/billingApi";
import { formatPlanLimitValue } from "@/lib/billing/planCardCopy";
import {
  planCardPrice,
  planCtaHref,
  planCtaLabel,
} from "@/lib/billing/pricingMarketing";
import { cn } from "@/lib/cn";

type LightPricingCardsProps = {
  readonly plans: readonly BillingPlanPublic[];
  readonly interval: BillingInterval;
  readonly loggedIn: boolean;
};

function enabled(plan: BillingPlanPublic, key: string): boolean {
  return plan.features[key] === true;
}

function planBullets(plan: BillingPlanPublic): string[] {
  const limits = plan.limits;
  const bullets = [
    `${formatPlanLimitValue(limits.max_connected_accounts)} connected accounts`,
    `${formatPlanLimitValue(limits.posts_per_month)} publish-now posts / mo`,
    `${formatPlanLimitValue(limits.scheduled_posts_per_month)} scheduled posts / mo`,
    `${formatPlanLimitValue(limits.ai_credits_per_month)} AI credits / mo`,
  ];

  if (enabled(plan, "inbox_enabled")) bullets.push("Unified inbox included");
  if (enabled(plan, "analytics_enabled")) bullets.push("Analytics included");
  if (enabled(plan, "piva_agent_enabled")) bullets.push("Piva AI agent included");
  if (enabled(plan, "mcp_enabled") || enabled(plan, "gpt_app_enabled")) {
    bullets.push("GPT & MCP integrations");
  }

  return bullets.filter((item) => !item.startsWith("— "));
}

export function LightPricingCards({
  plans,
  interval,
  loggedIn,
}: LightPricingCardsProps): React.ReactElement {
  return (
    <div className="relative z-10 mb-24 grid grid-cols-1 gap-8 md:grid-cols-3 lg:mb-32">
      {plans.map((plan, index) => {
        const highlight = index === 2;
        const price = planCardPrice(plan, interval);
        const href = planCtaHref(plan.plan_id, loggedIn);
        const cta = planCtaLabel(plan.plan_id, loggedIn);
        const bullets = planBullets(plan);

        return (
          <div
            key={plan.plan_id}
            className={cn(
              "relative flex flex-col overflow-hidden rounded-2xl bg-white p-8 transition-all duration-300 hover:-translate-y-1",
              highlight
                ? "z-10 scale-[1.02] border-2 border-[#0058bc] shadow-[0_20px_40px_rgba(0,88,188,0.1)] md:scale-105"
                : "border border-[#E5E7EB] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-[#0058bc]/35 hover:shadow-[0_8px_30px_rgba(0,88,188,0.08)]",
            )}
          >
            {highlight ? (
              <div className="absolute right-0 top-0 rounded-bl-xl bg-[#0058bc] px-4 py-1 text-xs font-bold uppercase tracking-wider text-white">
                Most Popular
              </div>
            ) : null}

            <div className="mb-8">
              <h3 className="mb-2 flex items-center gap-2 text-2xl font-semibold text-[#111827]">
                {plan.display_name}
                {highlight ? (
                  <span className="relative ml-1 flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10B981] opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#10B981]" />
                  </span>
                ) : null}
              </h3>
              <p className="min-h-[40px] text-sm text-[#4B5563]">{plan.tagline}</p>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline">
                <span className="font-[family-name:var(--font-headline)] text-4xl font-bold text-[#111827] sm:text-5xl">
                  {price.amount}
                </span>
                <span className="ml-2 text-sm text-[#4B5563]">{price.suffix}</span>
              </div>
              {price.note ? (
                <p className="mt-1 text-xs text-[#4B5563]">{price.note}</p>
              ) : null}
            </div>

            <Link
              href={href}
              className={cn(
                "mb-8 w-full rounded-xl px-6 py-4 text-center font-mono text-xs font-medium uppercase tracking-wide transition-colors duration-200",
                highlight
                  ? "bg-[#0058bc] text-white shadow-[0_4px_14px_0_rgba(0,88,188,0.32)] hover:bg-[#004a9e]"
                  : "border border-[#BFDBFE] bg-white text-[#0058bc] hover:bg-[#EFF6FF]",
              )}
            >
              {cta}
            </Link>

            <ul className="flex-grow space-y-4">
              {bullets.map((item) => (
                <li key={item} className="flex items-start">
                  <span
                    className="material-symbols-outlined mr-3 text-xl text-[#0058bc]"
                    aria-hidden
                  >
                    check_circle
                  </span>
                  <span className="text-sm text-[#4B5563]">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
