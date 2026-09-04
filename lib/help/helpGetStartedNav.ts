import type { HelpArticle } from "@/lib/help/helpTypes";
import { getHelpArticle } from "@/lib/help/helpQueries";

export type HelpNavSection = {
  title: string;
  intro?: string;
  articleRefs: readonly { categorySlug: string; slug: string }[];
  extraLinks?: readonly { label: string; href: string }[];
};

function resolveArticles(
  refs: readonly { categorySlug: string; slug: string }[],
): HelpArticle[] {
  return refs
    .map((ref) => getHelpArticle(ref.categorySlug, ref.slug))
    .filter((article): article is HelpArticle => Boolean(article));
}

/**
 * Hootsuite-style get-started hub groups — only Postsiva guides that already exist.
 * @see https://help.hootsuite.com/s/article/get-started-nav
 */
export const GET_STARTED_NAV_SECTIONS: readonly HelpNavSection[] = [
  {
    title: "Get started",
    intro: "Create your account, verify email, then set up your first workspace.",
    articleRefs: [
      {
        categorySlug: "getting-started",
        slug: "create-account-login-and-verify-email",
      },
      { categorySlug: "getting-started", slug: "start-your-first-workspace" },
      { categorySlug: "getting-started", slug: "use-the-unified-dashboard" },
      { categorySlug: "workspaces-team", slug: "set-up-workspaces-and-switching" },
      { categorySlug: "workspaces-team", slug: "invite-teammates-and-set-access" },
    ],
  },
  {
    title: "Connect accounts",
    intro: "Link the networks you already publish on in Postsiva.",
    articleRefs: [
      { categorySlug: "social-accounts", slug: "connect-instagram-account" },
      { categorySlug: "social-accounts", slug: "connect-linkedin-account" },
      { categorySlug: "social-accounts", slug: "connect-facebook-account" },
      { categorySlug: "social-accounts", slug: "connect-tiktok-account" },
      { categorySlug: "social-accounts", slug: "connect-youtube-channel" },
      { categorySlug: "social-accounts", slug: "connect-threads-and-pinterest" },
      { categorySlug: "social-accounts", slug: "connect-bluesky-account" },
      { categorySlug: "social-accounts", slug: "connect-mastodon-account" },
    ],
  },
  {
    title: "Schedule and publish",
    intro: "Move from draft to calendar without leaving the unified workflow.",
    articleRefs: [
      { categorySlug: "scheduling-publishing", slug: "schedule-your-first-post" },
      { categorySlug: "scheduling-publishing", slug: "manage-your-calendar-and-queue" },
      { categorySlug: "managing-posts", slug: "use-the-unified-composer" },
      { categorySlug: "managing-posts", slug: "save-and-manage-drafts" },
      { categorySlug: "managing-posts", slug: "edit-a-scheduled-draft-safely" },
    ],
  },
  {
    title: "Media and AI",
    intro: "Pull creative assets in and use Postsiva AI tools safely.",
    articleRefs: [
      { categorySlug: "media-canva", slug: "connect-canva-and-cloud-media" },
      { categorySlug: "ai-automation", slug: "use-the-unified-inbox-and-bulk-ai-replies" },
      { categorySlug: "ai-automation", slug: "use-ai-toolkit-in-create-post" },
      { categorySlug: "ai-automation", slug: "use-postsiva-gpt-and-mcp" },
    ],
  },
  {
    title: "Plans and billing",
    intro: "Understand limits before you invite the whole team.",
    articleRefs: [
      { categorySlug: "billing-plans", slug: "understand-plans-and-billing" },
      { categorySlug: "billing-plans", slug: "understand-trials-limits-and-upgrades" },
    ],
  },
  {
    title: "Need help?",
    intro: "Fix the common blockers and reach support when you need a human.",
    articleRefs: [
      { categorySlug: "troubleshooting", slug: "fix-failed-account-connection" },
      { categorySlug: "troubleshooting", slug: "fix-a-post-that-wont-publish" },
      { categorySlug: "wordpress", slug: "self-hosted" },
    ],
    extraLinks: [
      { label: "Email support@postsiva.com", href: "mailto:support@postsiva.com" },
      {
        label: "Join Facebook community",
        href: "https://web.facebook.com/share/g/19BqD3HThw/",
      },
      { label: "Contact form", href: "/contact" },
    ],
  },
];

export function getGetStartedNavResolved(): {
  title: string;
  intro?: string;
  articles: HelpArticle[];
  extraLinks?: readonly { label: string; href: string }[];
}[] {
  return GET_STARTED_NAV_SECTIONS.map((section) => ({
    title: section.title,
    intro: section.intro,
    articles: resolveArticles(section.articleRefs),
    extraLinks: section.extraLinks,
  }));
}
