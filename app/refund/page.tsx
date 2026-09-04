import type { Metadata } from "next";
import dynamic from "next/dynamic";

import { MarketingSiteFooter } from "@/components/marketing/MarketingSiteFooter";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { LightMarketingPageFrame } from "@/components/marketing/light/LightMarketingPageFrame";
import { MarketingSectionSkeleton } from "@/components/marketing/MarketingSectionSkeleton";
import { buildPageMetadata } from "@/lib/seo/pageSeo";

export const metadata: Metadata = buildPageMetadata({
  path: "/refund",
  title: "Refund Policy — Postsiva",
  description:
    "Postsiva refund and cancellation policy for subscription plans, billing, and payment disputes.",
  absoluteTitle: true,
});

const LegalPageBody = dynamic(
  () =>
    import("@/components/marketing/legal/LegalPageBody").then((m) => ({
      default: m.LegalPageBody,
    })),
  { loading: () => <MarketingSectionSkeleton minHeightClassName="min-h-[40rem]" /> },
);

export default function Page(): React.ReactElement {
  return (
    <LightMarketingPageFrame>
      <MarketingNavbar />
      <main>
        <LegalPageBody
          docId="refund"
          eyebrowKey="marketing.legalEyebrow"
          titleKey="marketing.pageRefundTitle"
          descriptionKey="marketing.pageRefundDescription"
        />
      </main>
      <MarketingSiteFooter />
    </LightMarketingPageFrame>
  );
}
