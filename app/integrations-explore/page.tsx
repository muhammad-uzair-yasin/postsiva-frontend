import dynamic from "next/dynamic";

import { LightMarketingPageFrame } from "@/components/marketing/light/LightMarketingPageFrame";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { MarketingSectionSkeleton } from "@/components/marketing/MarketingSectionSkeleton";
import { MarketingSiteFooter } from "@/components/marketing/MarketingSiteFooter";
import { buildPageMetadata } from "@/lib/seo/pageSeo";
import { PUBLIC_PAGE_COPY } from "@/lib/seo/publicPageMeta";

export const metadata = buildPageMetadata({
  path: "/integrations-explore",
  title: PUBLIC_PAGE_COPY.integrations.title,
  description: PUBLIC_PAGE_COPY.integrations.description,
});

const LightIntegrationsPage = dynamic(
  () =>
    import("@/components/marketing/integrations/LightIntegrationsPage").then((m) => ({
      default: m.LightIntegrationsPage,
    })),
  { loading: () => <MarketingSectionSkeleton minHeightClassName="min-h-[40rem]" /> },
);

export default function IntegrationsPage(): React.ReactElement {
  return (
    <LightMarketingPageFrame>
      <MarketingNavbar />
      <LightIntegrationsPage />
      <MarketingSiteFooter />
    </LightMarketingPageFrame>
  );
}
