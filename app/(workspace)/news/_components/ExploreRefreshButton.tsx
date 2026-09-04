"use client";

import type { NewsSubpage } from "./NewsSubNav";
import type { DemandRefreshHandle } from "./demand/DemandPanel";
import { useRssFeedsContext } from "./rss/RssFeedsPanel";

interface ExploreRefreshButtonProps {
  subpage: NewsSubpage;
  newsBusy: boolean;
  trendingBusy: boolean;
  demandBusy: boolean;
  onRefreshNews: () => void;
  onRefreshTrending: () => void;
  demandHandle: { current: DemandRefreshHandle | null };
}

export function ExploreRefreshButton({
  subpage,
  newsBusy,
  trendingBusy,
  demandBusy,
  onRefreshNews,
  onRefreshTrending,
  demandHandle,
}: ExploreRefreshButtonProps): React.ReactElement {
  const rss = useRssFeedsContext();
  const busy =
    subpage === "news"
      ? newsBusy
      : subpage === "trending"
        ? trendingBusy
        : subpage === "rss"
          ? rss.isLoadingArticles || rss.isLoadingFeeds
          : demandBusy;

  const onClick = () => {
    if (busy) return;
    if (subpage === "news") onRefreshNews();
    else if (subpage === "trending") onRefreshTrending();
    else if (subpage === "rss") rss.refresh();
    else demandHandle.current?.refresh();
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      title="Refresh (bypass cache)"
      aria-label="Refresh current Explore tab"
      className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-outline-variant/20 bg-surface-container-low text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface disabled:opacity-50"
    >
      <span
        className={`material-symbols-outlined text-[20px] ${busy ? "animate-spin" : ""}`}
        aria-hidden
      >
        refresh
      </span>
    </button>
  );
}
