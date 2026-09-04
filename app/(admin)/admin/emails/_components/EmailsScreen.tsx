"use client";

import { Loader2, Mail, RefreshCw, Search, Tags, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  EMAILS_MAX_DAYS,
  EMAILS_MAX_RECENT_LIMIT,
  formatStat,
  periodLabel,
} from "@/lib/admin/emailsApi";

import { useEmailAnalytics } from "../_hooks/useEmailAnalytics";
import { EmailsByKindTable, RecentEmailsTable } from "./EmailsTables";

const INPUT_CLASSES =
  "w-24 rounded-xl border border-outline-variant/25 bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40";

function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-4">
      <div className="flex items-center gap-2 text-on-surface-variant">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-black text-on-surface">{value}</p>
    </div>
  );
}

/** Outbound email analytics: window selector, aggregates, by-kind + recent tables. */
export function EmailsScreen() {
  const analytics = useEmailAnalytics();
  const { data, loading, error } = analytics;

  return (
    <div className="w-full min-w-0">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-on-surface">Email analytics</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Outbound email volume from the delivery log
            {data ? ` · ${periodLabel(data.period_start_utc)}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-xs font-semibold text-on-surface-variant">
            Days
            <input
              type="number"
              min={1}
              max={EMAILS_MAX_DAYS}
              value={analytics.daysInput}
              onChange={(e) => analytics.setDaysInput(e.target.value)}
              className={INPUT_CLASSES}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-on-surface-variant">
            Recent rows
            <input
              type="number"
              min={1}
              max={EMAILS_MAX_RECENT_LIMIT}
              value={analytics.recentLimitInput}
              onChange={(e) => analytics.setRecentLimitInput(e.target.value)}
              className={INPUT_CLASSES}
            />
          </label>
          <button
            type="button"
            onClick={analytics.apply}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-on-primary"
          >
            <Search className="h-4 w-4" />
            Apply
          </button>
          <button
            type="button"
            onClick={analytics.refresh}
            className="inline-flex items-center gap-1.5 rounded-xl border border-outline-variant/25 bg-surface-container px-4 py-2 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-high"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm text-error">
          {error}
        </div>
      ) : null}

      {loading && !data ? (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-outline-variant/20 bg-surface-container-low px-4 py-6">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm text-on-surface-variant">Loading email analytics…</span>
        </div>
      ) : data ? (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <StatTile
              icon={Mail}
              label={`Emails sent (${data.days}d)`}
              value={formatStat(data.total_emails_sent)}
            />
            <StatTile
              icon={Users}
              label="Unique recipients"
              value={formatStat(data.unique_recipient_emails)}
            />
            <StatTile
              icon={Tags}
              label="Distinct kinds"
              value={formatStat(data.distinct_email_kinds)}
            />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <section className="rounded-2xl border border-outline-variant/20 bg-surface-container-low">
              <h2 className="border-b border-outline-variant/20 px-4 py-3 text-sm font-bold text-on-surface">
                Sends by kind
              </h2>
              <EmailsByKindTable rows={data.by_kind} />
            </section>
            <section className="rounded-2xl border border-outline-variant/20 bg-surface-container-low">
              <h2 className="border-b border-outline-variant/20 px-4 py-3 text-sm font-bold text-on-surface">
                Recent sends
              </h2>
              <RecentEmailsTable rows={data.recent} />
            </section>
          </div>
        </>
      ) : null}
    </div>
  );
}
