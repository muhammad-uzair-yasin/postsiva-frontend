"use client";

import { useState } from "react";
import { CalendarClock, Loader2, RefreshCw, Search } from "lucide-react";

import {
  canCancelScheduledPost,
  canPublishNowScheduledPost,
  scheduledPostStatusTone,
} from "@/lib/admin/scheduledPostsClient";
import { formatDateTime } from "@/lib/admin/workersApi";
import { adminFieldClass, adminOptionClass } from "../../_components/adminFormStyles";
import { useAdminScheduledPosts } from "../_hooks/useAdminScheduledPosts";

export function ScheduledPostsScreen() {
  const {
    rows,
    total,
    status,
    search,
    loading,
    actingId,
    error,
    message,
    setStatus,
    setSearch,
    load,
    cancelPost,
    publishNow,
  } = useAdminScheduledPosts();

  const [searchInput, setSearchInput] = useState(search);

  return (
    <div className="min-w-0 max-w-full space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarClock className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-on-surface">Scheduled posts (all users)</h1>
          </div>
          <p className="mt-1 text-sm text-on-surface-variant">
            View every scheduled post across the platform. Cancel or force publish now to test.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </header>

      {error ? (
        <div className="rounded-xl border border-error/40 bg-error-container/20 px-4 py-3 text-sm text-error">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      <form
        className="flex flex-wrap items-center gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          setSearch(searchInput);
        }}
      >
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search email, platform, post id…"
            className={`w-full ${adminFieldClass} py-2 pl-9 pr-3`}
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={adminFieldClass}
        >
          <option value="" className={adminOptionClass}>All statuses</option>
          <option value="scheduled" className={adminOptionClass}>Scheduled</option>
          <option value="publishing" className={adminOptionClass}>Publishing</option>
          <option value="failed" className={adminOptionClass}>Failed</option>
          <option value="cancelled" className={adminOptionClass}>Cancelled</option>
          <option value="published" className={adminOptionClass}>Published</option>
        </select>
        <button type="submit" className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary">
          Search
        </button>
      </form>

      <section className="min-w-0 max-w-full rounded-2xl border border-outline-variant/20 bg-surface-container-low p-4">
        <h2 className="text-sm font-bold text-on-surface">Posts ({total})</h2>
        {loading ? (
          <div className="flex items-center gap-2 py-10 text-sm text-on-surface-variant">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : rows.length === 0 ? (
          <p className="py-10 text-sm text-on-surface-variant">No scheduled posts match filters.</p>
        ) : (
          <div className="mt-3 w-full max-w-full overflow-x-auto">
            <table className="w-max min-w-full text-left text-sm">
              <thead>
                <tr className="border-b text-xs font-semibold uppercase text-on-surface-variant">
                  <th className="px-3 py-2">User</th>
                  <th className="px-3 py-2">Workspace</th>
                  <th className="px-3 py-2">Platform</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Scheduled</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Preview</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const busy = actingId === row.scheduled_post_id;
                  return (
                    <tr key={row.scheduled_post_id} className="border-b align-top hover:bg-surface-container">
                      <td className="px-3 py-3">
                        <p className="font-semibold">{row.user_name || "—"}</p>
                        <p className="text-xs text-on-surface-variant">{row.user_email}</p>
                      </td>
                      <td className="px-3 py-3 text-xs">
                        <p>{row.workspace_name || "—"}</p>
                        <p className="font-mono text-on-surface-variant">{row.workspace_id.slice(0, 8)}…</p>
                      </td>
                      <td className="px-3 py-3 capitalize">{row.platform}</td>
                      <td className="px-3 py-3">{row.post_type}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-on-surface-variant">
                        {formatDateTime(row.scheduled_time)}
                      </td>
                      <td className={`px-3 py-3 font-semibold ${scheduledPostStatusTone(row.status)}`}>
                        {row.status}
                        {row.error_message ? (
                          <p className="mt-1 text-xs font-normal text-error">{row.error_message.slice(0, 80)}</p>
                        ) : null}
                      </td>
                      <td className="px-3 py-3 max-w-[200px] text-xs text-on-surface-variant">
                        {row.caption_preview || "—"}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-1">
                          {canPublishNowScheduledPost(row.status) ? (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => void publishNow(row.scheduled_post_id)}
                              className="rounded-lg bg-primary px-2 py-1 text-xs font-bold text-on-primary disabled:opacity-50"
                            >
                              {busy ? "…" : "Publish now"}
                            </button>
                          ) : null}
                          {canCancelScheduledPost(row.status) ? (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => void cancelPost(row.scheduled_post_id)}
                              className="rounded-lg border px-2 py-1 text-xs font-semibold disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
