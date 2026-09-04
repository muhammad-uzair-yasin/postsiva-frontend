"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getStoredAccessToken } from "@/lib/auth/session";
import {
  fetchNews,
  type ArticleItem,
  type NewsMode,
  type NewsNiche,
  type NewsTimeRange,
} from "@/lib/news/newsApi";

interface UseNewsParams {
  niche: NewsNiche;
  mode: NewsMode;
  country: string | null;
  timeRange: NewsTimeRange;
}

interface UseNewsResult {
  articles: ArticleItem[];
  total: number;
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  loadMore: () => void;
  refresh: () => void;
}

export function useNews({
  niche,
  mode,
  country,
  timeRange,
}: UseNewsParams): UseNewsResult {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // track current "fetch key" to discard stale responses
  const fetchKeyRef = useRef(0);

  const fetchPage = useCallback(
    async (pageNum: number, append: boolean, bypassCache = false) => {
      const token = getStoredAccessToken();
      if (!token) return;

      const key = ++fetchKeyRef.current;
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
        setError(null);
      }

      try {
        const data = await fetchNews(
          {
            niche,
            mode,
            country: mode === "country" && country ? country : undefined,
            time_range: timeRange,
            page: pageNum,
            refresh: bypassCache || undefined,
          },
          token,
        );

        if (key !== fetchKeyRef.current) return; // stale

        if (append) {
          setArticles((prev) => [...prev, ...data.articles]);
        } else {
          setArticles(data.articles);
        }
        setTotal(data.meta.total);
        setPage(data.meta.page);
        setHasMore(data.meta.has_more);
      } catch (e) {
        if (key !== fetchKeyRef.current) return;
        setError(e instanceof Error ? e.message : "Failed to load news");
      } finally {
        if (key === fetchKeyRef.current) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    [niche, mode, country, timeRange],
  );

  // Stale-while-revalidate: keep prior articles until the new page arrives.
  useEffect(() => {
    setPage(1);
    setHasMore(false);
    void fetchPage(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [niche, mode, country, timeRange]);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      void fetchPage(page + 1, true);
    }
  }, [fetchPage, hasMore, isLoadingMore, page]);

  const refresh = useCallback(() => {
    setPage(1);
    void fetchPage(1, false, true);
  }, [fetchPage]);

  return {
    articles,
    total,
    page,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    loadMore,
    refresh,
  };
}
