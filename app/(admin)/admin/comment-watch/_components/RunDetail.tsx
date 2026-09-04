"use client";

import { Loader2 } from "lucide-react";

import type { RunDetailResponse } from "@/lib/admin/commentWatchApi";
import {
  formatCount,
  parseErrorSummary,
  truncateId,
} from "@/lib/admin/commentWatchApi";

interface RunDetailState {
  data: RunDetailResponse | null;
  loading: boolean;
  error: string | null;
}

interface Props {
  state: RunDetailState | undefined;
}

const TH = "py-2 pr-4 text-left text-xs font-semibold text-on-surface-variant";

export function RunDetail({ state }: Props) {
  if (!state || (state.loading && !state.data)) {
    return (
      <div className="flex items-center gap-2 text-sm text-on-surface-variant">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading details…
      </div>
    );
  }
  if (state.error) {
    return <p className="text-sm text-error">{state.error}</p>;
  }

  const data = state.data;
  const summary = parseErrorSummary(data?.error_summary);
  const details = data?.details ?? [];

  if (!summary && details.length === 0) {
    return <p className="text-sm text-on-surface-variant">No details.</p>;
  }

  return (
    <div className="space-y-4 text-sm">
      {summary ? (
        <div>
          <p className="mb-1.5 font-semibold text-on-surface">Error summary</p>
          {"entries" in summary ? (
            <ul className="list-disc space-y-1 pl-5 text-on-surface-variant">
              {summary.entries.map((entry, i) => (
                <li key={`${entry.post_id}-${i}`}>
                  <span className="font-mono text-xs">{entry.post_id}</span>
                  {entry.post_id ? ": " : ""}
                  {entry.error}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-on-surface-variant">{summary.raw}</p>
          )}
        </div>
      ) : null}

      {details.length > 0 ? (
        <div>
          <p className="mb-1.5 font-semibold text-on-surface">Per-post details</p>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className={TH}>Post ID</th>
                  <th className={TH}>Status</th>
                  <th className={TH}>Comments</th>
                  <th className={TH}>Replies</th>
                  <th className={TH}>Error</th>
                </tr>
              </thead>
              <tbody>
                {details.map((d, i) => (
                  <tr key={`${d.post_id ?? "post"}-${i}`} className="border-t border-outline-variant/15">
                    <td
                      className="py-2 pr-4 font-mono text-xs text-on-surface-variant"
                      title={d.post_id ?? ""}
                    >
                      {truncateId(d.post_id, 40) || "—"}
                    </td>
                    <td
                      className={`py-2 pr-4 font-medium ${
                        d.status === "failed" ? "text-error" : "text-primary"
                      }`}
                    >
                      {d.status || "—"}
                    </td>
                    <td className="py-2 pr-4 text-on-surface-variant">
                      {formatCount(d.comments_fetched)}
                    </td>
                    <td className="py-2 pr-4 text-on-surface-variant">
                      {formatCount(d.replies_posted)} / {d.replies_failed ?? 0}
                    </td>
                    <td className="py-2 text-on-surface-variant">{d.error_message || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
