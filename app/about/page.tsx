import { LightAboutPage } from "@/components/marketing/about/LightAboutPage";
import { LightMarketingPageFrame } from "@/components/marketing/light/LightMarketingPageFrame";
import { MarketingSiteFooter } from "@/components/marketing/MarketingSiteFooter";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { buildPageMetadata } from "@/lib/seo/pageSeo";
import { PUBLIC_PAGE_COPY } from "@/lib/seo/publicPageMeta";

export const metadata = buildPageMetadata({
  path: "/about",
  title: PUBLIC_PAGE_COPY.about.title,
  description: PUBLIC_PAGE_COPY.about.description,
  absoluteTitle: true,
});

export default function AboutPage(): React.ReactElement {
  return (
    <LightMarketingPageFrame>
      <MarketingNavbar />
      <LightAboutPage />
      <MarketingSiteFooter />
    </LightMarketingPageFrame>
  );
}
