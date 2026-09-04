import dynamic from "next/dynamic";

import { HelpCenterFrame } from "@/components/help/HelpCenterFrame";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { MarketingSiteFooter } from "@/components/marketing/MarketingSiteFooter";
import { MarketingSectionSkeleton } from "@/components/marketing/MarketingSectionSkeleton";
import { buildPageMetadata } from "@/lib/seo/pageSeo";
import { PUBLIC_PAGE_COPY } from "@/lib/seo/publicPageMeta";

export const metadata = buildPageMetadata({
  path: "/contact",
  title: PUBLIC_PAGE_COPY.contact.title,
  description: PUBLIC_PAGE_COPY.contact.description,
});

const LightContactPage = dynamic(
  () =>
    import("@/components/marketing/contact/LightContactPage").then((m) => ({
      default: m.LightContactPage,
    })),
  { loading: () => <MarketingSectionSkeleton minHeightClassName="min-h-[36rem]" /> },
);

export default function ContactPage(): React.ReactElement {
  return (
    <HelpCenterFrame>
      <MarketingNavbar />
      <LightContactPage />
      <MarketingSiteFooter />
    </HelpCenterFrame>
  );
}
