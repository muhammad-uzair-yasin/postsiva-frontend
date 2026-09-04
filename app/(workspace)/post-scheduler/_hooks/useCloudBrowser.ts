"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import {
  listCloudItems,
  type CloudFileItem,
  type CloudProvider,
} from "@/lib/social/cloudStorageApi";

export interface CloudCrumb {
  id: string | null;
  name: string;
}

interface UseCloudBrowserResult {
  items: CloudFileItem[];
  crumbs: CloudCrumb[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  search: string;
  setSearch: (value: string) => void;
  openFolder: (item: CloudFileItem) => void;
  navigateTo: (index: number) => void;
  loadMore: () => void;
  reload: () => void;
}

const SEARCH_DEBOUNCE_MS = 350;

/**
 * Native cloud folder navigation for OneDrive/Dropbox via `listCloudItems`:
 * breadcrumb path, debounced search, and `next_page_token` paging. Active only
 * while `open` is true so a closed browser makes no requests.
 */
export function useCloudBrowser(provider: CloudProvider, open: boolean): UseCloudBrowserResult {
  const { t } = useTranslations();
  const [crumbs, setCrumbs] = useState<CloudCrumb[]>([{ id: null, name: "" }]);
  const [items, setItems] = useState<CloudFileItem[]>([]);
  const [pageToken, setPageToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearchDebounced] = useState("");
  const requestIdRef = useRef(0);

  const folderId = crumbs[crumbs.length - 1]?.id ?? null;

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setSearchDebounced(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      window.clearTimeout(handle);
    };
  }, [searchInput]);

  const fetchPage = useCallback(
    async (token: string | null, append: boolean): Promise<void> => {
      const accessToken = getStoredAccessToken();
      const workspaceId = getStoredActiveWorkspaceId();
      if (!accessToken?.trim() || !workspaceId?.trim()) {
        setError(t("cloudStorage.errorSignIn"));
        return;
      }
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }
      try {
        const result = await listCloudItems(accessToken, workspaceId, provider, {
          folderId: folderId ?? undefined,
          pageToken: token ?? undefined,
          search: search || undefined,
        });
        if (requestIdRef.current !== requestId) {
          return;
        }
        setItems((prev) => (append ? [...prev, ...result.items] : result.items));
        setPageToken(result.next_page_token ?? null);
      } catch (e) {
        if (requestIdRef.current !== requestId) {
          return;
        }
        setError(e instanceof Error ? e.message : t("cloudStorage.errorLoad"));
      } finally {
        if (requestIdRef.current === requestId) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [folderId, provider, search, t],
  );

  useEffect(() => {
    if (!open) {
      return;
    }
    void fetchPage(null, false);
  }, [open, fetchPage]);

  const openFolder = useCallback((item: CloudFileItem): void => {
    if (!item.is_folder) {
      return;
    }
    setSearchInput("");
    setSearchDebounced("");
    setCrumbs((prev) => [...prev, { id: item.file_id, name: item.name }]);
  }, []);

  const navigateTo = useCallback((index: number): void => {
    setSearchInput("");
    setSearchDebounced("");
    setCrumbs((prev) => prev.slice(0, index + 1));
  }, []);

  const loadMore = useCallback((): void => {
    if (pageToken) {
      void fetchPage(pageToken, true);
    }
  }, [fetchPage, pageToken]);

  const reload = useCallback((): void => {
    void fetchPage(null, false);
  }, [fetchPage]);

  const orderedItems = useMemo(
    () =>
      [...items].sort((a, b) => {
        if (a.is_folder !== b.is_folder) {
          return a.is_folder ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      }),
    [items],
  );

  return {
    items: orderedItems,
    crumbs,
    loading,
    loadingMore,
    error,
    hasMore: Boolean(pageToken),
    search: searchInput,
    setSearch: setSearchInput,
    openFolder,
    navigateTo,
    loadMore,
    reload,
  };
}
