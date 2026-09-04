"use client";

import { useState } from "react";
import { LineChart, Loader2, RefreshCw, Search } from "lucide-react";

import { InsightsSnapshotDetailPanel } from "./InsightsSnapshotDetailPanel";
import { useInsightsSnapshots } from "../_hooks/useInsightsSnapshots";

export function InsightsSnapshotsScreen({ embedded = false }: { embedded?: boolean }) {
  const {
    rows,
    total,
    search,
    insightsOnly,
    loading,
    error,
    selectedId,
    detail,
    detailLoading,
    saving,
    setSearch,
    setInsightsOnly,
    setDetail,
    loadList,
    selectUser,
    saveDetail,
  } = useInsightsSnapshots();

  const [searchInput, setSearchInput] = useState(search);

  return (
    <div className={embedded ? "space-y-6" : "space-y-6 p-6"}>
      {embedded ? null : (
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <LineChart className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-on-surface">Insights snapshot access</h1>
          </div>
          <p className="mt-1 text-sm text-on-surface-variant">
            Enable daily insight snapshots per user. Default: all workspaces and channels. Restrict
            by workspace, platform, LinkedIn personal/page, or Facebook page.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadList()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </header>
      )}

      {error ? (
        <div className="rounded-xl border border-error/40 bg-error-container/20 px-4 py-3 text-sm text-error">
          {error}
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
            placeholder="Search by email or name…"
            className="w-full rounded-xl border py-2 pl-9 pr-3 text-sm"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={insightsOnly}
            onChange={(e) => setInsightsOnly(e.target.checked)}
          />
          Enabled only
        </label>
        <button type="submit" className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary">
          Search
        </button>
      </form>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-4">
          <h2 className="text-sm font-bold text-on-surface">Users ({total})</h2>
          {loading ? (
            <div className="flex items-center gap-2 py-8 text-sm text-on-surface-variant">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : (
            <ul className="mt-3 max-h-[520px] divide-y overflow-y-auto">
              {rows.map((row) => (
                <li key={row.user_id}>
                  <button
                    type="button"
                    onClick={() => void selectUser(row.user_id)}
                    className={[
                      "w-full px-3 py-3 text-left transition hover:bg-surface-container",
                      selectedId === row.user_id ? "bg-primary/10" : "",
                    ].join(" ")}
                  >
                    <p className="font-semibold text-on-surface">{row.full_name}</p>
                    <p className="text-xs text-on-surface-variant">{row.email}</p>
                    <p className="mt-1 text-xs">
                      <span
                        className={
                          row.insights_enabled ? "text-emerald-600 font-semibold" : "text-on-surface-variant"
                        }
                      >
                        {row.insights_enabled ? "Enabled" : "Off"}
                      </span>
                      {" · "}
                      {row.scope_summary}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          {detailLoading ? (
            <div className="flex items-center gap-2 py-12 text-sm text-on-surface-variant">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading user…
            </div>
          ) : detail ? (
            <InsightsSnapshotDetailPanel
              detail={detail}
              saving={saving}
              onChange={setDetail}
              onSave={() => void saveDetail()}
            />
          ) : (
            <p className="py-12 text-sm text-on-surface-variant">Select a user to configure access.</p>
          )}
        </section>
      </div>
    </div>
  );
}
