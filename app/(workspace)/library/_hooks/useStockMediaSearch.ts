"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import {
  DEFAULT_STOCK_ASPECT_RATIO_PRESET_ID,
  getStockAspectRatioPreset,
  type StockAspectRatioPresetId,
} from "@/lib/social/stockAspectRatioPresets";
import {
  searchStockMedia,
  type StockMediaItem,
  type StockMediaType,
  type StockProvider,
  type StockSize,
} from "@/lib/social/stockMediaApi";

const SEARCH_DEBOUNCE_MS = 450;

export interface StockFilters {
  aspectRatioPreset: StockAspectRatioPresetId;
  size: StockSize | null;
  color: string | null;
  provider: StockProvider;
}

const EMPTY_FILTERS: StockFilters = {
  aspectRatioPreset: DEFAULT_STOCK_ASPECT_RATIO_PRESET_ID,
  size: null,
  color: null,
  provider: "unsplash",
};

/** Default curated feed on mount; debounced search; filters; page-based load more. */
export function useStockMediaSearch(): {
  items: StockMediaItem[];
  query: string;
  setQuery: (next: string) => void;
  applySearch: (next?: string) => void;
  mediaType: StockMediaType;
  setMediaType: (next: StockMediaType) => void;
  filters: StockFilters;
  setFilters: (next: StockFilters) => void;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
} {
  const [items, setItems] = useState<StockMediaItem[]>([]);
  // `query` is the live input value; `appliedQuery` is what actually hits the API.
  // The API only runs when the user applies (Enter / Search button / chip), never
  // on every keystroke.
  const [query, setQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [mediaType, setMediaType] = useState<StockMediaType>("image");
  const [filters, setFilters] = useState<StockFilters>(EMPTY_FILTERS);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const pageRef = useRef(1);
  const requestSeq = useRef(0);

  const runSearch = useCallback(
    async (page: number, append: boolean): Promise<void> => {
      const token = getStoredAccessToken();
      const workspaceId = getStoredActiveWorkspaceId();
      if (!token?.trim() || !workspaceId?.trim()) {
        setError("Open a workspace first to browse stock media.");
        setLoading(false);
        return;
      }
      const seq = ++requestSeq.current;
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);
      try {
        const aspectPreset = getStockAspectRatioPreset(filters.aspectRatioPreset);
        const res = await searchStockMedia(token, workspaceId, {
          query: appliedQuery,
          mediaType,
          orientation: aspectPreset.orientation,
          size: filters.size,
          color: filters.color,
          provider: filters.provider,
          page,
        });
        if (seq !== requestSeq.current) {
          return;
        }
        pageRef.current = page;
        setHasMore(res.has_more);
        setItems((prev) => {
          const next = append ? [...prev, ...res.items] : res.items;
          const seen = new Set<string>();
          return next.filter((item) => {
            if (seen.has(item.stock_id)) return false;
            seen.add(item.stock_id);
            return true;
          });
        });
      } catch (e) {
        if (seq !== requestSeq.current) {
          return;
        }
        if (!append) setItems([]);
        setError(e instanceof Error ? e.message : "Could not load stock media.");
      } finally {
        if (seq === requestSeq.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [appliedQuery, mediaType, filters],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void runSearch(1, false);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [runSearch]);

  /** Commit the current (or given) text and run the search. */
  const applySearch = useCallback(
    (next?: string): void => {
      const value = (next ?? query).trim();
      setQuery(value);
      setAppliedQuery(value);
    },
    [query],
  );

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) {
      return;
    }
    void runSearch(pageRef.current + 1, true);
  }, [hasMore, loading, loadingMore, runSearch]);

  return {
    items,
    query,
    setQuery,
    applySearch,
    mediaType,
    setMediaType,
    filters,
    setFilters,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
  };
}
