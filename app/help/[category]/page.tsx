import { notFound } from "next/navigation";

import { MarketingSiteFooter } from "@/components/marketing/MarketingSiteFooter";
import { HelpCenterFrame } from "@/components/help/HelpCenterFrame";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { HelpCategoryPage } from "@/components/help/HelpCategoryPage";
import { getHelpCategories, getHelpCategory } from "@/lib/help/helpQueries";
import { buildPageMetadata } from "@/lib/seo/pageSeo";

type Props = {
  params: Promise<{ category: string }>;
};

export async function generateStaticParams() {
  return getHelpCategories().map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { category } = await params;
  const item = getHelpCategory(category);
  if (!item) {
    return {};
  }

  return buildPageMetadata({
    path: `/help/${category}`,
    title: `${item.title} — Postsiva Help`,
    description: item.description,
    absoluteTitle: true,
  });
}

export default async function HelpCategoryRoute({
  params,
}: Props): Promise<React.ReactElement> {
  const { category } = await params;
  const item = getHelpCategory(category);

  if (!item) {
    notFound();
  }

  return (
    <HelpCenterFrame>
      <MarketingNavbar />
      <HelpCategoryPage category={item} />
      <MarketingSiteFooter />
    </HelpCenterFrame>
  );
}
