"use client";

import { LightPricingCards } from "@/components/marketing/pricing/LightPricingCards";
import { LightPricingCompareTable } from "@/components/marketing/pricing/LightPricingCompareTable";
import { LightPricingHero } from "@/components/marketing/pricing/LightPricingHero";
import { useMarketingPlans } from "@/lib/billing/pricingMarketing";

export function LightPricingPage(): React.ReactElement {
  const { interval, setInterval, yearlySavings, loggedIn, ordered } = useMarketingPlans();

  return (
    <main className="mx-auto w-full max-w-[1280px] flex-grow px-4 pb-24 pt-24 sm:px-10 sm:pt-32">
      <LightPricingHero
        interval={interval}
        yearlySavings={yearlySavings}
        onIntervalChange={setInterval}
      />
      <LightPricingCards plans={ordered} interval={interval} loggedIn={loggedIn} />
      <LightPricingCompareTable plans={ordered} />
    </main>
  );
}
