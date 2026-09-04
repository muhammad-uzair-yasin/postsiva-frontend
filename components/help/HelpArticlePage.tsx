import Image from "next/image";
import Link from "next/link";

import { HelpArticleFeedback } from "@/components/help/HelpArticleFeedback";
import { HelpPlansFromLanding } from "@/components/help/HelpPlansFromLanding";
import { HelpSidebar } from "@/components/help/HelpSidebar";
import { WordPressSelfHostedHelpContent } from "@/components/help/WordPressSelfHostedHelpContent";
import { HELP_ARTICLE_IMAGES } from "@/lib/help/helpArticleImages";
import {
  getArticlesByCategory,
  getHelpCategory,
  getRelatedHelpArticles,
} from "@/lib/help/helpQueries";
import {
  HELP_FACEBOOK_COMMUNITY_URL,
  HELP_SUPPORT_EMAIL,
  HELP_SUPPORT_MAILTO,
} from "@/lib/help/helpSupportLinks";
import type { HelpArticle } from "@/lib/help/helpTypes";

type HelpArticlePageProps = {
  article: HelpArticle;
};

export function HelpArticlePage({
  article,
}: HelpArticlePageProps): React.ReactElement {
  const category = getHelpCategory(article.categorySlug);
  const related = getRelatedHelpArticles(article);
  const siblings = getArticlesByCategory(article.categorySlug).filter(
    (item) => item.slug !== article.slug,
  );

  return (
    <main className="pb-24 pt-10 sm:pt-12">
      <div className="marketing-container flex gap-10">
        <HelpSidebar activeCategorySlug={article.categorySlug} />

        <div className="min-w-0 flex-1">
          <nav aria-label="Breadcrumb" className="text-sm text-[#4B5563]">
            <Link href="/help" className="hover:text-[#0058bc]">
              Help Center
            </Link>
            <span className="px-2 text-[#9CA3AF]">/</span>
            {category ? (
              <>
                <Link href={`/help/${category.slug}`} className="hover:text-[#0058bc]">
                  {category.title}
                </Link>
                <span className="px-2 text-[#9CA3AF]">/</span>
              </>
            ) : null}
            <span className="text-[#111827]">{article.title}</span>
          </nav>

          <header className="mt-6 rounded-3xl border border-[#E5E7EB] bg-white p-6 sm:p-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#0058bc]">
              {category?.title ?? "Guide"}
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-headline)] text-3xl font-black tracking-tight text-[#111827] sm:text-4xl">
              {article.title}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#4B5563]">
              {article.summary}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-xs font-medium text-[#4B5563]">
                {article.readTime}
              </span>
              <span className="rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-xs font-medium text-[#4B5563]">
                Updated {article.updatedAt}
              </span>
            </div>
          </header>

          {article.specialRenderer === "wordpress-self-hosted" ? (
            <div className="mt-10">
              <WordPressSelfHostedHelpContent />
            </div>
          ) : article.specialRenderer === "billing-plans-landing" ? (
            <div className="mt-10 space-y-10">
              <section>
                <h2 className="font-[family-name:var(--font-headline)] text-xl font-bold tracking-tight text-[#111827] sm:text-2xl">
                  Free, Starter, and Pro
                </h2>
                <HelpPlansFromLanding />
              </section>
              {article.body.map((section) => (
                <section key={section.title} className="scroll-mt-28">
                  <h2 className="font-[family-name:var(--font-headline)] text-xl font-bold tracking-tight text-[#111827] sm:text-2xl">
                    {section.title}
                  </h2>
                  {section.paragraphs?.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="mt-4 text-sm leading-7 text-[#4B5563] sm:text-base"
                    >
                      {paragraph}
                    </p>
                  ))}
                  {section.bullets?.length ? (
                    <ul className="mt-5 grid gap-3">
                      {section.bullets.map((bullet) => (
                        <li
                          key={bullet}
                          className="flex gap-3 text-sm leading-7 text-[#4B5563]"
                        >
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0058bc]" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {section.steps?.length ? (
                    <ol className="mt-5 grid gap-4">
                      {section.steps.map((step, index) => (
                        <li
                          key={step.title}
                          className="flex gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-4"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0058bc]/15 text-sm font-bold text-[#0058bc] ring-1 ring-[#0058bc]/25">
                            {index + 1}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-[#111827]">{step.title}</p>
                            <p className="mt-1 text-sm leading-7 text-[#4B5563]">
                              {step.body}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  ) : null}
                  {section.imageKey && HELP_ARTICLE_IMAGES[section.imageKey] ? (
                    <div className="mt-6 flex justify-center overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_16px_40px_-24px_rgba(0,0,0,0.55)]">
                      <Image
                        src={HELP_ARTICLE_IMAGES[section.imageKey]}
                        alt={section.imageAlt ?? section.title}
                        className="mx-auto h-auto max-h-[min(70vh,28rem)] w-full max-w-full object-contain object-top"
                        sizes="(max-width: 768px) 100vw, 720px"
                        placeholder="blur"
                      />
                    </div>
                  ) : null}
                  {section.note ? (
                    <p className="mt-5 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3 text-sm leading-7 text-[#4B5563]">
                      {section.note}
                    </p>
                  ) : null}
                </section>
              ))}
            </div>
          ) : (
            <article className="mt-10 text-[#111827]">
              <div className="grid gap-10">
                {article.body.map((section) => (
                  <section key={section.title} className="scroll-mt-28">
                    <h2 className="font-[family-name:var(--font-headline)] text-xl font-bold tracking-tight text-[#111827] sm:text-2xl">
                      {section.title}
                    </h2>
                    {section.paragraphs?.map((paragraph) => (
                      <p
                        key={paragraph}
                        className="mt-4 text-sm leading-7 text-[#4B5563] sm:text-base"
                      >
                        {paragraph}
                      </p>
                    ))}
                    {section.bullets?.length ? (
                      <ul className="mt-5 grid gap-3">
                        {section.bullets.map((bullet) => (
                          <li
                            key={bullet}
                            className="flex gap-3 text-sm leading-7 text-[#4B5563]"
                          >
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0058bc]" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {section.steps?.length ? (
                      <ol className="mt-5 grid gap-4">
                        {section.steps.map((step, index) => (
                          <li
                            key={step.title}
                            className="flex gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-4"
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0058bc]/15 text-sm font-bold text-[#0058bc] ring-1 ring-[#0058bc]/25">
                              {index + 1}
                            </span>
                            <div>
                              <p className="text-sm font-semibold text-[#111827]">
                                {step.title}
                              </p>
                              <p className="mt-1 text-sm leading-7 text-[#4B5563]">
                                {step.body}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ol>
                    ) : null}
                    {section.imageKey && HELP_ARTICLE_IMAGES[section.imageKey] ? (
                      <div className="mt-6 flex justify-center overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_16px_40px_-24px_rgba(0,0,0,0.55)]">
                        <Image
                          src={HELP_ARTICLE_IMAGES[section.imageKey]}
                          alt={section.imageAlt ?? section.title}
                          className="mx-auto h-auto max-h-[min(70vh,28rem)] w-full max-w-full object-contain object-top"
                          sizes="(max-width: 768px) 100vw, 720px"
                          placeholder="blur"
                        />
                      </div>
                    ) : null}
                    {section.note ? (
                      <p className="mt-5 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3 text-sm leading-7 text-[#4B5563]">
                        {section.note}
                      </p>
                    ) : null}
                  </section>
                ))}
              </div>
            </article>
          )}

          <HelpArticleFeedback />

          {siblings.length ? (
            <div className="mt-12">
              <h2 className="font-[family-name:var(--font-headline)] text-lg font-bold text-[#111827]">
                More in this category
              </h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {siblings.slice(0, 6).map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/help/${item.categorySlug}/${item.slug}`}
                      className="block rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-medium text-[#111827] transition-colors hover:border-[#0058bc]/30 hover:text-[#0058bc]"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {related.length ? (
            <div className="mt-12">
              <h2 className="font-[family-name:var(--font-headline)] text-lg font-bold text-[#111827]">
                Related guides
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((item) => (
                  <Link
                    key={`${item.categorySlug}/${item.slug}`}
                    href={`/help/${item.categorySlug}/${item.slug}`}
                    className="group rounded-2xl border border-[#E5E7EB] bg-white p-4 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-[#0058bc]/30"
                  >
                    <h3 className="text-sm font-bold text-[#111827] group-hover:text-[#0058bc]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-[#4B5563]">
                      {item.summary}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-12 flex flex-wrap gap-3">
            <Link
              href={category ? `/help/${category.slug}` : "/help"}
              className="inline-flex items-center rounded-full border border-[#BFDBFE] bg-white px-5 py-2.5 text-sm font-semibold text-[#111827] transition-colors hover:border-[#0058bc]/35 hover:text-[#0058bc]"
            >
              Back to {category?.title ?? "Help Center"}
            </Link>
            <a
              href={HELP_SUPPORT_MAILTO}
              className="inline-flex items-center rounded-full bg-[#0058bc] px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
            >
              Email {HELP_SUPPORT_EMAIL}
            </a>
            <a
              href={HELP_FACEBOOK_COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full border border-[#BFDBFE] bg-white px-5 py-2.5 text-sm font-semibold text-[#111827] transition-colors hover:border-[#0058bc]/35 hover:text-[#0058bc]"
            >
              Join Facebook community
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
