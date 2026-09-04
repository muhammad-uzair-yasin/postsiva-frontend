"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { adminGet, adminSend } from "@/lib/admin/adminFetch";
import {
  applyWorkerPatch,
  normalizePendingTasks,
  normalizeScheduledTasks,
  normalizeWorkerRunLogs,
  normalizeWorkerRunResult,
  normalizeWorkersStatus,
  scheduledTasksPath,
  workerConfigPatchPath,
  workerRunLogsPath,
  workerRunPath,
  WORKERS_PENDING_TASKS_PATH,
  WORKERS_STATUS_PATH,
  type PendingTask,
  type ScheduledTask,
  type WorkerConfigPatch,
  type WorkerEntry,
  type WorkerRunLog,
  type WorkerRunResult,
  type WorkersStatus,
} from "@/lib/admin/workersApi";

const SCHEDULED_TASKS_LIMIT = 100;
const RUN_LOGS_PAGE = 50;

export interface WorkersData {
  status: WorkersStatus | null;
  workers: WorkerEntry[];
  runLogs: WorkerRunLog[];
  runLogsTotal: number;
  runLogsHasMore: boolean;
  runLogWorkerFilter: string;
  runLogStatusFilter: string;
  scheduledTasks: ScheduledTask[];
  pendingTasks: PendingTask[];
  loading: boolean;
  loadingMoreLogs: boolean;
  refreshing: boolean;
  loadError: string | null;
  actionError: string | null;
  savingWorkerIds: ReadonlySet<string>;
  runningWorkerIds: ReadonlySet<string>;
  refresh: () => void;
  loadMoreLogs: () => void;
  setRunLogWorkerFilter: (value: string) => void;
  setRunLogStatusFilter: (value: string) => void;
  filterLogsByWorker: (workerId: string) => void;
  toggleWorker: (workerId: string, enabled: boolean) => Promise<void>;
  saveInterval: (workerId: string, intervalMinutes: number) => Promise<void>;
  runWorkerNow: (workerId: string) => Promise<WorkerRunResult>;
  clearActionError: () => void;
}

function errorMessage(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  return "Request failed";
}

export function useWorkersData(): WorkersData {
  const [status, setStatus] = useState<WorkersStatus | null>(null);
  const [workers, setWorkers] = useState<WorkerEntry[]>([]);
  const [runLogs, setRunLogs] = useState<WorkerRunLog[]>([]);
  const [runLogsTotal, setRunLogsTotal] = useState(0);
  const [runLogsOffset, setRunLogsOffset] = useState(0);
  const [runLogWorkerFilter, setRunLogWorkerFilter] = useState("");
  const [runLogStatusFilter, setRunLogStatusFilter] = useState("");
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMoreLogs, setLoadingMoreLogs] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [savingWorkerIds, setSavingWorkerIds] = useState<ReadonlySet<string>>(
    new Set(),
  );
  const [runningWorkerIds, setRunningWorkerIds] = useState<ReadonlySet<string>>(
    new Set(),
  );

  const generationRef = useRef(0);
  const workersRef = useRef<WorkerEntry[]>([]);
  workersRef.current = workers;

  const fetchRunLogs = useCallback(
    async (offset: number, append: boolean, signal?: AbortSignal) => {
      const raw = await adminGet<unknown>(
        workerRunLogsPath({
          worker_id: runLogWorkerFilter || undefined,
          status: runLogStatusFilter || undefined,
          limit: RUN_LOGS_PAGE,
          offset,
        }),
        signal,
      );
      const parsed = normalizeWorkerRunLogs(raw);
      setRunLogsTotal(parsed.total);
      setRunLogsOffset(offset + parsed.logs.length);
      setRunLogs((prev) => (append ? [...prev, ...parsed.logs] : parsed.logs));
    },
    [runLogWorkerFilter, runLogStatusFilter],
  );

  const loadAll = useCallback(async (signal?: AbortSignal) => {
    const generation = ++generationRef.current;
    setRefreshing(true);
    const [statusRes, scheduledRes, pendingRes] = await Promise.allSettled([
      adminGet<unknown>(WORKERS_STATUS_PATH, signal),
      adminGet<unknown>(scheduledTasksPath(SCHEDULED_TASKS_LIMIT), signal),
      adminGet<unknown>(WORKERS_PENDING_TASKS_PATH, signal),
    ]);
    if (generation !== generationRef.current || signal?.aborted) return;

    if (statusRes.status === "fulfilled") {
      const next = normalizeWorkersStatus(statusRes.value);
      setStatus(next);
      setWorkers(next.workers);
      setLoadError(next.error);
    } else {
      setLoadError(errorMessage(statusRes.reason));
    }
    if (scheduledRes.status === "fulfilled") {
      setScheduledTasks(normalizeScheduledTasks(scheduledRes.value));
    }
    if (pendingRes.status === "fulfilled") {
      setPendingTasks(normalizePendingTasks(pendingRes.value));
    }
    try {
      await fetchRunLogs(0, false, signal);
    } catch (err) {
      if (!signal?.aborted) {
        setLoadError(errorMessage(err));
      }
    }
    setLoading(false);
    setRefreshing(false);
  }, [fetchRunLogs]);

  useEffect(() => {
    const controller = new AbortController();
    void loadAll(controller.signal);
    return () => controller.abort();
  }, [loadAll]);

  const refresh = useCallback(() => {
    void loadAll();
  }, [loadAll]);

  const loadMoreLogs = useCallback(async () => {
    if (loadingMoreLogs || runLogs.length >= runLogsTotal) return;
    setLoadingMoreLogs(true);
    try {
      await fetchRunLogs(runLogsOffset, true);
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setLoadingMoreLogs(false);
    }
  }, [fetchRunLogs, loadingMoreLogs, runLogs.length, runLogsOffset, runLogsTotal]);

  const filterLogsByWorker = useCallback((workerId: string) => {
    setRunLogWorkerFilter(workerId);
    setRunLogStatusFilter("");
  }, []);

  const patchWorker = useCallback(
    async (workerId: string, patch: WorkerConfigPatch) => {
      const previous = workersRef.current;
      setActionError(null);
      setSavingWorkerIds((ids) => new Set(ids).add(workerId));
      setWorkers(applyWorkerPatch(previous, workerId, patch));
      try {
        await adminSend("PATCH", workerConfigPatchPath(workerId), patch);
      } catch (err) {
        setWorkers(previous);
        setActionError(errorMessage(err));
      } finally {
        setSavingWorkerIds((ids) => {
          const next = new Set(ids);
          next.delete(workerId);
          return next;
        });
      }
    },
    [],
  );

  const toggleWorker = useCallback(
    (workerId: string, enabled: boolean) => patchWorker(workerId, { enabled }),
    [patchWorker],
  );

  const saveInterval = useCallback(
    (workerId: string, intervalMinutes: number) =>
      patchWorker(workerId, { interval_minutes: intervalMinutes }),
    [patchWorker],
  );

  const runWorkerNow = useCallback(
    async (workerId: string): Promise<WorkerRunResult> => {
      setRunningWorkerIds((ids) => new Set(ids).add(workerId));
      setActionError(null);
      try {
        const raw = await adminSend<unknown>("POST", workerRunPath(workerId));
        const result = normalizeWorkerRunResult(raw);
        await loadAll();
        return result;
      } catch (err) {
        const message = errorMessage(err);
        setActionError(message);
        return { ok: false, error: message, worker_id: workerId };
      } finally {
        setRunningWorkerIds((ids) => {
          const next = new Set(ids);
          next.delete(workerId);
          return next;
        });
      }
    },
    [loadAll],
  );

  const clearActionError = useCallback(() => setActionError(null), []);

  return {
    status,
    workers,
    runLogs,
    runLogsTotal,
    runLogsHasMore: runLogs.length < runLogsTotal,
    runLogWorkerFilter,
    runLogStatusFilter,
    scheduledTasks,
    pendingTasks,
    loading,
    loadingMoreLogs,
    refreshing,
    loadError,
    actionError,
    savingWorkerIds,
    runningWorkerIds,
    refresh,
    loadMoreLogs,
    setRunLogWorkerFilter,
    setRunLogStatusFilter,
    filterLogsByWorker,
    toggleWorker,
    saveInterval,
    runWorkerNow,
    clearActionError,
  };
}
