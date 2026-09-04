import type { Metadata } from "next";
import dynamic from "next/dynamic";

import { MarketingSiteFooter } from "@/components/marketing/MarketingSiteFooter";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { LightMarketingPageFrame } from "@/components/marketing/light/LightMarketingPageFrame";
import { MarketingSectionSkeleton } from "@/components/marketing/MarketingSectionSkeleton";
import { buildPageMetadata } from "@/lib/seo/pageSeo";

export const metadata: Metadata = buildPageMetadata({
  path: "/referral-policy",
  title: "Referral Program Policy — Postsiva",
  description:
    "Postsiva Refer & Earn rules: cash rewards, Pro milestone, withdrawals, and prohibited conduct.",
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
          docId="referral"
          eyebrowKey="marketing.legalEyebrow"
          titleKey="marketing.pageReferralTitle"
          descriptionKey="marketing.pageReferralDescription"
        />
      </main>
      <MarketingSiteFooter />
    </LightMarketingPageFrame>
  );
}
