import type { Metadata } from "next";
import dynamic from "next/dynamic";

import { MarketingSiteFooter } from "@/components/marketing/MarketingSiteFooter";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { LightMarketingPageFrame } from "@/components/marketing/light/LightMarketingPageFrame";
import { MarketingSectionSkeleton } from "@/components/marketing/MarketingSectionSkeleton";
import { buildPageMetadata } from "@/lib/seo/pageSeo";

export const metadata: Metadata = buildPageMetadata({
  path: "/privacy",
  title: "Privacy Policy — Postsiva",
  description:
    "Learn how Postsiva collects, uses, and protects your personal data and connected social account information.",
  absoluteTitle: true,
});

const LegalPageBody = dynamic(
  () =>
    import("@/components/marketing/legal/LegalPageBody").then((m) => ({
      default: m.LegalPageBody,
    })),
  { loading: () => <MarketingSectionSkeleton minHeightClassName="min-h-[40rem]" /> },
);

export default function PrivacyPolicyPage(): React.ReactElement {
  return (
    <LightMarketingPageFrame>
      <MarketingNavbar />
      <main>
        <LegalPageBody
          docId="privacy"
          eyebrowKey="marketing.legalEyebrow"
          titleKey="marketing.pagePrivacyTitle"
          descriptionKey="marketing.pagePrivacyDescription"
        />
      </main>
      <MarketingSiteFooter />
    </LightMarketingPageFrame>
  );
}
