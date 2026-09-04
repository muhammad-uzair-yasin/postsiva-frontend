import { PublicJsonLd } from "@/components/marketing/PublicJsonLd";

import { LightMarketingPageFrameClient } from "./LightMarketingPageFrameClient";

interface LightMarketingPageFrameProps {
  readonly children: React.ReactNode;
  readonly showOrbitBelowHero?: boolean;
}

export function LightMarketingPageFrame({
  children,
  showOrbitBelowHero = false,
}: LightMarketingPageFrameProps): React.ReactElement {
  return (
    <>
      <PublicJsonLd />
      <LightMarketingPageFrameClient showOrbitBelowHero={showOrbitBelowHero}>
        {children}
      </LightMarketingPageFrameClient>
    </>
  );
}
