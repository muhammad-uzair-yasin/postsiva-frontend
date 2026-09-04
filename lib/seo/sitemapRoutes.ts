import { MADE_FOR_AUDIENCES } from "@/components/marketing/landingMadeFor";
import { HELP_ARTICLES, HELP_CATEGORIES } from "@/lib/help/helpContent";
import {
  POSTSIVA_PRIVACY_POLICY_URL,
  POSTSIVA_REFERRAL_POLICY_URL,
  POSTSIVA_REFUND_POLICY_URL,
  POSTSIVA_TERMS_OF_SERVICE_URL,
} from "@/lib/legalLinks";
import { COMPETITOR_COMPARISONS } from "@/lib/marketing/comparisons";

/** Core marketing paths (empty string = home). */
export const CORE_PUBLIC_PATHS = [
  "",
  "/about",
  "/contact",
  "/comparisons",
  "/features",
  "/how-it-works",
  "/integrations-explore",
  "/made-for",
  "/help",
  "/llm.txt",
  "/llms.txt",
  "/pricing",
  POSTSIVA_PRIVACY_POLICY_URL,
  POSTSIVA_TERMS_OF_SERVICE_URL,
  POSTSIVA_REFUND_POLICY_URL,
  POSTSIVA_REFERRAL_POLICY_URL,
] as const;

/** All indexable public paths for sitemap generation and SEO tests. */
export function getPublicSitemapPaths(): readonly string[] {
  return [
    ...CORE_PUBLIC_PATHS,
    ...COMPETITOR_COMPARISONS.map((c) => `/comparisons/${c.slug}`),
    ...MADE_FOR_AUDIENCES.map((a) => `/made-for/${a.slug}`),
    ...HELP_CATEGORIES.map((c) => `/help/${c.slug}`),
    ...HELP_ARTICLES.map((a) => `/help/${a.categorySlug}/${a.slug}`),
  ];
}

/** Paths that must appear in sitemap for regression tests. */
export const REQUIRED_SITEMAP_SAMPLES = [
  "",
  "/about",
  "/how-it-works",
  "/help",
  "/privacy",
  "/made-for/creators",
  "/integrations-explore",
  "/comparisons/buffer",
] as const;
