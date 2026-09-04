import dynamic from "next/dynamic";

import { HelpCenterFrame } from "@/components/help/HelpCenterFrame";
import { MarketingSiteFooter } from "@/components/marketing/MarketingSiteFooter";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { MarketingSectionSkeleton } from "@/components/marketing/MarketingSectionSkeleton";
import { buildPageMetadata } from "@/lib/seo/pageSeo";
import { PUBLIC_PAGE_COPY } from "@/lib/seo/publicPageMeta";

export const metadata = buildPageMetadata({
  path: "/pricing",
  title: PUBLIC_PAGE_COPY.pricing.title,
  description: PUBLIC_PAGE_COPY.pricing.description,
});

const LightPricingPage = dynamic(
  () =>
    import("@/components/marketing/pricing/LightPricingPage").then((m) => ({
      default: m.LightPricingPage,
    })),
  { loading: () => <MarketingSectionSkeleton minHeightClassName="min-h-[40rem]" /> },
);

export default function PricingPage(): React.ReactElement {
  return (
    <HelpCenterFrame>
      <MarketingNavbar />
      <div className="bg-white">
        <LightPricingPage />
      </div>
      <MarketingSiteFooter />
    </HelpCenterFrame>
  );
}
