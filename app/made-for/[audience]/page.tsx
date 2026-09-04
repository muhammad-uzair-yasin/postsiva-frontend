import { LightMarketingPageFrame } from "@/components/marketing/light/LightMarketingPageFrame";
import { LightAudienceDetailPage } from "@/components/marketing/audiences/LightAudienceDetailPage";
import {
  getMadeForAudience,
  MADE_FOR_AUDIENCES,
} from "@/components/marketing/landingMadeFor";
import { MarketingSiteFooter } from "@/components/marketing/MarketingSiteFooter";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { notFound } from "next/navigation";

import { buildPageMetadata } from "@/lib/seo/pageSeo";

type Props = {
  params: Promise<{ audience: string }>;
};

export async function generateStaticParams() {
  return MADE_FOR_AUDIENCES.map((audience) => ({ audience: audience.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { audience } = await params;
  const item = getMadeForAudience(audience);
  if (!item) return {};

  return buildPageMetadata({
    path: `/made-for/${audience}`,
    title: `Postsiva for ${item.title}`,
    description: item.description,
    absoluteTitle: true,
  });
}

export default async function MadeForAudiencePage({
  params,
}: Props): Promise<React.ReactElement> {
  const { audience } = await params;
  const item = getMadeForAudience(audience);
  if (!item) notFound();

  return (
    <LightMarketingPageFrame>
      <MarketingNavbar />
      <LightAudienceDetailPage audience={item} />
      <MarketingSiteFooter />
    </LightMarketingPageFrame>
  );
}
