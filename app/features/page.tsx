import dynamic from "next/dynamic";

import { LightMarketingPageFrame } from "@/components/marketing/light/LightMarketingPageFrame";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { MarketingSiteFooter } from "@/components/marketing/MarketingSiteFooter";
import { MarketingSectionSkeleton } from "@/components/marketing/MarketingSectionSkeleton";
import { buildPageMetadata } from "@/lib/seo/pageSeo";
import { PUBLIC_PAGE_COPY } from "@/lib/seo/publicPageMeta";

export const metadata = buildPageMetadata({
  path: "/features",
  title: PUBLIC_PAGE_COPY.features.title,
  description: PUBLIC_PAGE_COPY.features.description,
});

const LightFeaturesPage = dynamic(
  () =>
    import("@/components/marketing/features/LightFeaturesPage").then((m) => ({
      default: m.LightFeaturesPage,
    })),
  { loading: () => <MarketingSectionSkeleton minHeightClassName="min-h-[40rem]" /> },
);

export default function FeaturesPage(): React.ReactElement {
  return (
    <LightMarketingPageFrame>
      <MarketingNavbar />
      <LightFeaturesPage />
      <MarketingSiteFooter />
    </LightMarketingPageFrame>
  );
}
