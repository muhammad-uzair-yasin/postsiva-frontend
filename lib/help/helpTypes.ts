export type HelpCategory = {
  slug: string;
  title: string;
  description: string;
  icon: string;
};

export type HelpStep = {
  title: string;
  body: string;
};

export type HelpSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  steps?: HelpStep[];
  note?: string;
  /** Key into HELP_ARTICLE_IMAGES for an inline screenshot. */
  imageKey?: string;
  imageAlt?: string;
};

export type HelpArticle = {
  slug: string;
  categorySlug: string;
  title: string;
  summary: string;
  keywords: string[];
  featured: boolean;
  readTime: string;
  updatedAt: string;
  body: HelpSection[];
  specialRenderer?: "wordpress-self-hosted" | "billing-plans-landing";
};
