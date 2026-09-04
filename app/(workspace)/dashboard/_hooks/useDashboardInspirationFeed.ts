"use client";

import { useEffect, useState } from "react";

import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import {
  fetchNews,
  type ArticleItem,
  type NewsMode,
  type NewsNiche,
} from "@/lib/news/newsApi";
import { fetchRssArticles, type RssArticleDto } from "@/lib/news/rssFeedsApi";
import {
  fetchTrending,
  type TrendingNiche,
  type TrendingPostItem,
} from "@/lib/news/trendingApi";

import type { InspirationRow, InspirationSource } from "../_components/static/inspirationsTypes";

const LIMIT = 5;

function toTrendingNiche(niche: NewsNiche): TrendingNiche {
  return niche === "mix" ? "general" : niche;
}

function fromNews(article: ArticleItem, index: number): InspirationRow {
  return {
    id: `news-${index}-${article.url}`,
    title: article.title,
    source: article.source,
    publishedAt: article.published_at,
    image: article.image,
    url: article.url,
  };
}

function fromRss(article: RssArticleDto, index: number): InspirationRow {
  return {
    id: `rss-${article.feed_id}-${index}-${article.url}`,
    title: article.title,
    source: article.feed_name || article.source,
    publishedAt: article.published_at,
    image: article.image,
    url: article.url,
  };
}

function fromTrending(post: TrendingPostItem): InspirationRow {
  return {
    id: `trending-${post.id}`,
    title: post.title,
    source: post.source ?? post.platform,
    publishedAt: post.published_at,
    image: post.image,
    url: post.url,
  };
}

export interface InspirationFeedFilters {
  readonly niche: NewsNiche;
  readonly mode: NewsMode;
  readonly country: string | null;
}

export interface UseDashboardInspirationFeedResult {
  readonly rows: readonly InspirationRow[];
  readonly isLoading: boolean;
  readonly error: string | null;
}

export function useDashboardInspirationFeed(
  source: InspirationSource,
  filters: InspirationFeedFilters,
): UseDashboardInspirationFeedResult {
  const [rows, setRows] = useState<readonly InspirationRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { niche, mode, country } = filters;

  useEffect(() => {
    const token = getStoredAccessToken();
    const workspaceId = getStoredActiveWorkspaceId();
    if (!token) {
      setRows([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    const ac = new AbortController();
    setIsLoading(true);
    setError(null);

    const countryParam = mode === "country" && country ? country : undefined;

    const run = async (): Promise<void> => {
      if (source === "news") {
        const res = await fetchNews(
          {
            niche,
            mode,
            country: countryParam,
            time_range: "week",
            page: 1,
          },
          token,
        );
        if (ac.signal.aborted) return;
        setRows(res.articles.slice(0, LIMIT).map(fromNews));
        return;
      }
      if (source === "trending") {
        const res = await fetchTrending(
          {
            niche: toTrendingNiche(niche),
            mode,
            country: countryParam,
            time_range: "week",
            platform: "youtube",
            page: 1,
          },
          token,
        );
        if (ac.signal.aborted) return;
        setRows(res.posts.slice(0, LIMIT).map(fromTrending));
        return;
      }
      if (!workspaceId) {
        setRows([]);
        return;
      }
      const res = await fetchRssArticles(token, workspaceId, { page: 1 });
      if (ac.signal.aborted) return;
      setRows(res.articles.slice(0, LIMIT).map(fromRss));
    };

    void run()
      .catch((e: unknown) => {
        if (ac.signal.aborted) return;
        setRows([]);
        setError(e instanceof Error ? e.message : "Failed to load");
      })
      .finally(() => {
        if (!ac.signal.aborted) setIsLoading(false);
      });

    return () => ac.abort();
  }, [source, niche, mode, country]);

  return { rows, isLoading, error };
}
