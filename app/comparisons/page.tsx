import dynamic from "next/dynamic";

import { LightMarketingPageFrame } from "@/components/marketing/light/LightMarketingPageFrame";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { MarketingSiteFooter } from "@/components/marketing/MarketingSiteFooter";
import { MarketingSectionSkeleton } from "@/components/marketing/MarketingSectionSkeleton";
import { buildPageMetadata } from "@/lib/seo/pageSeo";
import { PUBLIC_PAGE_COPY } from "@/lib/seo/publicPageMeta";

export const metadata = buildPageMetadata({
  path: "/comparisons",
  title: PUBLIC_PAGE_COPY.comparisons.title,
  description: PUBLIC_PAGE_COPY.comparisons.description,
  absoluteTitle: true,
});

const LightComparisonsPage = dynamic(
  () =>
    import("@/components/marketing/comparisons/LightComparisonsPage").then((m) => ({
      default: m.LightComparisonsPage,
    })),
  { loading: () => <MarketingSectionSkeleton minHeightClassName="min-h-[40rem]" /> },
);

export default function ComparisonsPage(): React.ReactElement {
  return (
    <LightMarketingPageFrame>
      <MarketingNavbar />
      <LightComparisonsPage />
      <MarketingSiteFooter />
    </LightMarketingPageFrame>
  );
}
