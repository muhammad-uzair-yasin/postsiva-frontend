import Link from "next/link";

import { getHelpCategories } from "@/lib/help/helpQueries";

type HelpSidebarProps = {
  activeCategorySlug?: string;
};

/** Left category nav for Help Center article/category pages. */
export function HelpSidebar({
  activeCategorySlug,
}: HelpSidebarProps): React.ReactElement {
  const categories = getHelpCategories();

  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-3 shadow-[0_4px_20px_-2px_rgba(0,88,188,0.05)]">
          <p className="px-3 pt-1 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-[#0058bc]">
            Categories
          </p>
          <nav aria-label="Help categories" className="mt-3 space-y-0.5">
            <Link
              href="/help"
              className="block rounded-xl px-3 py-2 text-sm font-medium text-[#4B5563] transition-colors hover:bg-[#EFF6FF] hover:text-[#111827]"
            >
              Help Center home
            </Link>
            {categories.map((category) => {
              const active = category.slug === activeCategorySlug;
              return (
                <Link
                  key={category.slug}
                  href={`/help/${category.slug}`}
                  className={`block rounded-xl px-3 py-2 text-sm transition-colors ${
                    active
                      ? "bg-[#0058bc]/10 font-semibold text-[#0058bc] ring-1 ring-[#0058bc]/20"
                      : "font-medium text-[#4B5563] hover:bg-[#EFF6FF] hover:text-[#111827]"
                  }`}
                >
                  {category.title}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
}
