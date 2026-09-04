import Image from "next/image";
import Link from "next/link";

import { helpGlassCard } from "@/components/help/helpGlassCard";
import { HELP_ARTICLE_IMAGES } from "@/lib/help/helpArticleImages";
import { HELP_HUB_TOPICS } from "@/lib/help/helpHubTopics";
import { getFeaturedHelpArticles, getHelpCategory } from "@/lib/help/helpQueries";
import { cn } from "@/lib/cn";

export function HelpHubTopics(): React.ReactElement {
  const featured = getFeaturedHelpArticles(6);

  return (
    <section className="mx-auto max-w-[1280px] px-4 py-20 sm:px-10 sm:py-24">
      <div className="mb-8 flex items-end justify-between gap-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#0058bc]">
            Browse
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-headline)] text-2xl font-semibold text-[#111827] sm:text-[2rem] sm:leading-10">
            Top categories
          </h2>
        </div>
        <Link
          href="/help/getting-started"
          className="hidden text-sm font-semibold text-[#0058bc] hover:underline sm:inline-flex"
        >
          Get started path →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {HELP_HUB_TOPICS.map((topic) => {
          const image = HELP_ARTICLE_IMAGES[topic.imageKey];
          const className = cn(
            helpGlassCard,
            "group flex h-full flex-col overflow-hidden rounded-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#0058bc]/35 hover:shadow-[0_18px_40px_rgba(0,88,188,0.08)]",
          );

          return (
            <Link key={topic.title} href={topic.href} className={className}>
              <div className="relative aspect-[4/3] overflow-hidden bg-[#EFF6FF]">
                {image ? (
                  <Image
                    src={image}
                    alt=""
                    className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    placeholder="blur"
                  />
                ) : null}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-base font-bold text-[#111827] group-hover:text-[#0058bc]">
                  {topic.title}
                </h3>
                <p className="mt-2 line-clamp-2 flex-grow text-sm leading-relaxed text-[#4B5563]">
                  {topic.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-16">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#0058bc]">
          Featured
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-headline)] text-2xl font-semibold text-[#111827] sm:text-[2rem] sm:leading-10">
          Start with these guides
        </h2>

        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((article) => {
            const category = getHelpCategory(article.categorySlug);

            return (
              <Link
                key={`${article.categorySlug}/${article.slug}`}
                href={`/help/${article.categorySlug}/${article.slug}`}
                className={cn(
                  helpGlassCard,
                  "group flex min-h-[12rem] flex-col rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#0058bc]/35 hover:shadow-[0_18px_40px_rgba(0,88,188,0.08)]",
                )}
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0058bc]">
                  {category?.title ?? "Guide"}
                </p>
                <h3 className="mt-4 text-base font-bold text-[#111827] group-hover:text-[#0058bc]">
                  {article.title}
                </h3>
                <p className="mt-2 line-clamp-3 flex-grow text-sm leading-relaxed text-[#4B5563]">
                  {article.summary}
                </p>
                <p className="mt-5 text-xs font-semibold text-[#4B5563]">{article.readTime}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
