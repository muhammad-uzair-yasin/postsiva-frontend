"use client";

import { useCallback, useEffect, useState } from "react";

import { adminGet } from "@/lib/admin/adminFetch";
import {
  API_HITS_DEFAULT_LIMIT,
  buildApiHitsPath,
  clampApiHitsLimit,
  hasNextPage,
  nextOffset,
  prevOffset,
  type ApiHitsQuery,
  type ApiHitsResponse,
} from "@/lib/admin/apiHitsApi";

export interface ApiHitsDraftFilters {
  userId: string;
  routeContains: string;
  limit: string;
}

const EMPTY_DRAFT: ApiHitsDraftFilters = {
  userId: "",
  routeContains: "",
  limit: String(API_HITS_DEFAULT_LIMIT),
};

/** Data + pagination/filter state for the API hits table (legacy usage.html#api-detail). */
export function useApiHits() {
  const [draft, setDraft] = useState<ApiHitsDraftFilters>(EMPTY_DRAFT);
  const [query, setQuery] = useState<ApiHitsQuery>({
    limit: API_HITS_DEFAULT_LIMIT,
    offset: 0,
  });
  const [nonce, setNonce] = useState(0);
  const [data, setData] = useState<ApiHitsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    adminGet<ApiHitsResponse>(buildApiHitsPath(query), controller.signal)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Failed to load API hit data");
        setLoading(false);
      });
    return () => controller.abort();
  }, [query, nonce]);

  const setDraftField = useCallback(
    (field: keyof ApiHitsDraftFilters, value: string) => {
      setDraft((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  /** Every reload path resets loading/error here so the fetch effect stays setState-free. */
  const beginLoad = useCallback(() => {
    setLoading(true);
    setError(null);
  }, []);

  const applyFilters = useCallback(() => {
    beginLoad();
    setQuery({
      limit: clampApiHitsLimit(draft.limit),
      offset: 0,
      userId: draft.userId.trim() || undefined,
      routeContains: draft.routeContains.trim() || undefined,
    });
  }, [draft, beginLoad]);

  const clearFilters = useCallback(() => {
    beginLoad();
    setDraft(EMPTY_DRAFT);
    setQuery({ limit: API_HITS_DEFAULT_LIMIT, offset: 0 });
  }, [beginLoad]);

  const refresh = useCallback(() => {
    beginLoad();
    setNonce((n) => n + 1);
  }, [beginLoad]);

  const goPrev = useCallback(() => {
    beginLoad();
    setQuery((q) => ({ ...q, offset: prevOffset(q.offset, q.limit) }));
  }, [beginLoad]);

  const goNext = useCallback(() => {
    beginLoad();
    setQuery((q) => ({ ...q, offset: nextOffset(q.offset, q.limit) }));
  }, [beginLoad]);

  const canPrev = query.offset > 0;
  const canNext =
    data !== null && hasNextPage(data.offset, data.hits.length, data.total);

  return {
    draft,
    setDraftField,
    query,
    data,
    loading,
    error,
    applyFilters,
    clearFilters,
    refresh,
    goPrev,
    goNext,
    canPrev,
    canNext,
  };
}
