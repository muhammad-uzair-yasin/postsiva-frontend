"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { adminGet, adminSend } from "@/lib/admin/adminFetch";
import {
  buildPutBody,
  type CatalogProvider,
  draftFromConfig,
  orderRoutes,
  type ProviderCatalogResponse,
  type RouteConfigResponse,
  type RouteDraft,
  routeMetaFor,
  type RoutesResponse,
} from "@/lib/admin/aiManagerApi";

const ROUTES_API = "/admin/api/ai/manager/routes";
const CATALOG_API = "/admin/api/ai/providers/catalog";

export interface CardStatus {
  kind: "idle" | "pending" | "ok" | "error";
  message: string;
}

const IDLE: CardStatus = { kind: "idle", message: "" };

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Request failed";
}

export function useAiManager() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [catalog, setCatalog] = useState<CatalogProvider[]>([]);
  const [routes, setRoutes] = useState<RouteConfigResponse[]>([]);
  const [drafts, setDrafts] = useState<Record<string, RouteDraft>>({});
  const [statuses, setStatuses] = useState<Record<string, CardStatus>>({});
  const [busyKeys, setBusyKeys] = useState<Record<string, boolean>>({});
  const [resetAllStatus, setResetAllStatus] = useState<CardStatus>(IDLE);
  const mounted = useRef(true);

  const applyRoutes = useCallback((list: RouteConfigResponse[]) => {
    const ordered = orderRoutes(list);
    setRoutes(ordered);
    const next: Record<string, RouteDraft> = {};
    for (const route of ordered) {
      next[route.config_key] = draftFromConfig(
        route.config,
        routeMetaFor(route.config_key).hasSummarizer,
      );
    }
    setDrafts(next);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [cat, rts] = await Promise.all([
        adminGet<ProviderCatalogResponse>(CATALOG_API),
        adminGet<RoutesResponse>(ROUTES_API),
      ]);
      if (!mounted.current) return;
      setCatalog(cat.providers ?? []);
      applyRoutes(rts.routes ?? []);
      setStatuses({});
    } catch (err) {
      if (mounted.current) setLoadError(errorMessage(err));
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [applyRoutes]);

  useEffect(() => {
    mounted.current = true;
    void load();
    return () => {
      mounted.current = false;
    };
  }, [load]);

  const setStatus = useCallback((key: string, status: CardStatus) => {
    setStatuses((prev) => ({ ...prev, [key]: status }));
  }, []);

  const setBusy = useCallback((key: string, busy: boolean) => {
    setBusyKeys((prev) => ({ ...prev, [key]: busy }));
  }, []);

  const replaceRoute = useCallback((updated: RouteConfigResponse) => {
    setRoutes((prev) =>
      prev.map((r) => (r.config_key === updated.config_key ? updated : r)),
    );
    setDrafts((prev) => ({
      ...prev,
      [updated.config_key]: draftFromConfig(
        updated.config,
        routeMetaFor(updated.config_key).hasSummarizer,
      ),
    }));
  }, []);

  const updateDraft = useCallback(
    (key: string, updater: (draft: RouteDraft) => RouteDraft) => {
      setDrafts((prev) => {
        const current = prev[key];
        if (!current) return prev;
        return { ...prev, [key]: updater(current) };
      });
      setStatuses((prev) => (prev[key]?.kind === "idle" ? prev : { ...prev, [key]: IDLE }));
    },
    [],
  );

  const saveRoute = useCallback(
    async (key: string) => {
      const draft = drafts[key];
      if (!draft) return;
      setBusy(key, true);
      setStatus(key, { kind: "pending", message: "Saving…" });
      try {
        const body = buildPutBody(draft, routeMetaFor(key).hasSummarizer);
        const data = await adminSend<RouteConfigResponse>(
          "PUT",
          `${ROUTES_API}/${encodeURIComponent(key)}`,
          body,
        );
        if (!mounted.current) return;
        replaceRoute(data);
        setStatus(key, { kind: "ok", message: `Saved · version ${data.version}` });
      } catch (err) {
        if (mounted.current) setStatus(key, { kind: "error", message: errorMessage(err) });
      } finally {
        if (mounted.current) setBusy(key, false);
      }
    },
    [drafts, replaceRoute, setBusy, setStatus],
  );

  const resetRoute = useCallback(
    async (key: string) => {
      setBusy(key, true);
      setStatus(key, { kind: "pending", message: "Resetting…" });
      try {
        const data = await adminSend<RouteConfigResponse>(
          "DELETE",
          `${ROUTES_API}/${encodeURIComponent(key)}`,
        );
        if (!mounted.current) return;
        replaceRoute(data);
        setStatus(key, { kind: "ok", message: "Defaults restored" });
      } catch (err) {
        if (mounted.current) setStatus(key, { kind: "error", message: errorMessage(err) });
      } finally {
        if (mounted.current) setBusy(key, false);
      }
    },
    [replaceRoute, setBusy, setStatus],
  );

  const resetAllRoutes = useCallback(async () => {
    setResetAllStatus({ kind: "pending", message: "Resetting all…" });
    try {
      const data = await adminSend<RoutesResponse>("DELETE", ROUTES_API);
      if (!mounted.current) return;
      applyRoutes(data.routes ?? []);
      setStatuses({});
      setResetAllStatus({
        kind: "ok",
        message: "All routes restored to code defaults",
      });
    } catch (err) {
      if (mounted.current) {
        setResetAllStatus({ kind: "error", message: errorMessage(err) });
      }
    }
  }, [applyRoutes]);

  return {
    loading,
    loadError,
    catalog,
    routes,
    drafts,
    statuses,
    busyKeys,
    resetAllStatus,
    reload: load,
    updateDraft,
    saveRoute,
    resetRoute,
    resetAllRoutes,
  };
}
