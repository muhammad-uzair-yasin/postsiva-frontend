"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import {
  normalizeFeedUrl,
  SUGGESTED_RSS_FEEDS,
  type SuggestedFeedCategory,
  type SuggestedFeedCountry,
} from "@/lib/news/suggestedRssFeeds";
import type { RssFeed } from "../../_hooks/useRssFeeds";

interface RssSuggestedFeedsProps {
  open: boolean;
  feeds: RssFeed[];
  onClose: () => void;
  isAdding: boolean;
  onSubscribe: (input: { name: string; url: string }) => Promise<void>;
}

type CountryFilter = "all" | SuggestedFeedCountry;
type CategoryFilter = "all" | SuggestedFeedCategory;

const COUNTRY_OPTIONS: { id: CountryFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "global", label: "Global" },
  { id: "pk", label: "Pakistan" },
  { id: "usa", label: "USA" },
  { id: "ba", label: "Bosnia" },
  { id: "gb", label: "UK" },
  { id: "ca", label: "Canada" },
  { id: "au", label: "Australia" },
  { id: "jp", label: "Japan" },
  { id: "de", label: "Germany" },
  { id: "fr", label: "France" },
  { id: "sa", label: "Saudi Arabia" },
  { id: "tr", label: "Turkey" },
  { id: "sg", label: "Singapore" },
  { id: "ng", label: "Nigeria" },
  { id: "ps", label: "Palestine" },
  { id: "hr", label: "Croatia" },
  { id: "rs", label: "Serbia" },
  { id: "me", label: "Montenegro" },
  { id: "al", label: "Albania" },
  { id: "xk", label: "Kosovo" },
  { id: "id", label: "Indonesia" },
  { id: "my", label: "Malaysia" },
  { id: "bd", label: "Bangladesh" },
  { id: "eg", label: "Egypt" },
  { id: "ma", label: "Morocco" },
];

const CATEGORY_OPTIONS: { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "All categories" },
  { id: "news", label: "News" },
  { id: "business", label: "Business" },
  { id: "finance", label: "Finance" },
  { id: "technology", label: "Technology" },
  { id: "ai", label: "AI" },
  { id: "marketing", label: "Marketing" },
  { id: "science", label: "Science" },
  { id: "sports", label: "Sports" },
  { id: "entertainment", label: "Entertainment" },
  { id: "health", label: "Health" },
  { id: "travel", label: "Travel" },
  { id: "design", label: "Design" },
  { id: "development", label: "Development" },
];

function getFeedLogoUrl(feedUrl: string): string | null {
  try {
    const host = new URL(feedUrl).hostname;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`;
  } catch {
    return null;
  }
}

export function RssSuggestedFeeds({
  open,
  feeds,
  onClose,
  isAdding,
  onSubscribe,
}: RssSuggestedFeedsProps): React.ReactElement | null {
  const titleId = useId();
  const [country, setCountry] = useState<CountryFilter>("all");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [success, setSuccess] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const root = typeof document !== "undefined" ? document.body : null;
  const subscribedByUrl = new Map(
    feeds.map((f) => [normalizeFeedUrl(f.url), f] as const),
  );
  const visibleFeeds = useMemo(
    () =>
      SUGGESTED_RSS_FEEDS.filter(
        (feed) =>
          (country === "all" || feed.country === country) &&
          (category === "all" || feed.category === category),
      ),
    [country, category],
  );
  const totalFeedCount = SUGGESTED_RSS_FEEDS.length;
  const visibleFeedCount = visibleFeeds.length;

  const handleCountryChange = (nextCountry: CountryFilter): void => {
    setCountry(nextCountry);
    setSuccess(null);
    setLocalError(null);
  };

  const handleCategoryChange = (nextCategory: CategoryFilter): void => {
    setCategory(nextCategory);
    setSuccess(null);
    setLocalError(null);
  };

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape" && !isAdding) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, isAdding]);

  if (!open || !root) return null;

  const handleClose = (): void => {
    setSuccess(null);
    setLocalError(null);
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isAdding) handleClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex h-[80vh] w-[80vw] max-w-[80vw] flex-col rounded-2xl border border-outline-variant/15 bg-surface-container-low shadow-2xl max-md:h-[88vh] max-md:w-[calc(100vw-2rem)] max-md:max-w-[calc(100vw-2rem)]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-outline-variant/10 px-5 py-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 id={titleId} className="text-base font-semibold text-on-surface">
                Available RSS Feeds
              </h2>
              <span className="rounded-full border border-outline-variant/20 bg-surface-container-high px-2 py-0.5 text-xs font-medium text-on-surface-variant">
                {visibleFeedCount === totalFeedCount
                  ? `${totalFeedCount} total`
                  : `${visibleFeedCount} of ${totalFeedCount}`}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-on-surface-variant">
              Subscribe once, then choose the feed from the RSS dropdown.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isAdding}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="border-b border-outline-variant/10 px-5 py-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label>
              <p className="mb-1.5 text-xs font-semibold text-on-surface-variant">Country</p>
              <select
                value={country}
                onChange={(e) => handleCountryChange(e.target.value as CountryFilter)}
                className="h-10 w-full rounded-lg border border-outline-variant/20 bg-surface-container px-3 text-sm font-medium text-on-surface outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
              >
                {COUNTRY_OPTIONS.map((option) => (
                  <option
                    key={option.id}
                    value={option.id}
                    className="bg-surface-container text-on-surface"
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <p className="mb-1.5 text-xs font-semibold text-on-surface-variant">Category</p>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as CategoryFilter)}
                className="h-10 w-full rounded-lg border border-outline-variant/20 bg-surface-container px-3 text-sm font-medium text-on-surface outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option
                    key={option.id}
                    value={option.id}
                    className="bg-surface-container text-on-surface"
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {success ? (
            <p className="mt-3 rounded-lg bg-secondary/15 px-3 py-2 text-xs font-medium text-secondary">
              {success}
            </p>
          ) : null}
          {localError ? (
            <p className="mt-3 rounded-lg bg-error/10 px-3 py-2 text-xs font-medium text-error">
              {localError}
            </p>
          ) : null}
        </div>

        <ul className="grid gap-3 overflow-y-auto p-5 workspace-dashboard-scroll sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleFeeds.map((suggested) => {
            const existing = subscribedByUrl.get(normalizeFeedUrl(suggested.url));
            const logoUrl = getFeedLogoUrl(suggested.url);
            return (
              <li key={suggested.url}>
                <div className="flex h-full flex-col rounded-xl border border-outline-variant/15 bg-surface-container px-3 py-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-outline-variant/15 bg-surface-container-high text-primary">
                      <span
                        className="material-symbols-outlined text-[20px]"
                        aria-hidden="true"
                      >
                        rss_feed
                      </span>
                      {logoUrl ? (
                        <span
                          className="absolute h-7 w-7 rounded-md bg-surface-container-high bg-contain bg-center bg-no-repeat"
                          aria-hidden="true"
                          style={{ backgroundImage: `url("${logoUrl}")` }}
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-on-surface">
                        {suggested.name}
                      </p>
                      <p className="mt-0.5 line-clamp-2 min-h-[32px] text-xs text-on-surface-variant">
                        {suggested.blurb}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-[11px] font-medium uppercase tracking-normal text-on-surface-variant/70">
                    {suggested.category}
                  </p>
                  <button
                    type="button"
                    disabled={isAdding || existing != null}
                    onClick={() => {
                      setSuccess(null);
                      setLocalError(null);
                      void onSubscribe({
                        name: suggested.name,
                        url: suggested.url,
                      })
                        .then(() => setSuccess(`${suggested.name} subscribed successfully.`))
                        .catch((err: unknown) => {
                          setLocalError(
                            err instanceof Error ? err.message : "Failed to subscribe feed.",
                          );
                        });
                    }}
                    className={`mt-3 h-8 rounded-lg px-3 text-xs font-semibold transition ${
                      existing
                        ? "border border-primary/25 bg-primary/10 text-primary"
                        : "bg-primary text-on-primary hover:brightness-110 disabled:opacity-40"
                    }`}
                  >
                    {existing ? "Subscribed" : isAdding ? "Subscribing..." : "Subscribe"}
                  </button>
                </div>
              </li>
            );
          })}
          {visibleFeeds.length === 0 ? (
            <li className="col-span-full rounded-xl border border-outline-variant/15 bg-surface-container px-4 py-8 text-center text-sm text-on-surface-variant">
              No feeds match these filters.
            </li>
          ) : null}
        </ul>
      </div>
    </div>,
    root,
  );
}
