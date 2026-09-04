"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getStoredAccessToken } from "@/lib/auth/session";
import {
  fetchTrending,
  type TrendingMode,
  type TrendingNiche,
  type TrendingPlatform,
  type TrendingPostItem,
  type TrendingTimeRange,
} from "@/lib/news/trendingApi";

interface UseTrendingParams {
  niche: TrendingNiche;
  mode: TrendingMode;
  country: string | null;
  timeRange: TrendingTimeRange;
  platform: TrendingPlatform;
  enabled?: boolean;
}

interface UseTrendingResult {
  posts: TrendingPostItem[];
  total: number;
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  loadMore: () => void;
  refresh: () => void;
}

export function useTrending({
  niche,
  mode,
  country,
  timeRange,
  platform,
  enabled = true,
}: UseTrendingParams): UseTrendingResult {
  const [posts, setPosts] = useState<TrendingPostItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
        const data = await fetchTrending(
          {
            niche,
            mode,
            country: mode === "country" && country ? country : undefined,
            time_range: timeRange,
            platform,
            page: pageNum,
            refresh: bypassCache || undefined,
          },
          token,
        );

        if (key !== fetchKeyRef.current) return;

        if (append) {
          setPosts((prev) => [...prev, ...data.posts]);
        } else {
          setPosts(data.posts);
        }
        setTotal(data.meta.total);
        setPage(data.meta.page);
        setHasMore(data.meta.has_more);
      } catch (e) {
        if (key !== fetchKeyRef.current) return;
        setError(e instanceof Error ? e.message : "Failed to load trending posts");
      } finally {
        if (key === fetchKeyRef.current) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    [niche, mode, country, timeRange, platform],
  );

  useEffect(() => {
    if (!enabled) return;
    setPage(1);
    setHasMore(false);
    void fetchPage(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [niche, mode, country, timeRange, platform, enabled]);

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
    posts,
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
