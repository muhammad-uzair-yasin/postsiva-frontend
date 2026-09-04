"use client";

import type { BillingInterval } from "@/lib/billing/billingApi";
import { cn } from "@/lib/cn";

type LightPricingHeroProps = {
  readonly interval: BillingInterval;
  readonly yearlySavings: number;
  readonly onIntervalChange: (value: BillingInterval) => void;
};

export function LightPricingHero({
  interval,
  yearlySavings,
  onIntervalChange,
}: LightPricingHeroProps): React.ReactElement {
  const annual = interval === "year";

  return (
    <section className="mx-auto mb-16 max-w-3xl text-center sm:mb-24">
      <h1 className="mb-6 font-[family-name:var(--font-headline)] text-4xl font-bold tracking-tight text-[#111827] sm:text-5xl lg:text-[3rem] lg:leading-[1.15]">
        Simple, transparent pricing
      </h1>
      <p className="mx-auto max-w-2xl text-base leading-relaxed text-[#4B5563]">
        No hidden fees. No surprise charges. Choose the plan that scales with your creative
        workflow.
      </p>

      <div className="mt-10 flex items-center justify-center gap-4">
        <span
          className={cn(
            "text-sm transition-colors",
            !annual ? "font-medium text-[#111827]" : "text-[#4B5563]",
          )}
        >
          Monthly
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={annual}
          aria-label="Toggle annual billing"
          onClick={() => onIntervalChange(annual ? "month" : "year")}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#0058bc] focus:ring-offset-2",
            annual ? "bg-[#0058bc]" : "bg-[#CBD5E1]",
          )}
        >
          <span
            aria-hidden
            className={cn(
              "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition duration-200 ease-in-out",
              annual ? "translate-x-5" : "translate-x-0",
            )}
          />
        </button>
        <span className="flex items-center gap-1 text-sm font-medium text-[#111827]">
          Annually
          <span className="ml-1 rounded-full bg-[#10B981]/10 px-2 py-0.5 text-xs font-semibold text-[#10B981]">
            −{yearlySavings}%
          </span>
        </span>
      </div>
    </section>
  );
}
