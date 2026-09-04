import Link from "next/link";

import { HelpSidebar } from "@/components/help/HelpSidebar";
import { getArticlesByCategory } from "@/lib/help/helpQueries";
import { getGetStartedNavResolved } from "@/lib/help/helpGetStartedNav";
import type { HelpCategory } from "@/lib/help/helpTypes";

type HelpCategoryPageProps = {
  category: HelpCategory;
};

export function HelpCategoryPage({
  category,
}: HelpCategoryPageProps): React.ReactElement {
  const articles = getArticlesByCategory(category.slug);
  const isGetStartedHub = category.slug === "getting-started";
  const getStartedSections = isGetStartedHub ? getGetStartedNavResolved() : [];

  return (
    <main className="pb-24 pt-10 sm:pt-12">
      <div className="marketing-container flex gap-10">
        <HelpSidebar activeCategorySlug={category.slug} />

        <div className="min-w-0 flex-1">
          <nav aria-label="Breadcrumb" className="text-sm text-[#4B5563]">
            <Link href="/help" className="hover:text-[#0058bc]">
              Help Center
            </Link>
            <span className="px-2 text-[#9CA3AF]">/</span>
            <span className="text-[#111827]">{category.title}</span>
          </nav>

          <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.22em] text-[#0058bc]">
            Category
          </p>
          <h1 className="mt-2 text-balance font-[family-name:var(--font-headline)] text-3xl font-black tracking-tight text-[#111827] sm:text-4xl">
            {isGetStartedHub ? "Get started help articles" : category.title}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#4B5563]">
            {isGetStartedHub
              ? "The following guides can help you get started with Postsiva — using the same topics already covered in this Help Center."
              : category.description}
          </p>
          <p className="mt-3 text-sm text-[#4B5563]">
            Updated {articles[0]?.updatedAt ?? "2026-08-06"}
          </p>

          {isGetStartedHub ? (
            <div className="mt-10 space-y-8">
              {getStartedSections.map((section) => (
                <section
                  key={section.title}
                  className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6"
                >
                  <h2 className="font-[family-name:var(--font-headline)] text-xl font-bold text-[#111827] sm:text-2xl">
                    {section.title}
                  </h2>
                  {section.intro ? (
                    <p className="mt-2 text-sm text-[#4B5563]">{section.intro}</p>
                  ) : null}
                  <ul className="mt-5 space-y-2">
                    {section.articles.map((article) => (
                      <li key={`${article.categorySlug}/${article.slug}`}>
                        <Link
                          href={`/help/${article.categorySlug}/${article.slug}`}
                          className="group flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[#EFF6FF]"
                        >
                          <span
                            className="mt-0.5 text-[#0058bc] transition-transform group-hover:translate-x-0.5"
                            aria-hidden
                          >
                            ›
                          </span>
                          <span className="text-sm font-medium text-[#111827] group-hover:text-[#0058bc]">
                            {article.title}
                          </span>
                        </Link>
                      </li>
                    ))}
                    {section.extraLinks?.map((link) => {
                      const external =
                        link.href.startsWith("http") || link.href.startsWith("mailto:");
                      const className =
                        "group flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[#EFF6FF]";
                      const inner = (
                        <>
                          <span className="mt-0.5 text-[#0058bc]" aria-hidden>
                            ›
                          </span>
                          <span className="text-sm font-medium text-[#111827] group-hover:text-[#0058bc]">
                            {link.label}
                          </span>
                        </>
                      );
                      return (
                        <li key={link.href}>
                          {external ? (
                            <a
                              href={link.href}
                              className={className}
                              {...(link.href.startsWith("http")
                                ? { target: "_blank", rel: "noopener noreferrer" }
                                : {})}
                            >
                              {inner}
                            </a>
                          ) : (
                            <Link href={link.href} className={className}>
                              {inner}
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          ) : (
            <div className="mt-10">
              <h2 className="font-[family-name:var(--font-headline)] text-xl font-bold text-[#111827]">
                Articles in this category
              </h2>
              <ul className="mt-5 grid gap-3">
                {articles.map((article) => (
                  <li key={article.slug}>
                    <Link
                      href={`/help/${article.categorySlug}/${article.slug}`}
                      className="group block rounded-2xl border border-[#E5E7EB] bg-white p-5 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-[#0058bc]/30"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-base font-bold text-[#111827] group-hover:text-[#0058bc]">
                          {article.title}
                        </h3>
                        <span className="shrink-0 text-xs text-[#4B5563]">
                          {article.readTime}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-[#4B5563]">
                        {article.summary}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
