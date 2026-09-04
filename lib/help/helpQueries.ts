import { HELP_ARTICLES, HELP_CATEGORIES } from "@/lib/help/helpContent";
import type { HelpArticle, HelpCategory } from "@/lib/help/helpTypes";

export function getHelpCategories(): readonly HelpCategory[] {
  return HELP_CATEGORIES;
}

export function getHelpCategory(slug: string): HelpCategory | undefined {
  return HELP_CATEGORIES.find((category) => category.slug === slug);
}

export function getHelpArticles(): readonly HelpArticle[] {
  return HELP_ARTICLES;
}

export function getHelpArticle(
  categorySlug: string,
  slug: string,
): HelpArticle | undefined {
  return HELP_ARTICLES.find(
    (article) => article.categorySlug === categorySlug && article.slug === slug,
  );
}

export function getArticlesByCategory(categorySlug: string): HelpArticle[] {
  return HELP_ARTICLES.filter((article) => article.categorySlug === categorySlug);
}

export function getFeaturedHelpArticles(limit = 6): HelpArticle[] {
  return HELP_ARTICLES.filter((article) => article.featured).slice(0, limit);
}

export function getPopularHelpArticles(limit = 6): HelpArticle[] {
  return [...HELP_ARTICLES]
    .sort((a, b) => {
      const aScore = Number(a.featured) * 100 + a.keywords.length;
      const bScore = Number(b.featured) * 100 + b.keywords.length;
      return bScore - aScore;
    })
    .slice(0, limit);
}

export function getRecentlyUpdatedHelpArticles(limit = 6): HelpArticle[] {
  return [...HELP_ARTICLES]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, limit);
}

export function searchHelpArticles(
  query: string,
  categorySlug?: string,
): HelpArticle[] {
  const normalized = query.trim().toLowerCase();
  const base = categorySlug
    ? HELP_ARTICLES.filter((article) => article.categorySlug === categorySlug)
    : [...HELP_ARTICLES];
  if (!normalized) return base;

  const scored = base
    .map((article) => {
      let score = 0;
      const title = article.title.toLowerCase();
      const summary = article.summary.toLowerCase();
      const keywords = article.keywords.map((keyword) => keyword.toLowerCase());
      const bodyText = article.body
        .flatMap((section) => [
          section.title,
          ...(section.paragraphs ?? []),
          ...(section.bullets ?? []),
          ...(section.steps?.flatMap((step) => [step.title, step.body]) ?? []),
          section.note ?? "",
        ])
        .join(" ")
        .toLowerCase();

      if (title.includes(normalized)) score += 12;
      if (summary.includes(normalized)) score += 7;
      if (keywords.some((keyword) => keyword.includes(normalized))) score += 10;
      if (bodyText.includes(normalized)) score += 3;
      if (article.featured) score += 1;

      return { article, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.article.title.localeCompare(b.article.title));

  return scored.map((entry) => entry.article);
}

export function getRelatedHelpArticles(
  article: HelpArticle,
  limit = 3,
): HelpArticle[] {
  return HELP_ARTICLES.filter(
    (candidate) =>
      candidate.slug !== article.slug &&
      (candidate.categorySlug === article.categorySlug ||
        candidate.keywords.some((keyword) => article.keywords.includes(keyword))),
  ).slice(0, limit);
}
