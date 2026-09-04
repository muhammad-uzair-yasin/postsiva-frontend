"use client";

import { createContext, useContext, type ReactNode } from "react";

import { NewsGrid } from "../NewsGrid";
import { useRssFeeds } from "../../_hooks/useRssFeeds";
import { AddRssFeedModal } from "./AddRssFeedModal";
import { RssFeedsEmptyState } from "./RssFeedsEmptyState";
import { RssFeedsToolbar } from "./RssFeedsToolbar";
import { RssSuggestedFeeds } from "./RssSuggestedFeeds";

type RssCtx = ReturnType<typeof useRssFeeds>;

const RssFeedsContext = createContext<RssCtx | null>(null);

function useRssFeedsContext(): RssCtx {
  const ctx = useContext(RssFeedsContext);
  if (!ctx) throw new Error("RssFeedsContext missing");
  return ctx;
}

export { useRssFeedsContext };

export function RssFeedsProvider({ children }: { children: ReactNode }): React.ReactElement {
  const value = useRssFeeds();
  return (
    <RssFeedsContext.Provider value={value}>{children}</RssFeedsContext.Provider>
  );
}

export function RssFeedsHeaderToolbar(): React.ReactElement {
  const rss = useRssFeedsContext();
  return (
    <RssFeedsToolbar
      feeds={rss.feeds}
      search={rss.search}
      feedFilterId={rss.feedFilterId}
      onSearch={rss.setSearch}
      onFeedFilter={rss.setFeedFilterId}
      onOpenAvailable={rss.openAvailable}
      onAdd={rss.openAdd}
      onRemoveFeed={(id) => {
        void rss.removeFeed(id);
      }}
    />
  );
}

export function RssFeedsPanel(): React.ReactElement {
  const rss = useRssFeedsContext();
  const showEmpty =
    !rss.isLoadingArticles &&
    !rss.articlesError &&
    rss.articles.length === 0 &&
    !rss.isLoadingFeeds;

  return (
    <>
      {rss.feedsError ? (
        <p className="mb-4 text-sm text-error">{rss.feedsError}</p>
      ) : null}

      {showEmpty ? (
        <RssFeedsEmptyState onAdd={rss.openAdd} hasFeeds={rss.feeds.length > 0} />
      ) : (
        <NewsGrid
          articles={rss.articles}
          isLoading={rss.isLoadingArticles}
          isLoadingMore={rss.isLoadingMoreArticles}
          hasMore={rss.hasMoreArticles}
          total={rss.articleTotal}
          error={rss.articlesError}
          onLoadMore={rss.loadMoreArticles}
        />
      )}

      <RssSuggestedFeeds
        open={rss.isAvailableOpen}
        feeds={rss.feeds}
        onClose={rss.closeAvailable}
        isAdding={rss.isAdding}
        onSubscribe={async ({ name, url }) => {
          await rss.addFeed({
            name,
            url,
            includeKeywords: [],
            excludeKeywords: [],
          });
        }}
      />

      <AddRssFeedModal
        open={rss.isAddOpen}
        onClose={rss.closeAdd}
        onAdd={rss.addFeed}
        isSubmitting={rss.isAdding}
        error={rss.addError}
      />
    </>
  );
}
