"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { adminGet } from "@/lib/admin/adminFetch";
import type {
  PaidUserDetail,
  PaidUserFilter,
  PaidUserRow,
  PaidUsersListResponse,
} from "@/lib/admin/paidUsersApi";

const PAGE_SIZE = 50;

export interface UsePaidUsersResult {
  rows: PaidUserRow[];
  total: number;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  filter: PaidUserFilter;
  search: string;
  selected: PaidUserRow | null;
  detail: PaidUserDetail | null;
  detailLoading: boolean;
  detailError: string | null;
  setFilter: (f: PaidUserFilter) => void;
  setSearch: (q: string) => void;
  reload: () => void;
  loadMore: () => void;
  selectUser: (row: PaidUserRow | null) => void;
}

/** Load paid users list + optional detail panel. */
export function usePaidUsers(): UsePaidUsersResult {
  const [rows, setRows] = useState<PaidUserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilterState] = useState<PaidUserFilter>("all");
  const [search, setSearchState] = useState("");
  const [selected, setSelected] = useState<PaidUserRow | null>(null);
  const [detail, setDetail] = useState<PaidUserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const detailAbortRef = useRef<AbortController | null>(null);

  const buildPath = useCallback(
    (offset: number) => {
      const params = new URLSearchParams({
        filter,
        limit: String(PAGE_SIZE),
        offset: String(offset),
      });
      const q = search.trim();
      if (q) params.set("search", q);
      return `/admin/api/paid-users?${params.toString()}`;
    },
    [filter, search],
  );

  const loadList = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminGet<PaidUsersListResponse>(buildPath(0), signal);
      setRows(res.items);
      setTotal(res.total);
      setHasMore(res.items.length < res.total);
    } catch (e: unknown) {
      if (e instanceof Error && e.name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Failed to load paid users");
    } finally {
      setLoading(false);
    }
  }, [buildPath]);

  useEffect(() => {
    const ac = new AbortController();
    void loadList(ac.signal);
    return () => ac.abort();
  }, [loadList]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const res = await adminGet<PaidUsersListResponse>(buildPath(rows.length));
      setRows((prev) => {
        const merged = [...prev, ...res.items];
        setHasMore(merged.length < res.total);
        return merged;
      });
      setTotal(res.total);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load more");
    } finally {
      setLoadingMore(false);
    }
  }, [buildPath, hasMore, loadingMore, rows.length]);

  const selectUser = useCallback((row: PaidUserRow | null) => {
    detailAbortRef.current?.abort();
    setSelected(row);
    setDetail(null);
    setDetailError(null);
    if (!row) return;

    const ac = new AbortController();
    detailAbortRef.current = ac;
    setDetailLoading(true);
    void adminGet<PaidUserDetail>(`/admin/api/paid-users/${row.user_id}`, ac.signal)
      .then((data) => {
        if (!ac.signal.aborted) setDetail(data);
      })
      .catch((e: unknown) => {
        if (ac.signal.aborted) return;
        setDetailError(e instanceof Error ? e.message : "Failed to load payment history");
      })
      .finally(() => {
        if (!ac.signal.aborted) setDetailLoading(false);
      });
  }, []);

  useEffect(() => () => detailAbortRef.current?.abort(), []);

  return {
    rows,
    total,
    loading,
    loadingMore,
    hasMore,
    error,
    filter,
    search,
    selected,
    detail,
    detailLoading,
    detailError,
    setFilter: useCallback((f: PaidUserFilter) => setFilterState(f), []),
    setSearch: useCallback((q: string) => setSearchState(q), []),
    reload: useCallback(() => void loadList(), [loadList]),
    loadMore,
    selectUser,
  };
}
