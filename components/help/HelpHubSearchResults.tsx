"use client";

import Link from "next/link";

import { helpGlassCard } from "@/components/help/helpGlassCard";
import type { HelpArticle, HelpCategory } from "@/lib/help/helpTypes";
import { cn } from "@/lib/cn";

type HelpHubSearchResultsProps = {
  readonly query: string;
  readonly results: readonly HelpArticle[];
  readonly categories: readonly HelpCategory[];
  readonly onClear: () => void;
  readonly onSuggestSearch: (value: string) => void;
};

export function HelpHubSearchResults({
  query,
  results,
  categories,
  onClear,
  onSuggestSearch,
}: HelpHubSearchResultsProps): React.ReactElement {
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-16 sm:px-10 sm:py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-[#0058bc]">
            Search
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-headline)] text-2xl font-semibold text-[#111827]">
            Results for &ldquo;{query.trim()}&rdquo;
          </h2>
          <p className="mt-1 text-sm text-[#4B5563]">
            {results.length} guide{results.length === 1 ? "" : "s"} found
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="rounded-xl border border-[#BFDBFE] px-4 py-2 text-sm font-medium text-[#0058bc] transition-colors hover:bg-[#EFF6FF]"
        >
          Clear search
        </button>
      </div>

      <div className="mt-8 grid gap-4">
        {results.map((article) => (
          <Link
            key={`${article.categorySlug}/${article.slug}`}
            href={`/help/${article.categorySlug}/${article.slug}`}
            className={cn(
              helpGlassCard,
              "group block rounded-xl p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#0058bc]/35 hover:shadow-[0_18px_40px_rgba(0,88,188,0.08)]",
            )}
          >
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0058bc]">
              {categories.find((item) => item.slug === article.categorySlug)?.title ??
                article.categorySlug.replaceAll("-", " ")}
            </p>
            <h3 className="mt-2 text-lg font-semibold text-[#111827] group-hover:text-[#0058bc]">
              {article.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#4B5563]">
              {article.summary}
            </p>
          </Link>
        ))}

        {results.length === 0 ? (
          <div
            className={cn(
              helpGlassCard,
              "rounded-xl border-dashed p-10 text-center text-[#4B5563]",
            )}
          >
            No matching guides yet. Try searching for{" "}
            <button
              type="button"
              className="font-semibold text-[#0058bc] hover:underline"
              onClick={() => onSuggestSearch("Billing")}
            >
              Billing
            </button>
            ,{" "}
            <button
              type="button"
              className="font-semibold text-[#0058bc] hover:underline"
              onClick={() => onSuggestSearch("Instagram")}
            >
              Instagram
            </button>
            , or browse topics below.
          </div>
        ) : null}
      </div>
    </section>
  );
}
