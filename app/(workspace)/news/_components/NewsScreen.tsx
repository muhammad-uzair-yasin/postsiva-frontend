"use client";

import { useCallback, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  type NewsMode,
  type NewsNiche,
  type NewsTimeRange,
} from "@/lib/news/newsApi";
import type { TrendingNiche, TrendingPlatform } from "@/lib/news/trendingApi";
import { WorkspacePageScaffold } from "../../_components/WorkspacePageScaffold";
import { WORKSPACE_PAGE_HORIZONTAL_INSET_CLASS } from "../../_components/shell/WorkspaceAccountRailPageLayout";
import { useNews } from "../_hooks/useNews";
import { useTrending } from "../_hooks/useTrending";
import { NewsFilters } from "./NewsFilters";
import { NewsGrid } from "./NewsGrid";
import { NewsSubNav, type NewsSubpage } from "./NewsSubNav";
import {
  RssFeedsHeaderToolbar,
  RssFeedsPanel,
  RssFeedsProvider,
} from "./rss/RssFeedsPanel";
import {
  DemandPanel,
  type DemandRefreshHandle,
} from "./demand/DemandPanel";
import { ExploreRefreshButton } from "./ExploreRefreshButton";
import { TrendingGrid } from "./TrendingGrid";

/** Soft-launch: only these countries in the picker for now. */
const NEWS_COUNTRIES = ["US", "BA", "PK"] as const;

const NEWS_MAIN_CLASS = [
  "flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col overflow-hidden",
  WORKSPACE_PAGE_HORIZONTAL_INSET_CLASS,
].join(" ");

const SUBPAGES = new Set<NewsSubpage>(["news", "rss", "trending", "demand"]);

function parseSubpage(raw: string | null): NewsSubpage {
  if (raw && SUBPAGES.has(raw as NewsSubpage)) {
    return raw as NewsSubpage;
  }
  return "news";
}

function toTrendingNiche(niche: NewsNiche): TrendingNiche {
  return niche === "mix" ? "general" : niche;
}

export function NewsScreen(): React.ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const subpage = parseSubpage(searchParams.get("tab"));
  const demandHandle = useRef<DemandRefreshHandle | null>(null);
  const [demandBusy, setDemandBusy] = useState(false);

  const setSubpage = useCallback(
    (next: NewsSubpage) => {
      const p = new URLSearchParams(searchParams.toString());
      p.set("tab", next);
      router.replace(`${pathname}?${p.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const [niche, setNiche] = useState<NewsNiche>("general");
  const [mode, setMode] = useState<NewsMode>("global");
  const [country, setCountry] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<NewsTimeRange>("today");
  const [trendingPlatform, setTrendingPlatform] =
    useState<TrendingPlatform>("youtube");
  const countries = [...NEWS_COUNTRIES];

  const handleSelectGlobal = () => {
    setMode("global");
    setCountry(null);
  };

  const handleSelectCountry = (code: string) => {
    setMode("country");
    setCountry(code);
  };

  const news = useNews({ niche, mode, country, timeRange });
  const trending = useTrending({
    niche: toTrendingNiche(niche),
    mode,
    country,
    timeRange,
    platform: trendingPlatform,
    enabled: subpage === "trending",
  });

  const showNewsFilters = subpage === "news" || subpage === "trending";
  const headerTotal =
    subpage === "news"
      ? news.total
      : subpage === "trending"
        ? trending.total
        : 0;

  return (
    <RssFeedsProvider>
      <WorkspacePageScaffold mainClassName={NEWS_MAIN_CLASS}>
        <header className="flex shrink-0 flex-col bg-surface pt-3 sm:pt-4">
          <div className="flex items-center gap-2 pb-3">
            <h1 className="text-xl font-semibold tracking-tight text-on-surface sm:text-2xl">
              Explore
            </h1>
            <span
              className="material-symbols-outlined text-[22px] text-on-surface"
              style={{ fontVariationSettings: "'FILL' 0" }}
              aria-hidden
            >
              lightbulb
            </span>
            {showNewsFilters && headerTotal > 0 ? (
              <span className="rounded-full border border-outline-variant/20 bg-surface-container-high px-2 py-0.5 text-xs text-on-surface-variant">
                {headerTotal.toLocaleString()}
              </span>
            ) : null}
          </div>

          <div className="flex flex-col gap-2 border-t border-outline-variant/15 pt-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex min-w-0 items-end gap-1.5">
              <ExploreRefreshButton
                subpage={subpage}
                newsBusy={news.isLoading}
                trendingBusy={trending.isLoading}
                demandBusy={demandBusy}
                onRefreshNews={news.refresh}
                onRefreshTrending={trending.refresh}
                demandHandle={demandHandle}
              />
              <NewsSubNav active={subpage} onChange={setSubpage} />
            </div>
            <div className="flex min-w-0 shrink-0 flex-wrap items-center justify-end gap-2 pb-2 sm:pb-0">
              {showNewsFilters ? (
                <NewsFilters
                  niche={niche === "mix" ? "general" : niche}
                  mode={mode}
                  country={country}
                  timeRange={timeRange}
                  countries={countries}
                  onNiche={setNiche}
                  onSelectGlobal={handleSelectGlobal}
                  onSelectCountry={handleSelectCountry}
                  onTimeRange={setTimeRange}
                  {...(subpage === "trending"
                    ? {
                        platform: trendingPlatform,
                        onPlatform: setTrendingPlatform,
                      }
                    : {})}
                />
              ) : null}
              {subpage === "rss" ? <RssFeedsHeaderToolbar /> : null}
            </div>
          </div>
        </header>

        <div className="workspace-dashboard-scroll min-h-0 flex-1 overflow-x-clip overflow-y-auto pb-8 pt-4">
          {subpage === "news" ? (
            <NewsGrid
              articles={news.articles}
              isLoading={news.isLoading}
              isLoadingMore={news.isLoadingMore}
              hasMore={news.hasMore}
              total={news.total}
              error={news.error}
              onLoadMore={news.loadMore}
            />
          ) : null}
          {subpage === "rss" ? <RssFeedsPanel /> : null}
          {subpage === "trending" ? (
            <TrendingGrid
              posts={trending.posts}
              isLoading={trending.isLoading}
              isLoadingMore={trending.isLoadingMore}
              hasMore={trending.hasMore}
              total={trending.total}
              error={trending.error}
              onLoadMore={trending.loadMore}
            />
          ) : null}
          {subpage === "demand" ? (
            <DemandPanel
              refreshHandle={demandHandle}
              onBusyChange={setDemandBusy}
            />
          ) : null}
        </div>
      </WorkspacePageScaffold>
    </RssFeedsProvider>
  );
}
