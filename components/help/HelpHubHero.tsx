"use client";

import { Search } from "lucide-react";

import { HELP_HUB_POPULAR_SEARCHES } from "@/lib/help/helpHubTopics";
import { cn } from "@/lib/cn";

type HelpHubHeroProps = {
  readonly query: string;
  readonly onQueryChange: (value: string) => void;
};

export function HelpHubHero({
  query,
  onQueryChange,
}: HelpHubHeroProps): React.ReactElement {
  return (
    <section className="relative w-full overflow-hidden border-b border-[#E5E7EB] bg-white">
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-90"
        aria-hidden
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-10%,rgba(0,88,188,0.18),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.3),rgba(255,255,255,0.92)_50%,rgb(255,255,255)_100%)]" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,88,188,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(0,88,188,0.6) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex max-w-[1280px] flex-col items-center px-4 py-24 text-center sm:px-10 sm:py-28 lg:py-32">
        <span className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#0058bc]">
          Support Center
        </span>
        <h1 className="mb-8 max-w-2xl font-[family-name:var(--font-headline)] text-4xl font-bold leading-tight tracking-tight text-[#111827] sm:text-5xl lg:text-[3rem] lg:leading-[1.15]">
          How can we help you today?
        </h1>

        <form
          className="relative w-full max-w-2xl"
          role="search"
          onSubmit={(event) => event.preventDefault()}
        >
          <label htmlFor="help-hub-search" className="sr-only">
            Search help guides
          </label>
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#64748B]"
            aria-hidden
          />
          <input
            id="help-hub-search"
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search Instagram, schedule, drafts, team..."
            className={cn(
              "w-full rounded-xl border border-[#E5E7EB] bg-white py-4 pl-12 pr-4 text-base text-[#111827] shadow-[0_8px_30px_rgba(0,88,188,0.08)] outline-none transition-all",
              "placeholder:text-[#64748B] focus:border-[#0058bc] focus:ring-1 focus:ring-[#0058bc]",
            )}
          />
        </form>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-sm text-[#4B5563]">
          <span>Popular:</span>
          {HELP_HUB_POPULAR_SEARCHES.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => onQueryChange(term)}
              className="rounded-full border border-[#BFDBFE] bg-white px-3 py-1 text-[#0058bc] transition-colors hover:bg-[#EFF6FF]"
            >
              {term}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
