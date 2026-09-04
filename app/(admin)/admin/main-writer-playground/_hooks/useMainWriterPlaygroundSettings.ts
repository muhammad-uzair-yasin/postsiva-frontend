"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { adminGet, adminSend } from "@/lib/admin/adminFetch";
import {
  buildPutBody,
  type CatalogProvider,
  draftFromConfig,
  isDraftDirty,
  type ProviderCatalogResponse,
  type RouteConfigResponse,
  type RouteDraft,
  routeMetaFor,
} from "@/lib/admin/aiManagerApi";
import {
  activateSystemPromptVersion,
  getSystemPrompt,
  listSystemPromptVersions,
  resetSystemPrompt,
  saveSystemPromptVersion,
  type SystemPromptDetail,
  type SystemPromptVersionItem,
} from "@/lib/admin/systemPromptsApi";

import { MAIN_WRITER_PROMPT_KEY, MAIN_WRITER_ROUTE_KEY } from "../_data/keys";

const ROUTES_API = "/admin/api/ai/manager/routes";
const CATALOG_API = "/admin/api/ai/providers/catalog";

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Request failed";
}

export function useMainWriterPlaygroundSettings() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [catalog, setCatalog] = useState<CatalogProvider[]>([]);
  const [route, setRoute] = useState<RouteConfigResponse | null>(null);
  const [routeDraft, setRouteDraft] = useState<RouteDraft | null>(null);
  const [detail, setDetail] = useState<SystemPromptDetail | null>(null);
  const [versions, setVersions] = useState<SystemPromptVersionItem[]>([]);
  const [promptDraft, setPromptDraft] = useState("");
  const [promptNote, setPromptNote] = useState("");
  const [promptBusy, setPromptBusy] = useState(false);
  const [routeBusy, setRouteBusy] = useState(false);
  const [promptStatus, setPromptStatus] = useState<string | null>(null);
  const [routeStatus, setRouteStatus] = useState<string | null>(null);
  const [promptStatusError, setPromptStatusError] = useState(false);
  const [routeStatusError, setRouteStatusError] = useState(false);
  const mounted = useRef(true);

  const loadPrompt = useCallback(async () => {
    const [promptDetail, versionList] = await Promise.all([
      getSystemPrompt(MAIN_WRITER_PROMPT_KEY),
      listSystemPromptVersions(MAIN_WRITER_PROMPT_KEY),
    ]);
    if (!mounted.current) return;
    setDetail(promptDetail);
    setPromptDraft(promptDetail.body);
    setPromptNote("");
    setVersions(versionList.versions ?? []);
  }, []);

  const loadRoute = useCallback(async () => {
    const routeDetail = await adminGet<RouteConfigResponse>(
      `${ROUTES_API}/${encodeURIComponent(MAIN_WRITER_ROUTE_KEY)}`,
    );
    if (!mounted.current) return;
    setRoute(routeDetail);
    setRouteDraft(
      draftFromConfig(routeDetail.config, routeMetaFor(MAIN_WRITER_ROUTE_KEY).hasSummarizer),
    );
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const catalogResponse = await adminGet<ProviderCatalogResponse>(CATALOG_API);
      if (!mounted.current) return;
      setCatalog(catalogResponse.providers ?? []);
      await Promise.all([loadPrompt(), loadRoute()]);
    } catch (err) {
      if (mounted.current) setLoadError(errorMessage(err));
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [loadPrompt, loadRoute]);

  useEffect(() => {
    mounted.current = true;
    void reload();
    return () => {
      mounted.current = false;
    };
  }, [reload]);

  const savePrompt = useCallback(async () => {
    setPromptBusy(true);
    setPromptStatus(null);
    try {
      await saveSystemPromptVersion(
        MAIN_WRITER_PROMPT_KEY,
        promptDraft,
        promptNote.trim() || undefined,
      );
      setPromptStatus("Saved as new active version.");
      setPromptStatusError(false);
      await loadPrompt();
    } catch (err) {
      setPromptStatus(errorMessage(err));
      setPromptStatusError(true);
    } finally {
      setPromptBusy(false);
    }
  }, [loadPrompt, promptDraft, promptNote]);

  const activatePromptVersion = useCallback(
    async (versionId: number) => {
      setPromptBusy(true);
      setPromptStatus(null);
      try {
        await activateSystemPromptVersion(MAIN_WRITER_PROMPT_KEY, versionId);
        setPromptStatus("Activated version.");
        setPromptStatusError(false);
        await loadPrompt();
      } catch (err) {
        setPromptStatus(errorMessage(err));
        setPromptStatusError(true);
      } finally {
        setPromptBusy(false);
      }
    },
    [loadPrompt],
  );

  const resetPrompt = useCallback(async () => {
    setPromptBusy(true);
    setPromptStatus(null);
    try {
      await resetSystemPrompt(MAIN_WRITER_PROMPT_KEY);
      setPromptStatus("Reset to code default.");
      setPromptStatusError(false);
      await loadPrompt();
    } catch (err) {
      setPromptStatus(errorMessage(err));
      setPromptStatusError(true);
    } finally {
      setPromptBusy(false);
    }
  }, [loadPrompt]);

  const saveRoute = useCallback(async () => {
    if (!routeDraft) return;
    setRouteBusy(true);
    setRouteStatus(null);
    try {
      const body = buildPutBody(
        routeDraft,
        routeMetaFor(MAIN_WRITER_ROUTE_KEY).hasSummarizer,
      );
      const updated = await adminSend<RouteConfigResponse>(
        "PUT",
        `${ROUTES_API}/${encodeURIComponent(MAIN_WRITER_ROUTE_KEY)}`,
        body,
      );
      if (!mounted.current) return;
      setRoute(updated);
      setRouteDraft(
        draftFromConfig(updated.config, routeMetaFor(MAIN_WRITER_ROUTE_KEY).hasSummarizer),
      );
      setRouteStatus(`Saved · version ${updated.version}`);
      setRouteStatusError(false);
    } catch (err) {
      setRouteStatus(errorMessage(err));
      setRouteStatusError(true);
    } finally {
      setRouteBusy(false);
    }
  }, [routeDraft]);

  const resetRoute = useCallback(async () => {
    setRouteBusy(true);
    setRouteStatus(null);
    try {
      const updated = await adminSend<RouteConfigResponse>(
        "DELETE",
        `${ROUTES_API}/${encodeURIComponent(MAIN_WRITER_ROUTE_KEY)}`,
      );
      if (!mounted.current) return;
      setRoute(updated);
      setRouteDraft(
        draftFromConfig(updated.config, routeMetaFor(MAIN_WRITER_ROUTE_KEY).hasSummarizer),
      );
      setRouteStatus("Defaults restored");
      setRouteStatusError(false);
    } catch (err) {
      setRouteStatus(errorMessage(err));
      setRouteStatusError(true);
    } finally {
      setRouteBusy(false);
    }
  }, []);

  const routeDirty =
    routeDraft && route
      ? isDraftDirty(
          routeDraft,
          route.config,
          routeMetaFor(MAIN_WRITER_ROUTE_KEY).hasSummarizer,
        )
      : false;

  const promptDirty = detail ? promptDraft !== detail.body : false;

  return {
    loading,
    loadError,
    reload,
    catalog,
    route,
    routeDraft,
    setRouteDraft,
    routeDirty,
    routeBusy,
    routeStatus,
    routeStatusError,
    saveRoute,
    resetRoute,
    detail,
    versions,
    promptDraft,
    setPromptDraft,
    promptNote,
    setPromptNote,
    promptDirty,
    promptBusy,
    promptStatus,
    promptStatusError,
    savePrompt,
    activatePromptVersion,
    resetPrompt,
  };
}
