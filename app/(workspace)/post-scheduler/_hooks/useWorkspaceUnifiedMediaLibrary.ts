import { useCallback, useEffect, useState } from "react";

import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import {
  fetchWorkspaceMediaList,
  type UnifiedMediaListItem,
} from "@/lib/social/unifiedMediaApi";

/** UI-only filter; data is always loaded once via GET /media/ (no media_type). */
export type WorkspaceUnifiedMediaFilter = "all" | "image" | "video" | "document";

const PAGE_SIZE = 24;

export function useWorkspaceUnifiedMediaLibrary(shouldLoad: boolean): {
  items: UnifiedMediaListItem[];
  filter: WorkspaceUnifiedMediaFilter;
  setFilter: (next: WorkspaceUnifiedMediaFilter) => void;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  reload: () => Promise<void>;
  loadMore: () => Promise<void>;
  removeItemsLocally: (mediaIds: readonly string[]) => void;
} {
  const [filter, setFilter] = useState<WorkspaceUnifiedMediaFilter>("all");
  const [items, setItems] = useState<UnifiedMediaListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(() => shouldLoad);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFirstPage = useCallback(async (forceRefresh = false): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const token = getStoredAccessToken();
      const workspaceId = getStoredActiveWorkspaceId();
      if (!token?.trim()) {
        setItems([]);
        setTotal(0);
        setError("Sign in again to load your media library.");
        return;
      }
      if (!workspaceId?.trim()) {
        setItems([]);
        setTotal(0);
        setError("Open a workspace first to use Postsiva storage.");
        return;
      }
      const res = await fetchWorkspaceMediaList(token, workspaceId, {
        limit: PAGE_SIZE,
        offset: 0,
        forceRefresh,
      });
      setItems(res.media);
      setTotal(res.total);
    } catch (e) {
      setItems([]);
      setTotal(0);
      setError(e instanceof Error ? e.message : "Could not load media library.");
    } finally {
      setLoading(false);
    }
  }, []);

  const reload = useCallback(async (): Promise<void> => {
    await fetchFirstPage(true);
  }, [fetchFirstPage]);

  const removeItemsLocally = useCallback((mediaIds: readonly string[]): void => {
    if (mediaIds.length === 0) {
      return;
    }
    const idSet = new Set(mediaIds);
    setItems((prev) => prev.filter((item) => !idSet.has(item.media_id)));
    setTotal((prev) => Math.max(0, prev - mediaIds.length));
  }, []);

  const loadMore = useCallback(async (): Promise<void> => {
    if (loading || loadingMore || items.length >= total) {
      return;
    }
    const token = getStoredAccessToken();
    const workspaceId = getStoredActiveWorkspaceId();
    if (!token?.trim() || !workspaceId?.trim()) {
      return;
    }
    setLoadingMore(true);
    setError(null);
    try {
      const res = await fetchWorkspaceMediaList(token, workspaceId, {
        limit: PAGE_SIZE,
        offset: items.length,
      });
      setItems((prev) => {
        const seen = new Set(prev.map((i) => i.media_id));
        const next = [...prev];
        for (const m of res.media) {
          if (!seen.has(m.media_id)) {
            seen.add(m.media_id);
            next.push(m);
          }
        }
        return next;
      });
      setTotal(res.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load more.");
    } finally {
      setLoadingMore(false);
    }
  }, [items.length, loading, loadingMore, total]);

  useEffect(() => {
    if (!shouldLoad) {
      return;
    }
    void fetchFirstPage(false);
  }, [shouldLoad, fetchFirstPage]);

  const hasMore = total > 0 && items.length < total;

  return {
    items,
    filter,
    setFilter,
    loading,
    loadingMore,
    error,
    hasMore,
    reload,
    loadMore,
    removeItemsLocally,
  };
}
