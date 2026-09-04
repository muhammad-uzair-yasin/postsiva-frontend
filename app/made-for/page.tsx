import dynamic from "next/dynamic";

import { LightMarketingPageFrame } from "@/components/marketing/light/LightMarketingPageFrame";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { MarketingSectionSkeleton } from "@/components/marketing/MarketingSectionSkeleton";
import { MarketingSiteFooter } from "@/components/marketing/MarketingSiteFooter";
import { buildPageMetadata } from "@/lib/seo/pageSeo";
import { PUBLIC_PAGE_COPY } from "@/lib/seo/publicPageMeta";

export const metadata = buildPageMetadata({
  path: "/made-for",
  title: PUBLIC_PAGE_COPY.madeFor.title,
  description: PUBLIC_PAGE_COPY.madeFor.description,
});

const LightAudiencesPage = dynamic(
  () =>
    import("@/components/marketing/audiences/LightAudiencesPage").then((m) => ({
      default: m.LightAudiencesPage,
    })),
  { loading: () => <MarketingSectionSkeleton minHeightClassName="min-h-[40rem]" /> },
);

export default function AudiencesPage(): React.ReactElement {
  return (
    <LightMarketingPageFrame>
      <MarketingNavbar />
      <LightAudiencesPage />
      <MarketingSiteFooter />
    </LightMarketingPageFrame>
  );
}
