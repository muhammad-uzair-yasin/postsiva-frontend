"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { adminGet, adminSend } from "@/lib/admin/adminFetch";
import type {
  DisableWatchResponse,
  EnabledWatch,
  EnabledWatchesResponse,
  RunDetailResponse,
  WatchRun,
  WatchRunsResponse,
} from "@/lib/admin/commentWatchApi";
import { sortRunsByStartedAt } from "@/lib/admin/commentWatchApi";

const RUNS_LIMIT = 50;

interface ListState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Request failed";
}

/** Fetch-on-mount + manual reload; state updates only happen in promise callbacks. */
function useAdminList<T>(fetcher: (signal: AbortSignal) => Promise<T>) {
  const [state, setState] = useState<ListState<T>>({
    data: null,
    loading: true,
    error: null,
  });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetcher(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setState({ data, loading: false, error: null });
        }
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) {
          setState({ data: null, loading: false, error: errorMessage(err) });
        }
      });
    return () => controller.abort();
  }, [fetcher, tick]);

  const reload = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    setTick((t) => t + 1);
  }, []);

  return { ...state, reload };
}

const fetchEnabled = (signal: AbortSignal): Promise<EnabledWatch[]> =>
  adminGet<EnabledWatchesResponse>("/admin/api/comment-watch/enabled", signal).then(
    (res) => res.watches ?? [],
  );

export function useEnabledWatches() {
  const list = useAdminList(fetchEnabled);
  const { reload } = list;
  const [disablingId, setDisablingId] = useState<number | null>(null);

  const disableWatch = useCallback(
    async (watchId: number): Promise<string | null> => {
      setDisablingId(watchId);
      try {
        const res = await adminSend<DisableWatchResponse>(
          "POST",
          "/admin/api/comment-watch/disable",
          { watch_id: watchId },
        );
        if (!res.success) {
          return res.message || "Failed to disable";
        }
        reload();
        return null;
      } catch (err) {
        return errorMessage(err);
      } finally {
        setDisablingId(null);
      }
    },
    [reload],
  );

  return { ...list, disableWatch, disablingId };
}

const fetchRuns = (signal: AbortSignal): Promise<WatchRun[]> =>
  adminGet<WatchRunsResponse>(
    `/admin/api/comment-watch/runs?limit=${RUNS_LIMIT}`,
    signal,
  ).then((res) => sortRunsByStartedAt(res.runs ?? []));

export function useWatchRuns() {
  return useAdminList(fetchRuns);
}

interface RunDetailState {
  data: RunDetailResponse | null;
  loading: boolean;
  error: string | null;
}

/** Lazily fetches run details when a run row is expanded; caches per run id. */
export function useRunDetails() {
  const [details, setDetails] = useState<Record<number, RunDetailState>>({});
  const inFlight = useRef<Set<number>>(new Set());

  const loadDetail = useCallback(async (runId: number) => {
    if (inFlight.current.has(runId)) return;
    inFlight.current.add(runId);
    setDetails((d) => ({
      ...d,
      [runId]: { data: d[runId]?.data ?? null, loading: true, error: null },
    }));
    try {
      const res = await adminGet<RunDetailResponse>(
        `/admin/api/comment-watch/runs/${runId}`,
      );
      setDetails((d) => ({
        ...d,
        [runId]: res.success
          ? { data: res, loading: false, error: null }
          : { data: null, loading: false, error: res.message || "Not found" },
      }));
    } catch (err) {
      setDetails((d) => ({
        ...d,
        [runId]: { data: null, loading: false, error: errorMessage(err) },
      }));
    } finally {
      inFlight.current.delete(runId);
    }
  }, []);

  return { details, loadDetail };
}
