import { LightHowItWorksPage } from "@/components/marketing/how/LightHowItWorksPage";
import { LightMarketingPageFrame } from "@/components/marketing/light/LightMarketingPageFrame";
import { MarketingSiteFooter } from "@/components/marketing/MarketingSiteFooter";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { buildPageMetadata } from "@/lib/seo/pageSeo";
import { PUBLIC_PAGE_COPY } from "@/lib/seo/publicPageMeta";

export const metadata = buildPageMetadata({
  path: "/how-it-works",
  title: PUBLIC_PAGE_COPY.howItWorks.title,
  description: PUBLIC_PAGE_COPY.howItWorks.description,
  absoluteTitle: true,
});

export default function HowItWorksPage(): React.ReactElement {
  return (
    <LightMarketingPageFrame>
      <MarketingNavbar />
      <LightHowItWorksPage />
      <MarketingSiteFooter />
    </LightMarketingPageFrame>
  );
}
