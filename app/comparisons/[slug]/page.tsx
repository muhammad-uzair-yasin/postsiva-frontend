import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LightComparisonDetailPage } from "@/components/marketing/comparisons/LightComparisonDetailPage";
import { LightMarketingPageFrame } from "@/components/marketing/light/LightMarketingPageFrame";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { MarketingSiteFooter } from "@/components/marketing/MarketingSiteFooter";
import {
  COMPETITOR_COMPARISONS,
  getComparison,
} from "@/lib/marketing/comparisons";
import { buildPageMetadata } from "@/lib/seo/pageSeo";

type Props = {
  readonly params: Promise<{ slug: string }>;
};

export function generateStaticParams(): { slug: string }[] {
  return COMPETITOR_COMPARISONS.map((comparison) => ({ slug: comparison.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const comparison = getComparison(slug);
  if (!comparison) {
    return {};
  }

  return buildPageMetadata({
    path: `/comparisons/${slug}`,
    title: `${comparison.headline} — Postsiva`,
    description: comparison.postsivaEdge,
    absoluteTitle: true,
  });
}

export default async function ComparisonDetailPage({
  params,
}: Props): Promise<React.ReactElement> {
  const { slug } = await params;
  const comparison = getComparison(slug);
  if (!comparison) notFound();

  return (
    <LightMarketingPageFrame>
      <MarketingNavbar />
      <LightComparisonDetailPage comparison={comparison} />
      <MarketingSiteFooter />
    </LightMarketingPageFrame>
  );
}
