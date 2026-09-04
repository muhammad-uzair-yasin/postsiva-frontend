"use client";

import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { LightBentoStack } from "@/components/marketing/light/LightBentoStack";
import { LightBrandFoundation } from "@/components/marketing/light/LightBrandFoundation";
import { LightContactStage } from "@/components/marketing/light/LightContactStage";
import { LightDepthScrollStage } from "@/components/marketing/light/LightDepthScrollStage";
import { LightHero } from "@/components/marketing/light/LightHero";
import { MarketingSiteFooter } from "@/components/marketing/MarketingSiteFooter";
import { LightManifesto } from "@/components/marketing/light/LightManifesto";
import { LightMarketingPageFrame } from "@/components/marketing/light/LightMarketingPageFrame";
import { LightPlatformMarquee } from "@/components/marketing/light/LightPlatformMarquee";
import { LightPricingStage } from "@/components/marketing/light/LightPricingStage";
import { LightUpdates } from "@/components/marketing/light/LightUpdates";
import { LightPublishedScheduleDemo } from "@/components/marketing/light/LightPublishedScheduleDemo";
import { DEMO_STAGE_STEPS } from "@/components/marketing/light/LightPublishedScheduleDemoParts";

export function LightLandingPage(): React.ReactElement {
  return (
    <LightMarketingPageFrame showOrbitBelowHero>
      <MarketingNavbar />
      <main className="min-w-0 max-w-full overflow-x-clip">
        <LightHero />
        <LightPlatformMarquee />
        <LightDepthScrollStage itemWeights={[DEMO_STAGE_STEPS + 2, 1, 1, 1, 1, 1, 1]}>
          <LightPublishedScheduleDemo />
          <LightManifesto />
          <LightBrandFoundation />
          <LightBentoStack />
          <LightPricingStage />
          <LightUpdates />
          <LightContactStage />
        </LightDepthScrollStage>
      </main>
      <div data-landing-footer className="relative z-30 bg-white">
        <MarketingSiteFooter />
      </div>
    </LightMarketingPageFrame>
  );
}
