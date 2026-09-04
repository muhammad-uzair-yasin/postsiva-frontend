import dynamic from "next/dynamic";

import { MarketingSiteFooter } from "@/components/marketing/MarketingSiteFooter";
import { HelpCenterFrame } from "@/components/help/HelpCenterFrame";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { MarketingSectionSkeleton } from "@/components/marketing/MarketingSectionSkeleton";
import { buildPageMetadata } from "@/lib/seo/pageSeo";
import { PUBLIC_PAGE_COPY } from "@/lib/seo/publicPageMeta";

export const metadata = buildPageMetadata({
  path: "/help",
  title: PUBLIC_PAGE_COPY.help.title,
  description: PUBLIC_PAGE_COPY.help.description,
});

const HelpHubPage = dynamic(
  () =>
    import("@/components/help/HelpHubPage").then((m) => ({
      default: m.HelpHubPage,
    })),
  { loading: () => <MarketingSectionSkeleton minHeightClassName="min-h-[32rem]" /> },
);

export default function HelpPage(): React.ReactElement {
  return (
    <HelpCenterFrame>
      <MarketingNavbar />
      <HelpHubPage />
      <MarketingSiteFooter />
    </HelpCenterFrame>
  );
}
