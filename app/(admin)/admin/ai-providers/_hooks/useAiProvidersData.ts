"use client";

import { useCallback, useEffect, useState } from "react";

import { adminGet } from "@/lib/admin/adminFetch";
import type {
  AdminWorkspace,
  GalleryMediaItem,
  ProviderCatalogItem,
  ProviderCatalogResponse,
} from "@/lib/admin/aiProvidersApi";
import { errorText } from "@/lib/admin/aiProvidersApi";
import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";
import { getStoredAccessToken } from "@/lib/auth/session";

interface AsyncListState<T> {
  items: T[];
  loading: boolean;
  error: string | null;
}

/** GET /admin/api/ai/providers/catalog — providers + allowed probe models. */
export function useProviderCatalog(): AsyncListState<ProviderCatalogItem> & {
  reload: () => void;
} {
  const [state, setState] = useState<AsyncListState<ProviderCatalogItem>>({
    items: [],
    loading: true,
    error: null,
  });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    adminGet<ProviderCatalogResponse>(
      "/admin/api/ai/providers/catalog",
      controller.signal,
    )
      .then((data) =>
        setState({ items: data.providers ?? [], loading: false, error: null }),
      )
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setState({ items: [], loading: false, error: errorText(err) });
      });
    return () => controller.abort();
  }, [reloadKey]);

  const reload = useCallback(() => {
    // Loading flips here (event handler), not synchronously inside the effect.
    setState((s) => ({ ...s, loading: true, error: null }));
    setReloadKey((k) => k + 1);
  }, []);

  return { ...state, reload };
}

/** GET /workspaces — the admin's own workspaces for the Piva probe picker. */
export function useAdminWorkspaces(): AsyncListState<AdminWorkspace> {
  const [state, setState] = useState<AsyncListState<AdminWorkspace>>({
    items: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();
    adminGet<AdminWorkspace[]>("/workspaces", controller.signal)
      .then((rows) =>
        setState({
          items: Array.isArray(rows) ? rows : [],
          loading: false,
          error: null,
        }),
      )
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setState({ items: [], loading: false, error: errorText(err) });
      });
    return () => controller.abort();
  }, []);

  return state;
}

interface GalleryFetchResult {
  workspaceId: string;
  items: GalleryMediaItem[];
  error: string | null;
}

/** GET /media/?media_type=image — gallery images of the selected workspace. */
export function useGalleryMedia(workspaceId: string): AsyncListState<GalleryMediaItem> {
  const [fetched, setFetched] = useState<GalleryFetchResult | null>(null);

  useEffect(() => {
    if (!workspaceId) return;
    let cancelled = false;
    (async () => {
      const token = getStoredAccessToken();
      if (!token) throw new Error("Admin session missing");
      const res = await fetchWithAccessTokenRetry(
        `${getApiBaseUrl()}/media/?media_type=image&limit=100`,
        token,
        (t) => ({
          Authorization: `Bearer ${t}`,
          Accept: "application/json",
          "X-Workspace-Id": workspaceId,
        }),
      );
      return (await res.json()) as { media?: GalleryMediaItem[] };
    })()
      .then((data) => {
        if (cancelled) return;
        setFetched({
          workspaceId,
          items: Array.isArray(data.media) ? data.media : [],
          error: null,
        });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setFetched({ workspaceId, items: [], error: errorText(err) });
      });
    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  // Derive from the last fetch: stale results for another workspace read as loading.
  const current = fetched && fetched.workspaceId === workspaceId ? fetched : null;
  return {
    items: current?.items ?? [],
    loading: Boolean(workspaceId) && current === null,
    error: current?.error ?? null,
  };
}
