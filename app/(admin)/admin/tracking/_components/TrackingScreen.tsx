"use client";

import { useState } from "react";
import { AlertTriangle, BarChart3, CheckCircle2, Loader2, RefreshCw, X } from "lucide-react";

import {
  BULK_RECIPIENT_LIMIT,
  formatCount,
  statTiles,
  usageMixBars,
} from "@/lib/admin/trackingApi";

import { useFeedbackEmail } from "../_hooks/useFeedbackEmail";
import { useTrackingDashboard } from "../_hooks/useTrackingDashboard";
import { FeedbackEmailModal } from "./FeedbackEmailModal";
import { ChartCard, HBarChart, TrackingVizStyle } from "./TrackingCharts";
import { TrackingPerUserTable } from "./TrackingPerUserTable";

export function TrackingScreen() {
  const { data, loading, error, refresh } = useTrackingDashboard();
  const feedback = useFeedbackEmail();
  const [selected, setSelected] = useState<string[]>([]);
  const [limitNotice, setLimitNotice] = useState<string | null>(null);

  const openBulk = () => {
    if (selected.length > BULK_RECIPIENT_LIMIT) {
      setLimitNotice(`Select at most ${BULK_RECIPIENT_LIMIT} users at a time.`);
      return;
    }
    setLimitNotice(null);
    feedback.openBulk(selected);
  };

  const handleSend = async (message: string) => {
    const ok = await feedback.send(message);
    if (ok) setSelected([]);
  };

  return (
    <div className="admin-tracking-viz w-full min-w-0 space-y-6">
      <TrackingVizStyle />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-on-surface">
            <BarChart3 className="h-5 w-5 text-primary" />
            Usage &amp; tracking
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Workspace counters and authenticated API route hits
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-on-primary disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {feedback.lastResult ? (
        <div className="flex items-start justify-between gap-3 rounded-2xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm">
          <span className="flex items-start gap-2 whitespace-pre-wrap text-on-surface">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            {feedback.lastResult}
          </span>
          <button
            type="button"
            onClick={feedback.dismissResult}
            className="rounded-lg p-1 text-on-surface-variant hover:bg-surface-container-high"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}
      {limitNotice ? (
        <p className="flex items-center gap-2 rounded-2xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm text-error">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {limitNotice}
        </p>
      ) : null}

      {error ? (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-outline-variant/20 bg-surface-container-low px-4 py-6 text-sm">
          <span className="flex items-center gap-2 text-error">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </span>
          <button
            type="button"
            onClick={refresh}
            className="rounded-xl border border-outline-variant/25 bg-surface-container px-3 py-1.5 text-xs font-bold text-on-surface hover:bg-surface-container-high"
          >
            Retry
          </button>
        </div>
      ) : null}

      {loading && !data ? (
        <div
          className="flex items-center gap-3 rounded-2xl border border-outline-variant/20 bg-surface-container-low px-4 py-10"
          aria-busy
        >
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm text-on-surface-variant">
            Loading tracking dashboard…
          </span>
        </div>
      ) : null}

      {data ? (
        <>
          <section aria-label="Totals" className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {statTiles(data).map((tile) => (
              <div
                key={tile.label}
                className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-4"
              >
                <p className="text-[11px] font-medium text-on-surface-variant">
                  {tile.label}
                </p>
                <p className="mt-1 text-2xl font-bold text-on-surface">
                  {formatCount(tile.value)}
                </p>
              </div>
            ))}
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard
              title="Top API routes"
              subtitle="Hits per route key, highest first"
            >
              <HBarChart
                data={data.top_route_keys.map((t) => ({
                  label: t.route_key,
                  value: t.hit_count ?? 0,
                }))}
                labelWidth={230}
                emptyText="No API route data yet"
              />
            </ChartCard>
            <ChartCard
              title="Workspace activity mix"
              subtitle="Aggregated workspace_usage counters, all users"
            >
              <HBarChart
                data={usageMixBars(data.workspace_usage_totals)}
                labelWidth={150}
                emptyText="No workspace activity yet"
              />
            </ChartCard>
          </div>

          <TrackingPerUserTable
            rows={data.per_user}
            selected={selected}
            onSelectedChange={setSelected}
            onEmailUser={feedback.openSingle}
            onEmailSelected={openBulk}
          />
        </>
      ) : null}

      {feedback.target ? (
        <FeedbackEmailModal
          target={feedback.target}
          rows={data?.per_user ?? []}
          sending={feedback.sending}
          error={feedback.error}
          onCancel={feedback.close}
          onSend={handleSend}
        />
      ) : null}
    </div>
  );
}
