"use client";

import { MessageSquareText, RefreshCw } from "lucide-react";

import {
  useEnabledWatches,
  useWatchRuns,
} from "../_hooks/useCommentWatch";
import { EnabledWatchesCard } from "./EnabledWatchesCard";
import { RunsCard } from "./RunsCard";

export function CommentWatchScreen() {
  const enabled = useEnabledWatches();
  const runs = useWatchRuns();
  const refreshing = enabled.loading || runs.loading;

  const handleRefresh = () => {
    void enabled.reload();
    void runs.reload();
  };

  return (
    <div className="w-full min-w-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-on-surface">
            <MessageSquareText className="h-5 w-5 text-primary" />
            LinkedIn AI Comment Watch
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            View all enabled posts, full watcher logs, and disable watches
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-on-primary transition-opacity disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="mt-6 space-y-6">
        <EnabledWatchesCard
          watches={enabled.data}
          loading={enabled.loading}
          error={enabled.error}
          disablingId={enabled.disablingId}
          onDisable={enabled.disableWatch}
        />
        <RunsCard runs={runs.data} loading={runs.loading} error={runs.error} />
      </div>
    </div>
  );
}
