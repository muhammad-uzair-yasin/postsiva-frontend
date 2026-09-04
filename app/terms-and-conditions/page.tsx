import type { Metadata } from "next";
import dynamic from "next/dynamic";

import { MarketingSiteFooter } from "@/components/marketing/MarketingSiteFooter";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { LightMarketingPageFrame } from "@/components/marketing/light/LightMarketingPageFrame";
import { MarketingSectionSkeleton } from "@/components/marketing/MarketingSectionSkeleton";
import { buildPageMetadata } from "@/lib/seo/pageSeo";

export const metadata: Metadata = buildPageMetadata({
  path: "/terms-and-conditions",
  title: "Terms and Conditions — Postsiva",
  description:
    "Postsiva Terms of Service — rules governing your use of our social media management platform.",
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
          docId="terms"
          eyebrowKey="marketing.legalEyebrow"
          titleKey="marketing.pageTermsTitle"
          descriptionKey="marketing.pageTermsDescription"
        />
      </main>
      <MarketingSiteFooter />
    </LightMarketingPageFrame>
  );
}
