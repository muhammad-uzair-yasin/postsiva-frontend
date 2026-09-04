"use client";

import { useRef } from "react";
import Link from "next/link";
import { AlertTriangle, CalendarClock, RefreshCw, X } from "lucide-react";

import { useWorkersData } from "../_hooks/useWorkersData";
import { WorkerStatusCards } from "./WorkerStatusCards";
import { WorkersConfigTable } from "./WorkersConfigTable";
import { WorkersRunLogsTable } from "./WorkersRunLogsTable";
import { PendingTasksCard } from "./WorkersTaskTables";

export function WorkersScreen() {
  const logsSectionRef = useRef<HTMLElement>(null);
  const {
    status,
    workers,
    runLogs,
    runLogsTotal,
    runLogsHasMore,
    runLogWorkerFilter,
    runLogStatusFilter,
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
  } = useWorkersData();

  const errorBanner = loadError ?? actionError;

  const scrollToLogs = () => {
    logsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="w-full min-w-0 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-on-surface">Workers</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Manage all background jobs: enable/disable, tune intervals, run manually, and
            review full execution history.
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold disabled:opacity-60"
        >
          <RefreshCw className={["h-4 w-4", refreshing ? "animate-spin" : ""].join(" ")} />
          Refresh
        </button>
      </div>

      {errorBanner ? (
        <div className="flex items-start justify-between gap-3 rounded-2xl border border-error/40 bg-error-container/20 px-4 py-3">
          <div className="flex items-start gap-2 text-sm text-on-error-container">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{errorBanner}</span>
          </div>
          {actionError ? (
            <button type="button" onClick={clearActionError} className="rounded-lg p-1">
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      ) : null}

      <WorkerStatusCards status={status} pendingCount={pendingTasks.length} loading={loading} />

      <WorkersConfigTable
        workers={workers}
        loading={loading}
        savingWorkerIds={savingWorkerIds}
        runningWorkerIds={runningWorkerIds}
        onToggle={(id, enabled) => void toggleWorker(id, enabled)}
        onSaveInterval={(id, minutes) => void saveInterval(id, minutes)}
        onRunNow={(id) => void runWorkerNow(id)}
        onViewHistory={(id) => {
          filterLogsByWorker(id);
          scrollToLogs();
        }}
      />

      <section ref={logsSectionRef}>
        <WorkersRunLogsTable
          workers={workers}
          logs={runLogs}
          total={runLogsTotal}
          hasMore={runLogsHasMore}
          loading={loading}
          loadingMore={loadingMoreLogs}
          workerFilter={runLogWorkerFilter}
          statusFilter={runLogStatusFilter}
          onWorkerFilterChange={setRunLogWorkerFilter}
          onStatusFilterChange={setRunLogStatusFilter}
          onLoadMore={() => void loadMoreLogs()}
        />
      </section>

      <section className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-on-surface">Scheduled posts</h3>
            <p className="mt-0.5 text-xs text-on-surface-variant">
              All users — cancel or force publish for testing.
            </p>
          </div>
          <Link
            href="/admin/scheduled-posts"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-on-primary"
          >
            <CalendarClock className="h-4 w-4" />
            Open scheduled posts
          </Link>
        </div>
      </section>

      <PendingTasksCard tasks={pendingTasks} loading={loading} />
    </div>
  );
}
