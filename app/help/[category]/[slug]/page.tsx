import { notFound } from "next/navigation";

import { MarketingSiteFooter } from "@/components/marketing/MarketingSiteFooter";
import { HelpCenterFrame } from "@/components/help/HelpCenterFrame";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { HelpArticlePage } from "@/components/help/HelpArticlePage";
import { getHelpArticle, getHelpArticles } from "@/lib/help/helpQueries";
import { buildPageMetadata } from "@/lib/seo/pageSeo";

type Props = {
  params: Promise<{ category: string; slug: string }>;
};

export async function generateStaticParams() {
  return getHelpArticles().map((article) => ({
    category: article.categorySlug,
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { category, slug } = await params;
  const article = getHelpArticle(category, slug);
  if (!article) {
    return {};
  }

  return buildPageMetadata({
    path: `/help/${category}/${slug}`,
    title: `${article.title} — Postsiva Help`,
    description: article.summary,
    absoluteTitle: true,
  });
}

export default async function HelpArticleRoute({
  params,
}: Props): Promise<React.ReactElement> {
  const { category, slug } = await params;
  const article = getHelpArticle(category, slug);

  if (!article) {
    notFound();
  }

  return (
    <HelpCenterFrame>
      <MarketingNavbar />
      <HelpArticlePage article={article} />
      <MarketingSiteFooter />
    </HelpCenterFrame>
  );
}
