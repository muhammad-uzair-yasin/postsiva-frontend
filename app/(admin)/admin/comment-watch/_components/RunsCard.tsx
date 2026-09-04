"use client";

import { Fragment, useState } from "react";
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";

import type { WatchRun } from "@/lib/admin/commentWatchApi";
import {
  formatCount,
  formatRunPosts,
  formatWatchDate,
  runStatusTone,
} from "@/lib/admin/commentWatchApi";
import { useRunDetails } from "../_hooks/useCommentWatch";
import { RunDetail } from "./RunDetail";

interface Props {
  runs: WatchRun[] | null;
  loading: boolean;
  error: string | null;
}

const TH = "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant";
const TD = "px-4 py-3 text-sm";

const STATUS_BADGE: Record<ReturnType<typeof runStatusTone>, string> = {
  success: "bg-primary/10 text-primary",
  error: "bg-error-container text-on-error-container",
  pending: "bg-surface-container-high text-on-surface-variant",
};

export function RunsCard({ runs, loading, error }: Props) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const { details, loadDetail } = useRunDetails();

  const toggleRun = (runId: number) => {
    const willOpen = !expanded.has(runId);
    setExpanded((prev) => {
      const next = new Set(prev);
      if (willOpen) {
        next.add(runId);
      } else {
        next.delete(runId);
      }
      return next;
    });
    if (willOpen) void loadDetail(runId);
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-low">
      <div className="border-b border-outline-variant/20 px-4 py-3">
        <h2 className="text-base font-bold text-on-surface">Watcher runs &amp; logs</h2>
      </div>

      {loading && !runs ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-on-surface-variant">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : error ? (
        <div className="px-4 py-8 text-center text-sm text-error">Error: {error}</div>
      ) : !runs || runs.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-on-surface-variant">
          No runs yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-outline-variant/20">
              <tr>
                <th className={`${TH} w-8`} aria-label="Expand" />
                <th className={TH}>Started</th>
                <th className={TH}>Status</th>
                <th className={TH}>Posts</th>
                <th className={TH}>Replies posted</th>
                <th className={TH}>Replies failed</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => {
                const isOpen = expanded.has(run.id);
                const tone = runStatusTone(run.status);
                return (
                  <Fragment key={run.id}>
                    <tr
                      onClick={() => toggleRun(run.id)}
                      className="cursor-pointer border-b border-outline-variant/10 last:border-b-0 hover:bg-surface-container"
                    >
                      <td className={`${TD} text-on-surface-variant`}>
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </td>
                      <td className={`${TD} text-on-surface-variant`}>
                        {formatWatchDate(run.started_at)}
                      </td>
                      <td className={TD}>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE[tone]}`}
                        >
                          {run.status || "—"}
                        </span>
                      </td>
                      <td className={`${TD} text-on-surface-variant`}>{formatRunPosts(run)}</td>
                      <td className={`${TD} text-on-surface-variant`}>
                        {formatCount(run.total_replies_posted)}
                      </td>
                      <td className={`${TD} text-on-surface-variant`}>
                        {formatCount(run.total_replies_failed)}
                      </td>
                    </tr>
                    {isOpen ? (
                      <tr className="border-b border-outline-variant/10 bg-surface-container/60">
                        <td colSpan={6} className="px-4 py-4">
                          <RunDetail state={details[run.id]} />
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
