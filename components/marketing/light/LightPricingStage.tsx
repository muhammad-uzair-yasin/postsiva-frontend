"use client";

import { lightSectionClass } from "@/components/marketing/light/light-layout";
import { LightPricingCards } from "@/components/marketing/pricing/LightPricingCards";
import { useMarketingPlans } from "@/lib/billing/pricingMarketing";
import { cn } from "@/lib/cn";

export function LightPricingStage(): React.ReactElement {
  const { interval, loggedIn, ordered } = useMarketingPlans();

  return (
    <section className={cn("py-12", lightSectionClass)}>
      <div className="mb-10 text-center">
        <h2 className="font-[family-name:var(--font-headline)] text-4xl font-bold tracking-tight text-[#111827] sm:text-5xl">
          Simple pricing that scales with you
        </h2>
        <p className="mt-3 text-base font-medium text-[#667085]">
          Start free, then upgrade when your workspace needs more channels, posts, and AI.
        </p>
      </div>

      <div className="[&>div]:mb-0 [&>div]:gap-6">
        <LightPricingCards plans={ordered} interval={interval} loggedIn={loggedIn} />
      </div>
    </section>
  );
}
